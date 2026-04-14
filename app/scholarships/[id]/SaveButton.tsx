"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  scholarshipId: number;
  initialSaved: boolean;
}

export function SaveButton({ scholarshipId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scholarships/${scholarshipId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: !saved }),
      });
      if (res.status === 401) {
        window.location.href = "/sign-in";
        return;
      }
      if (!res.ok) {
        setError("Failed to update. Please try again.");
        return;
      }
      setSaved(!saved);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={saved ? "outline" : "default"}
        className={
          saved
            ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Saving…
          </span>
        ) : saved ? (
          "Saved ✓"
        ) : (
          "Save Scholarship"
        )}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
