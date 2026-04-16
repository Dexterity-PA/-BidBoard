"use client";

import { useState, useEffect } from "react";
import type { ApplicationRow } from "@/app/actions/tracker";

export function DeadlineBanner({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  const today = new Date().toISOString().split("T")[0];
  const storageKey = `tracker-deadline-banner-dismissed-${today}`;

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  const upcoming = applications.filter((a) => {
    if (
      !a.deadline ||
      a.status === "won" ||
      a.status === "lost" ||
      a.status === "skipped"
    )
      return false;
    const days = Math.ceil(
      (new Date(a.deadline).getTime() - Date.now()) / 86_400_000,
    );
    return days >= 0 && days <= 7;
  });

  if (dismissed || upcoming.length === 0) return null;

  function dismiss() {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <p className="text-sm text-amber-800 font-medium">
        ⚠️ {upcoming.length} scholarship
        {upcoming.length !== 1 ? "s" : ""} due this week — don&apos;t miss them.
      </p>
      <button
        onClick={dismiss}
        className="text-sm text-amber-600 hover:text-amber-800 font-medium shrink-0 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
