"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { db } from "@/db";
import { applications, scholarships, scholarshipMatches } from "@/db/schema";
import type { StatusHistoryEntry } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { sendStatusChangeEmail } from "@/lib/email/send/status-change";
import { ensureUserRow } from "@/lib/ensure-user";
import { recordConversion } from "@/lib/analytics/server";

const STATUS_LABELS: Record<string, string> = {
  saved:       "Added to Tracker",
  in_progress: "Moved to In Progress",
  submitted:   "Submitted",
  won:         "Marked as Won",
  lost:        "Marked as Lost",
  skipped:     "Marked as Skipped",
};

function validateId(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2_147_483_647) {
    throw new Error("Invalid tracker item");
  }
}

/** Secondary work must not turn a completed tracker write into a failed save. */
function afterTrackerWrite(work: () => Promise<unknown>) {
  try {
    after(async () => {
      try {
        await work();
      } catch (error) {
        console.error("[tracker] Follow-up failed:", error);
      }
    });
  } catch (error) {
    console.error("[tracker] Could not schedule follow-up:", error);
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getApplications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select({
      id:                        applications.id,
      userId:                    applications.userId,
      scholarshipId:             applications.scholarshipId,
      status:                    applications.status,
      appliedAt:                 applications.appliedAt,
      deadline:                  applications.deadline,
      awardAmount:               applications.awardAmount,
      notes:                     applications.notes,
      essayDraftIds:             applications.essayDraftIds,
      reminderSent:              applications.reminderSent,
      statusHistory:             applications.statusHistory,
      checklist:                 applications.checklist,
      createdAt:                 applications.createdAt,
      updatedAt:                 applications.updatedAt,
      scholarshipName:           scholarships.name,
      scholarshipProvider:       scholarships.provider,
      scholarshipAmountMin:      scholarships.amountMin,
      scholarshipAmountMax:      scholarships.amountMax,
      scholarshipApplicationUrl: scholarships.applicationUrl,
      scholarshipSlug:           scholarships.slug,
      scholarshipSource:         scholarships.source,
      scholarshipIsActive:       scholarships.isActive,
      scholarshipAmountType:     scholarships.amountType,
      scholarshipDescription:    scholarships.description,
      evScore:                   scholarshipMatches.evScore,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .leftJoin(
      scholarshipMatches,
      and(
        eq(scholarshipMatches.scholarshipId, applications.scholarshipId),
        eq(scholarshipMatches.userId, userId),
      ),
    )
    .where(eq(applications.userId, userId))
    .orderBy(applications.createdAt);
}

export type ApplicationRow = Awaited<ReturnType<typeof getApplications>>[number];

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function saveToTracker(scholarshipId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  validateId(scholarshipId);

  const initialHistory: StatusHistoryEntry[] = [
    { status: "saved", at: new Date().toISOString(), label: STATUS_LABELS.saved },
  ];

  // Carry the scholarship's deadline onto the tracked row so the tracker,
  // deadlines page and reminders see it without another join.
  const [sch] = await db
    .select({ deadline: scholarships.deadline })
    .from(scholarships)
    .where(eq(scholarships.id, scholarshipId))
    .limit(1);

  if (!sch) throw new Error("Scholarship not found");
  await ensureUserRow(userId);

  // Upsert into applications (do nothing if already tracked)
  const inserted = await db
    .insert(applications)
    .values({
      userId,
      scholarshipId,
      status: "saved",
      deadline: sch.deadline ?? null,
      statusHistory: initialHistory,
    })
    .onConflictDoNothing({ target: [applications.userId, applications.scholarshipId] })
    .returning({ id: applications.id });

  if (inserted.length) await recordConversion("save", `${userId}:${scholarshipId}`);

  // Keep scholarshipMatches.isSaved in sync
  afterTrackerWrite(() => db
    .update(scholarshipMatches)
    .set({ isSaved: true, updatedAt: new Date() })
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.scholarshipId, scholarshipId),
      ),
    ));

  afterTrackerWrite(() => logActivity(userId, "scholarship_added", scholarshipId));
}

export async function updateApplicationStatus(id: number, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  validateId(id);
  if (typeof status !== "string" || !Object.hasOwn(STATUS_LABELS, status)) {
    throw new Error("Invalid application status");
  }
  const newEntry: StatusHistoryEntry = {
    status,
    at: new Date().toISOString(),
    label: STATUS_LABELS[status],
  };

  const updated = await db
    .update(applications)
    .set({
      status,
      statusHistory: sql`${applications.statusHistory} || ${JSON.stringify([newEntry])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning({ id: applications.id });

  if (!updated.length) throw new Error("Application not found");

  afterTrackerWrite(() => logActivity(userId, "status_changed", id));
  if (status === "submitted") {
    afterTrackerWrite(() => logActivity(userId, "application_submitted", id));
  }
  // Next keeps this work alive after the response in a serverless deployment.
  if (status === "submitted" || status === "won" || status === "lost") {
    afterTrackerWrite(() => sendStatusChangeEmail({
      userId,
      applicationId: id,
      newStatus: status as "submitted" | "won" | "lost",
    }));
  }
}

export async function updateApplicationNotes(id: number, notes: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  validateId(id);
  if (typeof notes !== "string") throw new Error("Invalid notes");

  const updated = await db
    .update(applications)
    .set({ notes, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning({ id: applications.id });
  if (!updated.length) throw new Error("Application not found");
}

export async function updateApplicationDeadline(id: number, deadline: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(applications)
    .set({ deadline, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

export async function deleteApplication(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  validateId(id);

  const deleted = await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning({ id: applications.id });
  if (!deleted.length) throw new Error("Application not found");
}

export async function bulkUpdateStatus(ids: number[], status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(applications.userId, userId),
        inArray(applications.id, ids),
      ),
    );
}

export async function updateApplicationChecklist(id: number, checklist: Record<string, boolean>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  validateId(id);
  if (!checklist || typeof checklist !== "object" || Array.isArray(checklist) ||
      !Object.values(checklist).every((value) => typeof value === "boolean")) {
    throw new Error("Invalid checklist");
  }

  const updated = await db
    .update(applications)
    .set({ checklist, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning({ id: applications.id });
  if (!updated.length) throw new Error("Application not found");
}
