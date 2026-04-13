// app/planner/PlannerClient.tsx
"use client";

import { useState, useMemo } from "react";
import { solveKnapsack } from "@/lib/knapsack";
import type { KnapsackItem } from "@/lib/knapsack";

// ── Helpers ────────────────────────────────────────────────────────────────

const LOCALITY_STYLES: Record<string, string> = {
  national: "bg-slate-700 text-slate-300",
  state:    "bg-blue-950 text-blue-400",
  local:    "bg-purple-950 text-purple-400",
};

/** Format ISO date string as "May 15" (or "May 15 2027" if a different year). */
function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "—", urgent: false };

  // Parse as local midnight to avoid timezone-shift issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const deadline = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const urgent = diffDays >= 0 && diffDays <= 14;

  const thisYear = today.getFullYear();
  const label = deadline.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    ...(year !== thisYear ? { year: "numeric" } : {}),
  });

  return { label, urgent };
}

/** Format a dollar amount concisely: $142, $14.2, $1.42 */
function fmt$(n: number): string {
  if (n >= 100) return `$${Math.round(n)}`;
  if (n >= 10)  return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

// ── Component ──────────────────────────────────────────────────────────────

type PlannerRow = KnapsackItem & {
  rank:     number;
  cumHours: number;
  cumEV:    number;
};

export function PlannerClient({ matches }: { matches: KnapsackItem[] }) {
  const [hours, setHours] = useState(15);

  // Knapsack runs synchronously — fast enough for reactive slider
  const selected = useMemo(() => solveKnapsack(matches, hours), [matches, hours]);

  // Build cumulative running totals
  const rows = useMemo<PlannerRow[]>(() => {
    let cumHours = 0;
    let cumEV    = 0;
    return selected.map((item, idx) => {
      cumHours = Math.round((cumHours + item.estimatedHours) * 10) / 10;
      cumEV    += item.evScore;
      return { ...item, rank: idx + 1, cumHours, cumEV };
    });
  }, [selected]);

  const totalHours = rows.length > 0 ? rows[rows.length - 1].cumHours : 0;
  const totalEV    = rows.length > 0 ? rows[rows.length - 1].cumEV    : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-5xl mx-auto">

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
            <span className="text-2xl font-bold text-white tabular-nums">{rows.length}</span>
            <span className="text-slate-400 text-sm ml-1.5">
              {rows.length === 1 ? "scholarship" : "scholarships"}
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

        {/* ── Table or zero-result state ── */}
        {rows.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No scholarships fit within {hours} {hours === 1 ? "hour" : "hours"}.
            Try increasing your budget.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    { label: "#",        cls: "w-8 text-left" },
                    { label: "Scholarship", cls: "text-left" },
                    { label: "Loc",      cls: "text-left hidden sm:table-cell" },
                    { label: "Hrs",      cls: "text-right" },
                    { label: "EV",       cls: "text-right" },
                    { label: "EV/hr",    cls: "text-right hidden md:table-cell" },
                    { label: "Deadline", cls: "text-right" },
                    { label: "Cum. Hrs", cls: "text-right hidden lg:table-cell" },
                    { label: "Cum. EV",  cls: "text-right hidden lg:table-cell" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`${col.cls} text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((row) => {
                  const { label: deadlineLabel, urgent } = formatDeadline(row.deadline);
                  const locStyle =
                    LOCALITY_STYLES[row.localityLevel ?? ""] ?? "bg-slate-700 text-slate-400";

                  return (
                    <tr
                      key={row.scholarshipId}
                      className="hover:bg-slate-800/50 transition-colors duration-100"
                    >
                      {/* Rank */}
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">
                        {row.rank}
                      </td>

                      {/* Name + provider */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white leading-snug">{row.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{row.provider}</div>
                      </td>

                      {/* Locality badge */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${locStyle}`}
                        >
                          {row.localityLevel ?? "—"}
                        </span>
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-3.5 text-right text-slate-300 tabular-nums">
                        {row.estimatedHours}h
                      </td>

                      {/* EV */}
                      <td className="px-4 py-3.5 text-right text-emerald-400 font-medium tabular-nums">
                        {fmt$(row.evScore)}
                      </td>

                      {/* EV/hr */}
                      <td className="px-4 py-3.5 text-right text-slate-400 tabular-nums hidden md:table-cell">
                        {fmt$(row.evPerHour)}/hr
                      </td>

                      {/* Deadline */}
                      <td
                        className={`px-4 py-3.5 text-right tabular-nums font-medium whitespace-nowrap ${
                          urgent ? "text-amber-400" : "text-slate-400"
                        }`}
                      >
                        {urgent && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 mb-px align-middle" />
                        )}
                        {deadlineLabel}
                      </td>

                      {/* Cumulative hours */}
                      <td className="px-4 py-3.5 text-right text-slate-500 tabular-nums hidden lg:table-cell">
                        {row.cumHours.toFixed(1)}h
                      </td>

                      {/* Cumulative EV */}
                      <td className="px-4 py-3.5 text-right text-slate-400 tabular-nums hidden lg:table-cell">
                        {fmt$(row.cumEV)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
