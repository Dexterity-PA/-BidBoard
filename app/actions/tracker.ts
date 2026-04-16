"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications, scholarships, scholarshipMatches } from "@/db/schema";
import type { StatusHistoryEntry } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { sendStatusChangeEmail } from "@/lib/email/send/status-change";

const STATUS_LABELS: Record<string, string> = {
  saved:       "Added to Tracker",
  in_progress: "Moved to In Progress",
  submitted:   "Submitted",
  won:         "Marked as Won",
  lost:        "Marked as Lost",
  skipped:     "Marked as Skipped",
};

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
      createdAt:                 applications.createdAt,
      updatedAt:                 applications.updatedAt,
      scholarshipName:           scholarships.name,
      scholarshipProvider:       scholarships.provider,
      scholarshipAmountMin:      scholarships.amountMin,
      scholarshipAmountMax:      scholarships.amountMax,
      scholarshipApplicationUrl: scholarships.applicationUrl,
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

  const initialHistory: StatusHistoryEntry[] = [
    { status: "saved", at: new Date().toISOString(), label: STATUS_LABELS.saved },
  ];

  // Upsert into applications — do nothing if already tracked
  await db
    .insert(applications)
    .values({
      userId,
      scholarshipId,
      status: "saved",
      statusHistory: initialHistory,
    })
    .onConflictDoNothing();

  // Keep scholarshipMatches.isSaved in sync
  await db
    .update(scholarshipMatches)
    .set({ isSaved: true, updatedAt: new Date() })
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.scholarshipId, scholarshipId),
      ),
    );

  await logActivity(userId, "scholarship_added", scholarshipId);
}

export async function updateApplicationStatus(id: number, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db
    .select({ statusHistory: applications.statusHistory })
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);

  if (!existing.length) throw new Error("Application not found");

  const history = (existing[0].statusHistory ?? []) as StatusHistoryEntry[];
  const newEntry: StatusHistoryEntry = {
    status,
    at: new Date().toISOString(),
    label: STATUS_LABELS[status] ?? `Moved to ${status}`,
  };

  await db
    .update(applications)
    .set({ status, statusHistory: [...history, newEntry], updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  await logActivity(userId, "status_changed", id);
  if (status === "submitted") {
    await logActivity(userId, "application_submitted", id);
  }
  // Fire status-change email for notable transitions only — void to keep UI fast
  if (status === "submitted" || status === "won" || status === "lost") {
    void sendStatusChangeEmail({
      userId,
      applicationId: id,
      newStatus: status as "submitted" | "won" | "lost",
    });
  }
}

export async function updateApplicationNotes(id: number, notes: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(applications)
    .set({ notes, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
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

  await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
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
