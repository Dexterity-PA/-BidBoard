// app/planner/PlannerClient.tsx
"use client";

import { useState, useMemo } from "react";
import { solveKnapsack } from "@/lib/knapsack";
import { MatchCard } from "@/components/match-card";
import type { MatchCardScholarship } from "@/components/match-card";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format a dollar amount concisely: $142, $14.2, $1.42 */
function fmt$(n: number): string {
  if (n >= 99.95) return `$${Math.round(n)}`;
  if (n >= 10)    return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function PlannerClient({ matches }: { matches: MatchCardScholarship[] }) {
  const [hours, setHours] = useState(15);

  const selected = useMemo(
    () => solveKnapsack(matches, hours) as MatchCardScholarship[],
    [matches, hours]
  );

  const totalHours = useMemo(
    () => Math.round(selected.reduce((acc, item) => acc + item.estimatedHours, 0) * 10) / 10,
    [selected]
  );
  const totalEV = useMemo(
    () => selected.reduce((acc, item) => acc + item.evScore, 0),
    [selected]
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Monthly Strategy Planner
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Maximize your scholarship expected value within your available hours this month.
          </p>
        </div>

        {/* ── Slider ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="hours-slider"
              className="text-sm font-medium text-slate-300"
            >
              Hours available this month
            </label>
            <span className="text-emerald-400 font-semibold tabular-nums text-sm">
              {hours} {hours === 1 ? "hr" : "hrs"}
            </span>
          </div>
          <input
            id="hours-slider"
            type="range"
            min={1}
            max={40}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 appearance-none rounded-full bg-slate-700 accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1.5 select-none">
            <span>1 hr</span>
            <span>40 hrs</span>
          </div>
        </div>

        {/* ── Summary bar ── */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3.5 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-2xl font-bold text-white tabular-nums">{selected.length}</span>
            <span className="text-slate-400 text-sm ml-1.5">
              {selected.length === 1 ? "scholarship" : "scholarships"}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-600 hidden sm:block" />
          <div>
            <span className="text-2xl font-bold text-white tabular-nums">{totalHours.toFixed(1)}</span>
            <span className="text-slate-400 text-sm ml-1.5">hrs committed</span>
          </div>
          <div className="w-px h-6 bg-slate-600 hidden sm:block" />
          <div>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{fmt$(totalEV)}</span>
            <span className="text-slate-400 text-sm ml-1.5">expected value</span>
          </div>
        </div>

        {/* ── Card list or zero-result state ── */}
        {selected.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No scholarships fit within {hours} {hours === 1 ? "hour" : "hours"}.
            Try increasing your budget.
          </div>
        ) : (
          <div className="space-y-4">
            {selected.map((item) => (
              <MatchCard
                key={item.scholarshipId}
                scholarship={item}
                showRecycle={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
