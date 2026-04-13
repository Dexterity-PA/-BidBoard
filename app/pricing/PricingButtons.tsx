"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Tier } from "@/lib/tier";

interface PricingButtonsProps {
  priceId: string;
  currentTier: Tier;
  planTier: Tier;
}

export function PricingButtons({ priceId, currentTier, planTier }: PricingButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentTier === planTier) {
    return (
      <span className="inline-block w-full text-center text-sm font-medium py-2 px-4 rounded-lg bg-slate-700 text-slate-400">
        Current Plan
      </span>
    );
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to initialize checkout");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL received");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Redirecting…
          </span>
        ) : (
          "Get Started"
        )}
      </Button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
