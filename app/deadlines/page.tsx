"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type DeadlineItem = {
  id:             string;
  name:           string;
  provider:       string | null;
  amountMin:      number | null;
  amountMax:      number | null;
  deadline:       string;
  applicationUrl: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(min: number | null, max: number | null): string {
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (!min && !max) return "—";
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min ?? max!);
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

function urgencyStyle(days: number): {
  badge:    string;
  row:      string;
  dot:      string;
  label:    string;
} {
  if (days < 0)   return { badge: "bg-gray-100 text-gray-500",    row: "",                dot: "bg-gray-300",   label: "Past due"         };
  if (days <= 7)  return { badge: "bg-red-50 text-red-700",       row: "bg-red-50/30",    dot: "bg-red-500",    label: `${days}d left`    };
  if (days <= 14) return { badge: "bg-amber-50 text-amber-700",   row: "bg-amber-50/20",  dot: "bg-amber-500",  label: `${days}d left`    };
  return               { badge: "bg-emerald-50 text-emerald-700", row: "",                dot: "bg-emerald-500", label: `${days}d left`   };
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    year:  "numeric",
  });
}

function groupByMonth(items: DeadlineItem[]): Map<string, DeadlineItem[]> {
  const map = new Map<string, DeadlineItem[]>();
  for (const item of items) {
    const key = monthLabel(item.deadline);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return map;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DeadlineSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-2 w-2 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-32 rounded bg-gray-100" />
          </div>
          <div className="h-6 w-16 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}

function IconEmpty({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M18 24h12M24 18v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DeadlinesPage() {
  const router  = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/scholarships/deadlines");
        if (res.status === 401) { router.push("/sign-in"); return; }
        if (!res.ok) { setError("Failed to load deadlines. Please try again."); return; }
        const data: { deadlines: DeadlineItem[]; total: number } = await res.json();
        setDeadlines(data.deadlines);
      } catch {
        setError("Something went wrong. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const grouped = groupByMonth(deadlines);
  const urgentCount = deadlines.filter((d) => daysUntil(d.deadline) <= 7 && daysUntil(d.deadline) >= 0).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Summary strip */}
      {!loading && !error && deadlines.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {deadlines.length} upcoming deadline{deadlines.length !== 1 ? "s" : ""}
            </span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-700">
                {urgentCount} due within 7 days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-2xl space-y-8">
          <DeadlineSkeleton />
          <DeadlineSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && deadlines.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-center">
          <IconEmpty className="h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-base font-semibold text-gray-900 mb-1">No deadlines yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Save scholarships from your matches to start tracking their deadlines here.
          </p>
          <Link
            href="/matches"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Browse My Scholarships
          </Link>
        </div>
      )}

      {/* Grouped deadline list */}
      {!loading && !error && deadlines.length > 0 && (
        <div className="max-w-2xl space-y-8">
          {Array.from(grouped.entries()).map(([month, items]) => (
            <section key={month}>
              {/* Month header */}
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                <IconCalendar className="h-3.5 w-3.5" />
                {month}
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                  {items.length}
                </span>
              </h2>

              <div className="space-y-2">
                {items.map((item) => {
                  const days    = daysUntil(item.deadline);
                  const urgency = urgencyStyle(days);
                  const dateStr = new Date(item.deadline + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day:   "numeric",
                  });

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-colors duration-100 hover:border-gray-300",
                        urgency.row
                      )}
                    >
                      {/* Urgency dot */}
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", urgency.dot)} />

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">{item.provider ?? "—"}</span>
                          <span>·</span>
                          <span className="shrink-0 font-medium text-gray-700">
                            {formatAmount(item.amountMin, item.amountMax)}
                          </span>
                          <span>·</span>
                          <span className="shrink-0">{dateStr}</span>
                        </div>
                      </div>

                      {/* Urgency badge */}
                      <span className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        urgency.badge
                      )}>
                        {urgency.label}
                      </span>

                      {/* Apply link */}
                      {item.applicationUrl ? (
                        <a
                          href={item.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-indigo-100"
                        >
                          Apply →
                        </a>
                      ) : (
                        <span className="w-16 shrink-0 opacity-0 group-hover:opacity-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
