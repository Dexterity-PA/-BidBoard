import { currentUser } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";

export default async function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const userName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "Student";
  const userImageUrl = user?.imageUrl ?? undefined;

  return (
    <AppShell
      userName={userName}
      userImageUrl={userImageUrl}
      planName="Free Plan" // TODO: replace with real plan from Stripe/DB
    >
      {children}
    </AppShell>
  );
}
