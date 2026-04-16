import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";

const PLAN_LABELS: Record<string, string> = {
  free:      "Free Plan",
  premium:   "Premium",
  ultra:     "Ultra",
  counselor: "Counselor",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    userId
      ? db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { tier: true },
        })
      : null,
  ]);

  const userName =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "Student";
  const userImageUrl = clerkUser?.imageUrl ?? undefined;
  const planName = PLAN_LABELS[dbUser?.tier ?? "free"] ?? "Free Plan";

  return (
    <AppShell userName={userName} userImageUrl={userImageUrl} planName={planName}>
      {children}
    </AppShell>
  );
}
