"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { saveNotifications } from "../actions";
import type { SettingsData, NotificationPrefs } from "../types";

const DEFAULT_PREFS: NotificationPrefs = {
  deadlines_7d: true,
  deadlines_3d: true,
  deadlines_1d: false,
  weekly_digest: true,
  product_updates: true,
};

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
  onDirty: (dirty: boolean) => void;
}

export function NotificationsSection({ data, showToast, onSaved, onDirty }: Props) {
  const [isPending, startTransition] = useTransition();
  const initialRef = useRef<NotificationPrefs>({ ...DEFAULT_PREFS, ...data.notificationPreferences });
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialRef.current);

  const isDirty = JSON.stringify(prefs) !== JSON.stringify(initialRef.current);
  useEffect(() => { onDirty(isDirty); }, [isDirty, onDirty]);

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveNotifications(prefs);
        initialRef.current = { ...prefs };
        onSaved();
        showToast("success", "Notification preferences saved.");
      } catch {
        showToast("error", "Failed to save notifications.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Email preferences (powered by Resend).</p>
      </div>

      {/* Deadline reminders group */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Deadline reminders
        </p>
        <Toggle
          label="7 days before deadline"
          checked={prefs.deadlines_7d}
          onChange={() => toggle("deadlines_7d")}
        />
        <Toggle
          label="3 days before deadline"
          checked={prefs.deadlines_3d}
          onChange={() => toggle("deadlines_3d")}
        />
        <Toggle
          label="Day of deadline"
          checked={prefs.deadlines_1d}
          onChange={() => toggle("deadlines_1d")}
        />
      </div>

      {/* Updates group */}
      <div className="border-t border-gray-100 pt-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Updates
        </p>
        <Toggle
          label="Weekly new matches digest"
          checked={prefs.weekly_digest}
          onChange={() => toggle("weekly_digest")}
        />
        <Toggle
          label="Product updates & announcements"
          checked={prefs.product_updates}
          onChange={() => toggle("product_updates")}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save notifications"}
        </button>
      </div>
    </form>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg px-1 py-2.5 hover:bg-gray-50 cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
