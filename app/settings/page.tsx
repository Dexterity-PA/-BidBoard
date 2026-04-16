export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { SettingsShell } from "./_components/settings-shell";
import type { SettingsData, NotificationPrefs } from "./types";
import type Stripe from "stripe";

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
        tier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    }),
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
    }),
  ]);

  if (!clerkUser || !dbUser) redirect("/sign-in");

  // Fetch Stripe subscription details for paid users
  let nextBillingDate: string | null = null;
  let cardLast4: string | null = null;
  let cancelAtPeriodEnd = false;

  if (dbUser.stripeSubscriptionId) {
    try {
      const sub = await getStripe().subscriptions.retrieve(
        dbUser.stripeSubscriptionId,
        { expand: ["default_payment_method"] }
      );
      cancelAtPeriodEnd = sub.cancel_at_period_end;
      nextBillingDate = new Date(sub.current_period_end * 1000).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );
      const pm = sub.default_payment_method as Stripe.PaymentMethod | null;
      cardLast4 = pm?.card?.last4 ?? null;
    } catch {
      // Non-fatal — billing details just won't show
    }
  }

  const data: SettingsData = {
    // Clerk
    email:    clerkUser.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: clerkUser.imageUrl ?? "",
    // users table
    firstName:             dbUser.firstName ?? clerkUser.firstName ?? "",
    lastName:              dbUser.lastName  ?? clerkUser.lastName  ?? "",
    tier:                  (dbUser.tier ?? "free") as SettingsData["tier"],
    stripeCustomerId:      dbUser.stripeCustomerId      ?? null,
    stripeSubscriptionId:  dbUser.stripeSubscriptionId  ?? null,
    // Stripe
    nextBillingDate,
    cardLast4,
    cancelAtPeriodEnd,
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
