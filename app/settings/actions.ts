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
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";

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
  gradeLevel: string;
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
    .update(studentProfiles)
    .set({
      graduationYear: data.graduationYear,
      schoolName: data.schoolName || null,
      gpa: data.gpa || null,
      intendedMajor: data.intendedMajor || null,
      state: data.state || null,
      gradeLevel: data.gradeLevel || null,
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, userId));

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
    .update(studentProfiles)
    .set({
      minAwardAmount: data.minAwardAmount,
      categoriesOfInterest: data.categoriesOfInterest,
      maxHoursWilling: data.maxHoursWilling,
      preferredDeadlineRange: data.preferredDeadlineRange || null,
      gradeLevel: data.gradeLevel || null,
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, userId));

  revalidatePath("/settings");
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function saveNotifications(prefs: {
  deadlines_7d: boolean;
  deadlines_3d: boolean;
  deadlines_1d: boolean;
  weekly_digest: boolean;
  product_updates: boolean;
}) {
  const userId = await getVerifiedUserId();

  await db
    .update(studentProfiles)
    .set({
      notificationPreferences: prefs,
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, userId));

  revalidatePath("/settings");
}

// ── Cancel Subscription ───────────────────────────────────────────────────────

export async function cancelSubscription() {
  const userId = await getVerifiedUserId();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { stripeSubscriptionId: true },
  });

  if (!user?.stripeSubscriptionId) {
    throw new Error("No active subscription found.");
  }

  await getStripe().subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
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

  // All child rows are deleted via cascade (FK onDelete: "cascade")
  await db.delete(users).where(eq(users.id, userId));

  // Delete from Clerk
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);

  redirect("/");
}
