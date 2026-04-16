"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PortalButton } from "../PortalButton";
import { cancelSubscription } from "../actions";
import type { SettingsData } from "../types";

const TIER_BADGE: Record<string, string> = {
  free:      "bg-slate-100 text-slate-600",
  premium:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  ultra:     "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  counselor: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
};

const TIER_LABEL: Record<string, string> = {
  free: "Free", premium: "Premium", ultra: "Ultra", counselor: "Counselor",
};

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
}

export function BillingSection({ data, showToast }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isPaid = data.tier !== "free";

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelSubscription();
        setCancelOpen(false);
        showToast("success", "Subscription will cancel at the end of your billing period.");
      } catch {
        showToast("error", "Failed to cancel subscription. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your plan and payment details.</p>
      </div>

      {/* Current plan badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Current plan:</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
            TIER_BADGE[data.tier] ?? TIER_BADGE.free
          }`}
        >
          {TIER_LABEL[data.tier] ?? data.tier}
        </span>
        {data.cancelAtPeriodEnd && (
          <span className="text-xs text-amber-600 font-medium">· Cancels at period end</span>
        )}
      </div>

      {!isPaid ? (
        /* ── Free tier: upgrade CTA ── */
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 space-y-4">
          <p className="font-semibold text-indigo-900">Upgrade to Premium</p>
          <ul className="space-y-1.5 text-sm text-indigo-700">
            {[
              "Unlimited scholarship matches",
              "Essay recycling across applications",
              "Priority deadline reminders",
              "Advanced EV scoring & filters",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-indigo-400">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            View plans →
          </Link>
        </div>
      ) : (
        /* ── Paid tier: billing details ── */
        <div className="space-y-4">
          {data.nextBillingDate && (
            <p className="text-sm text-gray-600">
              Next billing date:{" "}
              <span className="font-medium text-gray-900">{data.nextBillingDate}</span>
            </p>
          )}
          {data.cardLast4 && (
            <p className="text-sm text-gray-600">
              Payment method:{" "}
              <span className="font-medium text-gray-900">•••• {data.cardLast4}</span>
            </p>
          )}
          <PortalButton />

          {!data.cancelAtPeriodEnd && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="text-sm text-red-500 hover:text-red-600 font-medium underline-offset-2 hover:underline"
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Cancel subscription?</h3>
            <p className="text-sm text-gray-600">
              You&apos;ll lose access to premium features at the end of your current billing
              period. Your data will be preserved.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep plan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
