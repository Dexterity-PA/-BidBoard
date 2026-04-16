"use client";

import { useState } from "react";

interface SaveButtonProps {
  scholarshipId: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

export function SaveButton({ scholarshipId, initialSaved, isLoggedIn }: SaveButtonProps) {
  const [saved, setSaved]     = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleToggle() {
    if (!isLoggedIn) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scholarships/${scholarshipId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: !saved }),
      });
      if (res.status === 401) { window.location.href = "/sign-in"; return; }
      if (!res.ok) { setError("Failed to update. Please try again."); return; }
      setSaved(!saved);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={
          saved
            ? "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            : "w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
        }
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Saving…
          </span>
        ) : saved ? (
          "Saved ✓"
        ) : (
          "Save Scholarship"
        )}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
