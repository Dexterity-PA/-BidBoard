// components/match-card.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KnapsackItem } from "@/lib/knapsack";

// ── Types ──────────────────────────────────────────────────────────────────

export type MatchCardScholarship = KnapsackItem & {
  amountMin: number | null;
  amountMax: number | null;
  requiresEssay: boolean | null;
  essayPrompt: string | null;
};

type RecycleResult = {
  id: number;
  title: string;
  archetype: string;
  wordCount: number;
  similarity: number;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "—", urgent: false };
  const [year, month, day] = dateStr.split("-").map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
  const urgent = diffDays >= 0 && diffDays <= 14;
  const label =
    diffDays >= 0 && diffDays <= 14
      ? diffDays === 0
        ? "Today"
        : `${diffDays}d left`
      : deadline.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(year !== today.getFullYear() ? { year: "numeric" } : {}),
        });
  return { label, urgent };
}

function fmt$(n: number): string {
  if (n >= 99.95) return `$${Math.round(n)}`;
  if (n >= 10) return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

const ARCHETYPE_STYLES: Record<string, string> = {
  adversity:        "bg-red-500/20 text-red-300 border-red-500/30",
  career_goals:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  community_impact: "bg-green-500/20 text-green-300 border-green-500/30",
  identity:         "bg-purple-500/20 text-purple-300 border-purple-500/30",
  leadership:       "bg-orange-500/20 text-orange-300 border-orange-500/30",
  innovation:       "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  financial_need:   "bg-pink-500/20 text-pink-300 border-pink-500/30",
  other:            "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const LOCALITY_STYLES: Record<string, string> = {
  national: "bg-slate-700 text-slate-300",
  state:    "bg-blue-950 text-blue-400",
  local:    "bg-purple-950 text-purple-400",
};

const MATCH_SCORE_STYLE = (score: number) =>
  score >= 80 ? "bg-green-500/20 text-green-300" :
  score >= 60 ? "bg-yellow-500/20 text-yellow-300" :
                "bg-red-500/20 text-red-300";

// ── Component ──────────────────────────────────────────────────────────────

interface MatchCardProps {
  scholarship: MatchCardScholarship;
  showRecycle?: boolean;
}

export function MatchCard({ scholarship, showRecycle = false }: MatchCardProps) {
  const [recycleResults, setRecycleResults] = useState<RecycleResult[] | null>(null);
  const [recycleOpen, setRecycleOpen] = useState(false);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleError, setRecycleError] = useState<string | null>(null);

  const { label: deadlineLabel, urgent } = formatDeadline(scholarship.deadline);
  const locStyle =
    LOCALITY_STYLES[(scholarship.localityLevel ?? "").toLowerCase()] ??
    "bg-slate-700 text-slate-400";
  const showEssaySection =
    showRecycle && scholarship.requiresEssay && scholarship.essayPrompt;

  async function handleRecycleClick() {
    if (!scholarship.essayPrompt) return;
    // If we already have results, just toggle open/closed — no re-fetch
    if (recycleResults !== null) {
      setRecycleOpen((prev) => !prev);
      return;
    }
    // First click: fetch and cache
    setRecycleLoading(true);
    setRecycleError(null); // Clear previous error on retry
    try {
      const res = await fetch(
        `/api/essays/recycle?prompt=${encodeURIComponent(scholarship.essayPrompt)}`
      );
      if (!res.ok) throw new Error("Request failed");
      const data: RecycleResult[] = await res.json();
      setRecycleResults(data);
      setRecycleOpen(true);
    } catch {
      setRecycleError("Could not search essays");
    } finally {
      setRecycleLoading(false);
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/scholarship/${scholarship.scholarshipId}`}
              className="font-semibold text-white text-base leading-snug truncate hover:text-indigo-300 transition-colors"
            >
              {scholarship.name}
            </Link>
            <p className="text-sm text-slate-400 mt-0.5">{scholarship.provider}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${MATCH_SCORE_STYLE(scholarship.matchScore)}`}
          >
            {Math.round(scholarship.matchScore)}% match
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        {/* Row 1: Amount, Deadline, Locality */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-emerald-400">
            {formatAmount(scholarship.amountMin, scholarship.amountMax)}
          </span>
          <span className="text-slate-700">·</span>
          <span className={urgent ? "text-amber-400 font-medium" : "text-slate-400"}>
            {urgent && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 mb-px align-middle" />
            )}
            {deadlineLabel}
          </span>
          <span className="text-slate-700">·</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${locStyle}`}
          >
            {scholarship.localityLevel ?? "—"}
          </span>
        </div>

        {/* Row 2: EV/hr and Estimated Hours */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            <span className="text-white font-medium">{fmt$(scholarship.evPerHour)}</span>
            <span className="ml-1">EV/hr</span>
          </span>
          <span>
            <span className="text-white font-medium">{scholarship.estimatedHours.toFixed(1)}</span>
            <span className="ml-1">hrs</span>
          </span>
          <span>
            <span className="text-white font-medium">{fmt$(scholarship.evScore)}</span>
            <span className="ml-1">EV</span>
          </span>
        </div>

        {/* Essay Recycling Section */}
        {showEssaySection && (
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Essay prompt: </span>
              {scholarship.essayPrompt!.length > 100
                ? scholarship.essayPrompt!.slice(0, 100) + "…"
                : scholarship.essayPrompt}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRecycleClick}
              disabled={recycleLoading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs"
            >
              {recycleLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-slate-500 border-t-emerald-400 animate-spin" />
                  Searching…
                </span>
              ) : recycleOpen && recycleResults !== null ? (
                "Hide Essays"
              ) : (
                "Find Recyclable Essays"
              )}
            </Button>

            {/* Results collapsible */}
            {recycleError && (
              <p className="text-xs text-red-400">{recycleError}</p>
            )}

            {recycleOpen && recycleResults !== null && (
              <div className="space-y-2">
                {recycleResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No essays match this prompt</p>
                ) : (
                  recycleResults.map((essay) => {
                    const archetypeStyle =
                      ARCHETYPE_STYLES[essay.archetype] ?? ARCHETYPE_STYLES.other;
                    return (
                      <div
                        key={essay.id}
                        className="flex items-center justify-between gap-2 bg-slate-800/60 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${archetypeStyle}`}
                          >
                            {essay.archetype.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-white truncate">{essay.title}</span>
                          <span className="text-xs text-slate-500 shrink-0">
                            {essay.wordCount}w
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 shrink-0">
                          {Math.round(essay.similarity * 100)}% match
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
