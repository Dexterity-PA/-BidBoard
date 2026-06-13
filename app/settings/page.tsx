export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsShell } from "./_components/settings-shell";
import type { SettingsData, NotificationPrefs } from "./types";

const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  deadlines_7d: true,
  deadlines_3d: true,
  deadlines_1d: false,
  weekly_digest: true,
  product_updates: true,
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, dbUser, profile] = await Promise.all([
    currentUser(),
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        firstName: true,
        lastName: true,
      },
    }),
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
    }),
  ]);

  if (!clerkUser || !dbUser) redirect("/sign-in");

  const data: SettingsData = {
    // Clerk
    email:    clerkUser.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: clerkUser.imageUrl ?? "",
    // users table
    firstName:             dbUser.firstName ?? clerkUser.firstName ?? "",
    lastName:              dbUser.lastName  ?? clerkUser.lastName  ?? "",
    // student_profiles
    graduationYear:         profile?.graduationYear         ?? null,
    schoolName:             profile?.schoolName              ?? null,
    gpa:                    profile?.gpa                    ?? null,
    intendedMajor:          profile?.intendedMajor           ?? null,
    state:                  profile?.state                   ?? null,
    gradeLevel:             profile?.gradeLevel              ?? null,
    minAwardAmount:         profile?.minAwardAmount          ?? null,
    categoriesOfInterest:   profile?.categoriesOfInterest    ?? [],
    maxHoursWilling:        profile?.maxHoursWilling         ?? null,
    preferredDeadlineRange: profile?.preferredDeadlineRange  ?? null,
    notificationPreferences: {
      ...DEFAULT_NOTIF_PREFS,
      ...(profile?.notificationPreferences ?? {}),
    },
  };

  return <SettingsShell data={data} />;
}
