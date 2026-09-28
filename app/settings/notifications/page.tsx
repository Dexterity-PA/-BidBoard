// app/settings/notifications/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib/email/preferences";
import { ensureUserRow } from "@/lib/ensure-user";
import NewsletterForm from "@/components/merit/NewsletterForm";
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

  await ensureUserRow(userId);
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
        Manage which emails Meritously sends you.
      </p>
      <p className="text-xs text-gray-400 mb-8">
        Last updated: {formatUpdatedAt(updatedAt)}
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
        <EmailPrefsForm prefs={boolPrefs} />
      </div>
      <section className="m-page" style={{ minHeight: 0 }} aria-labelledby="digest-heading">
        <h2 id="digest-heading" className="m-h3">Weekly scholarship digest</h2>
        <p className="m-body" style={{ margin: "12px 0 24px" }}>
          A general roundup of upcoming awards. This is a separate subscription from your
          tracked-award reminders. Confirm your email to join, and unsubscribe in any digest.
        </p>
        <NewsletterForm />
      </section>
    </div>
  );
}
