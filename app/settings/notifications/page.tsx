// app/settings/notifications/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib/email/preferences";
import { EmailPrefsForm } from "./_components/EmailPrefsForm";

function formatUpdatedAt(date: Date | null): string {
  if (!date) return "Never";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function NotificationsSettingsPage() {
  // Middleware protects /settings routes, but we also guard here so the
  // page can't be invoked directly as a server action without auth context.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const prefs = await getUserPrefs(userId);
  const { updatedAt, ...boolPrefs } = prefs;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Email Notifications
      </h1>
      <p className="text-sm text-gray-500 mb-1">
        Manage which emails BidBoard sends you.
      </p>
      <p className="text-xs text-gray-400 mb-8">
        Last updated: {formatUpdatedAt(updatedAt)}
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
        <EmailPrefsForm prefs={boolPrefs} />
      </div>
    </div>
  );
}
