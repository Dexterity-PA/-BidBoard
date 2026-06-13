import { currentUser } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();

  const userName =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "Student";
  const userImageUrl = clerkUser?.imageUrl ?? undefined;

  return (
    <AppShell userName={userName} userImageUrl={userImageUrl}>
      {children}
    </AppShell>
  );
}
