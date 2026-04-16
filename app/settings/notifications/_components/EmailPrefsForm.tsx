// app/settings/notifications/_components/EmailPrefsForm.tsx
"use client";

import { useState, useTransition } from "react";
import type { UserEmailPrefs } from "@/lib/email/preferences";
import type { NotificationType } from "@/lib/email/client";
import { saveEmailPref, unsubscribeAll } from "../actions";

type BoolPrefs = Omit<UserEmailPrefs, "updatedAt">;

const PREF_KEY_MAP: Record<NotificationType, keyof BoolPrefs> = {
  welcome:            "welcome",
  deadline_reminders: "deadlineReminders",
  new_matches:        "newMatches",
  status_changes:     "statusChanges",
  weekly_digest:      "weeklyDigest",
  payment_events:     "paymentEvents",
};

const PREF_ROWS: { type: NotificationType; label: string; description: string }[] = [
  {
    type: "welcome",
    label: "Welcome email",
    description: "Sent when you first join BidBoard.",
  },
  {
    type: "deadline_reminders",
    label: "Deadline reminders",
    description: "Alerts before scholarships you're tracking close.",
  },
  {
    type: "new_matches",
    label: "New matches",
    description: "When BidBoard finds new scholarships matching your profile.",
  },
  {
    type: "status_changes",
    label: "Status changes",
    description: "Updates when your application status changes.",
  },
  {
    type: "weekly_digest",
    label: "Weekly digest",
    description: "A Sunday summary of your top matches and deadlines.",
  },
  {
    type: "payment_events",
    label: "Payment events",
    description: "Receipts and billing alerts. Recommended to leave on.",
  },
];

export function EmailPrefsForm({ prefs: initialPrefs }: { prefs: BoolPrefs }) {
  const [prefs, setPrefs] = useState<BoolPrefs>(initialPrefs);
  const [errors, setErrors] = useState<Partial<Record<NotificationType, string>>>({});
  const [unsubError, setUnsubError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingTypes, setPendingTypes] = useState<Set<NotificationType>>(new Set());

  function toggle(type: NotificationType) {
    const key = PREF_KEY_MAP[type];
    const newValue = !prefs[key];
    // Optimistic update
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    setPendingTypes((prev) => new Set(prev).add(type));
    void (async () => {
      try {
        await saveEmailPref(type, newValue);
        setErrors((prev) => ({ ...prev, [type]: undefined }));
      } catch {
        // Revert on failure
        setPrefs((prev) => ({ ...prev, [key]: !newValue }));
        setErrors((prev) => ({ ...prev, [type]: "Failed to save. Try again." }));
      } finally {
        setPendingTypes((prev) => {
          const next = new Set(prev);
          next.delete(type);
          return next;
        });
      }
    })();
  }

  function handleUnsubscribeAll() {
    if (!window.confirm("Turn off all email notifications?")) return;
    setUnsubError(null);
    startTransition(async () => {
      try {
        await unsubscribeAll();
        setPrefs({
          welcome:           false,
          deadlineReminders: false,
          newMatches:        false,
          statusChanges:     false,
          weeklyDigest:      false,
          paymentEvents:     false,
        });
      } catch {
        setUnsubError("Failed to unsubscribe. Try again.");
      }
    });
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {PREF_ROWS.map(({ type, label, description }) => {
          const key = PREF_KEY_MAP[type];
          const checked = prefs[key];
          return (
            <div key={type} className="flex items-center justify-between px-4 py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                {errors[type] && (
                  <p className="text-xs text-red-500 mt-1">{errors[type]}</p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => toggle(type)}
                disabled={pendingTypes.has(type)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 ${
                  checked ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleUnsubscribeAll}
          disabled={isPending}
          className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          Unsubscribe from all emails
        </button>
        {unsubError && (
          <p className="text-xs text-red-500 mt-2 text-center">{unsubError}</p>
        )}
      </div>
    </>
  );
}
