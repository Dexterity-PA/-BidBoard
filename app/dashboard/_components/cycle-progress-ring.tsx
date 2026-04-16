"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { updateApplicationGoal } from "@/app/dashboard/actions";

// ── SVG Ring constants ────────────────────────────────────────────────────────
const SIZE = 160;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2; // 73
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 458.67

interface Props {
  /** Award amounts summed for submitted applications — stored in cents */
  appliedCents: number;
  submittedCount: number;
  /** Goal stored in dollars (e.g. 50000 = $50,000) */
  goal: number;
}

function fmtDollars(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

export function CycleProgressRing({ appliedCents, submittedCount, goal }: Props) {
  const appliedDollars = Math.round(appliedCents / 100);
  const progress = goal > 0 ? Math.min(appliedDollars / goal, 1) : 0;
  const goalHit = appliedDollars >= goal && goal > 0;

  // Animate ring on mount
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const offset = animated
    ? CIRCUMFERENCE * (1 - progress)
    : CIRCUMFERENCE;

  // Goal editing
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goal));
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setInputVal(String(goal));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const parsed = parseInt(inputVal.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed !== goal) {
      startTransition(async () => {
        await updateApplicationGoal(parsed);
      });
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* SVG Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={goalHit ? "#10b981" : "#10b981"}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          {goalHit ? (
            <>
              <span className="text-xl">🎯</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5">Goal hit!</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-emerald-600 tabular-nums">
                {fmtDollars(appliedDollars)}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                /&nbsp;
                {editing ? null : (
                  <button
                    onClick={startEdit}
                    className="underline decoration-dotted underline-offset-2 hover:text-gray-600 transition-colors"
                    title="Edit goal"
                  >
                    {fmtDollars(goal)}
                  </button>
                )}
                &nbsp;goal
              </span>
            </>
          )}
        </div>
      </div>

      {/* Subcaption */}
      <p className="text-xs text-gray-500">
        {submittedCount === 0
          ? "No submissions yet"
          : `${submittedCount} scholarship${submittedCount === 1 ? "" : "s"} submitted`}
      </p>

      {/* Goal edit input (below ring) */}
      {editing && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-500">$</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-28 rounded-md border border-emerald-300 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm outline-none ring-1 ring-emerald-300 focus:ring-2 focus:ring-emerald-500"
            placeholder="50000"
          />
          <button
            onClick={commitEdit}
            disabled={isPending}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "…" : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* "Set new goal" button when goal is hit */}
      {goalHit && !editing && (
        <button
          onClick={startEdit}
          className="text-xs font-medium text-emerald-600 underline decoration-dotted underline-offset-2 hover:text-emerald-700 transition-colors"
        >
          Set new goal
        </button>
      )}
    </div>
  );
}
