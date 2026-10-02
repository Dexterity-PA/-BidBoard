"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  users,
  studentProfiles,
  studentEssays,
  applications,
  scholarshipMatches,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { accountEvent } from "@/lib/accounts/events";
import { syncAccount } from "@/lib/accounts/sync";
import { revalidatePath } from "next/cache";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getVerifiedUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function saveProfile(data: {
  firstName: string;
  lastName: string;
  graduationYear: number | null;
  schoolName: string;
  gpa: string;
  intendedMajor: string;
  state: string;
}) {
  const userId = await getVerifiedUserId();

  await db
    .update(users)
    .set({
      firstName: data.firstName,
      lastName: data.lastName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db
    .insert(studentProfiles)
    .values({
      userId,
      graduationYear: data.graduationYear,
      schoolName: data.schoolName || null,
      gpa: data.gpa || null,
      intendedMajor: data.intendedMajor || null,
      state: data.state || null,
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
        graduationYear: data.graduationYear,
        schoolName: data.schoolName || null,
        gpa: data.gpa || null,
        intendedMajor: data.intendedMajor || null,
        state: data.state || null,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/settings");
}

// ── Scholarship Preferences ───────────────────────────────────────────────────

export async function savePreferences(data: {
  minAwardAmount: number | null;
  categoriesOfInterest: string[];
  maxHoursWilling: number | null;
  preferredDeadlineRange: string;
  gradeLevel: string;
}) {
  const userId = await getVerifiedUserId();

  await db
    .insert(studentProfiles)
    .values({
      userId,
      minAwardAmount: data.minAwardAmount,
      categoriesOfInterest: data.categoriesOfInterest,
      maxHoursWilling: data.maxHoursWilling,
      preferredDeadlineRange: data.preferredDeadlineRange || null,
      gradeLevel: data.gradeLevel || null,
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
        minAwardAmount: data.minAwardAmount,
        categoriesOfInterest: data.categoriesOfInterest,
        maxHoursWilling: data.maxHoursWilling,
        preferredDeadlineRange: data.preferredDeadlineRange || null,
        gradeLevel: data.gradeLevel || null,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/settings");
}

// ── Export Data ───────────────────────────────────────────────────────────────

export async function exportUserData(): Promise<string> {
  const userId = await getVerifiedUserId();

  const [profile, essays, apps, matches] = await Promise.all([
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
    }),
    db.query.studentEssays.findMany({
      where: eq(studentEssays.userId, userId),
    }),
    db.query.applications.findMany({
      where: eq(applications.userId, userId),
    }),
    db.query.scholarshipMatches.findMany({
      where: eq(scholarshipMatches.userId, userId),
    }),
  ]);

  return JSON.stringify(
    { profile, essays, applications: apps, matches },
    null,
    2
  );
}

// ── Delete Account ────────────────────────────────────────────────────────────

export async function deleteAccount() {
  const userId = await getVerifiedUserId();

  // Keep saved work until Clerk confirms deletion. A permanent tombstone blocks delayed webhooks.
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
  const event = accountEvent({ type: "user.deleted", timestamp: Date.now(), data: { id: userId } });
  if (!event) throw new Error("Could not delete account");
  await syncAccount(event);

  redirect("/");
}
