// app/deadlines/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

type DeadlineItem = {
  id: number;
  name: string;
  provider: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string; // "YYYY-MM-DD"
  applicationUrl: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(amountMin: number | null, amountMax: number | null): string {
  if (amountMin == null && amountMax == null) return "—";
  const min = amountMin ?? 0;
  const max = amountMax ?? min;
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1000
      ? `$${(dollars / 1000).toFixed(1)}k`
      : `$${dollars.toLocaleString()}`;
  };
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

function daysUntil(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
}

function urgencyStyle(days: number): { className: string; label: string } {
  if (days < 7) {
    return {
      className: "bg-red-500/15 text-red-300 border-red-500/30",
      label: days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`,
    };
  }
  if (days < 14) {
    return {
      className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
      label: `${days}d left`,
    };
  }
  return {
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: `${days}d left`,
  };
}

function monthLabel(dateStr: string): string {
  const [year, month] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function groupByMonth(items: DeadlineItem[]): Map<string, DeadlineItem[]> {
  const map = new Map<string, DeadlineItem[]>();
  for (const item of items) {
    const key = monthLabel(item.deadline);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function DeadlineSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-32" />
      {[1, 2].map((i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-1/2" />
          </div>
          <div className="h-5 bg-slate-800 rounded-full w-16 ml-4 self-center" />
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DeadlinesPage() {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeadlines() {
      try {
        const res = await fetch("/api/scholarships/deadlines");

        if (res.status === 401) {
          router.push("/sign-in");
          return;
        }

        if (!res.ok) {
          setError("Failed to load deadlines. Please try again.");
          return;
        }

        const data: { deadlines: DeadlineItem[]; total: number } = await res.json();
        setDeadlines(data.deadlines);
      } catch {
        setError("Something went wrong. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadDeadlines();
  }, [router]);

  const grouped = groupByMonth(deadlines);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Deadlines</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {loading
              ? "Loading your saved scholarships…"
              : error
              ? "Unable to load deadlines"
              : deadlines.length === 0
              ? "No upcoming deadlines"
              : `${deadlines.length} upcoming deadline${deadlines.length === 1 ? "" : "s"} from saved scholarships`}
          </p>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-300 font-semibold mb-1">Error</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-8">
            <DeadlineSkeleton />
            <DeadlineSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && deadlines.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-10 text-center">
              <p className="text-white font-semibold text-lg mb-2">No saved scholarships yet</p>
              <p className="text-slate-400 text-sm mb-6">
                Save scholarships from your matches to track their deadlines here.
              </p>
              <Link
                href="/matches"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors duration-150"
              >
                Browse Matches
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Grouped deadline list */}
        {!loading && !error && deadlines.length > 0 && (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([month, items]) => (
              <section key={month}>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {month}
                </h2>
                <div className="space-y-2">
                  {items.map((item) => {
                    const days = daysUntil(item.deadline);
                    const urgency = urgencyStyle(days);
                    return (
                      <Card key={item.id} className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex items-center gap-4">
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{item.name}</p>
                            <p className="text-slate-400 text-sm truncate">{item.provider}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-slate-300 text-xs">
                                {formatAmount(item.amountMin, item.amountMax)}
                              </span>
                              <span className="text-slate-600 text-xs">·</span>
                              <span className="text-slate-400 text-xs">
                                {new Date(
                                  Number(item.deadline.split("-")[0]),
                                  Number(item.deadline.split("-")[1]) - 1,
                                  Number(item.deadline.split("-")[2])
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Right side: urgency badge + apply link */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium border ${urgency.className}`}
                            >
                              {urgency.label}
                            </Badge>
                            {item.applicationUrl ? (
                              <a
                                href={item.applicationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
                              >
                                Apply →
                              </a>
                            ) : (
                              <span className="text-xs text-slate-600">No link</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
