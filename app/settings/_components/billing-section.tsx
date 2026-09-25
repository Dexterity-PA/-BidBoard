"use client";

import type { SettingsData } from "../types";

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
}

const INCLUDED = [
  "Unlimited scholarship matches",
  "Full EV scoring and ranking",
  "Essay recycling across applications",
  "Deadline reminders",
  "CSV export",
];

export function BillingSection(_props: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Plan</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Meritously is completely free. Every feature is included.
        </p>
      </div>

      {/* Current plan badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Current plan:</span>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          Free
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
        <p className="font-semibold text-gray-900">Everything is included</p>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> {f}
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500">
          No payment details, no subscription, no seat fees. Free, forever.
        </p>
      </div>
    </div>
  );
}
