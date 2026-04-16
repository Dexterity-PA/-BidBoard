import type { db } from "@/db";

// ── Shared types ──────────────────────────────────────────────────────────────

export type ScholarshipRow = NonNullable<
  Awaited<ReturnType<typeof db.query.scholarships.findFirst>>
>;

export type MatchData = {
  evScore: string | null;
  evPerHour: string | null;
  estimatedHours: string | null;
  matchScore: string | null;
  isSaved: boolean;
} | null;

/** Similar scholarship card — includes slug for /scholarships/[slug] links. */
export type SimilarScholarship = {
  id: number;
  name: string;
  provider: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  category: string | null;
  slug: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats an integer cent amount (or range) to a human-readable string.
 * e.g. 500000 → "$5k", 100_000_000 → "$1M"
 */
export function formatAmount(
  amountMin: number | null,
  amountMax: number | null
): string {
  if (amountMin == null && amountMax == null) return "—";
  const min = amountMin ?? 0;
  const max = amountMax ?? min;
  const fmt = (cents: number): string => {
    const dollars = cents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}k`;
    return `$${dollars.toLocaleString()}`;
  };
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

/** Returns whole days until deadline (positive = future, negative = past). */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

/** Formats a "YYYY-MM-DD" date string as "Month D, YYYY". */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
