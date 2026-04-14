# Monthly Strategy Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/planner` — a reactive page where the user sets available hours via a slider and the system runs a 0/1 knapsack DP to return the scholarship subset that maximizes expected value within that budget.

**Architecture:** Server component fetches stored `scholarship_matches` (joined to `scholarships`) from Neon/Drizzle and passes them as plain props to a client component. The client holds slider state and re-runs a pure knapsack function synchronously on every render — no API calls after page load.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM, Clerk auth, Tailwind CSS, shadcn/ui (no new components needed).

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `lib/knapsack.ts` | **Create** | Pure 0/1 DP knapsack — `KnapsackItem` type + `solveKnapsack` function |
| `app/planner/page.tsx` | **Create** | Server component: auth, DB query, empty state, pass props |
| `app/planner/PlannerClient.tsx` | **Create** | Client component: slider, knapsack call, summary bar, table |

---

### Task 1: Knapsack algorithm (`lib/knapsack.ts`)

**Files:**
- Create: `lib/knapsack.ts`

No test framework is installed. Verification is via `npx tsc --noEmit`.

- [ ] **Step 1: Create `lib/knapsack.ts` with the `KnapsackItem` type and `solveKnapsack` function**

```typescript
// lib/knapsack.ts

export type KnapsackItem = {
  scholarshipId: number;
  name: string;
  provider: string;
  evScore: number;        // dollars
  evPerHour: number;      // dollars per hour
  estimatedHours: number; // e.g. 0.5, 1.5, 3.5
  matchScore: number;
  localityLevel: string | null;
  deadline: string | null; // ISO "YYYY-MM-DD" or null
};

/**
 * 0/1 knapsack DP.
 * Hours are converted to half-hour integer slots (×2) so fractional hours
 * become integer weights. Budget of 40 hrs = 80 slots; 50 items × 80 slots
 * = 4,000 DP cells — runs in < 1 ms.
 *
 * Returns the optimal subset sorted by evScore descending (rank 1 = highest EV).
 */
export function solveKnapsack(
  items: KnapsackItem[],
  budgetHours: number
): KnapsackItem[] {
  const budgetSlots = Math.round(budgetHours * 2); // e.g. 15 hrs → 30 slots
  const n = items.length;

  // Integer weights: minimum 1 slot (30 min) to avoid degenerate zero-weight items
  const weights = items.map((item) => Math.max(1, Math.round(item.estimatedHours * 2)));
  const values = items.map((item) => item.evScore);

  // 2D DP table: dp[i][j] = max EV using the first i items with j slots of budget
  // Using Float64Array for performance; size (n+1) × (budgetSlots+1)
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(budgetSlots + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let j = 0; j <= budgetSlots; j++) {
      // Option A: skip item i
      dp[i][j] = dp[i - 1][j];
      // Option B: take item i (only if it fits)
      if (j >= w && dp[i - 1][j - w] + v > dp[i][j]) {
        dp[i][j] = dp[i - 1][j - w] + v;
      }
    }
  }

  // Traceback: walk from dp[n][budgetSlots] back to dp[0][0]
  const selected: KnapsackItem[] = [];
  let remaining = budgetSlots;
  for (let i = n; i >= 1; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      // Item i-1 was included in the optimal solution
      selected.push(items[i - 1]);
      remaining -= weights[i - 1];
    }
  }

  // Sort by evScore descending so rank 1 = highest EV
  return selected.sort((a, b) => b.evScore - a.evScore);
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add lib/knapsack.ts
git commit -m "feat: add 0/1 knapsack DP for scholarship EV optimization"
```

---

### Task 2: Server component (`app/planner/page.tsx`)

**Files:**
- Create: `app/planner/page.tsx`

- [ ] **Step 1: Create the directory and server component**

```bash
mkdir -p app/planner
```

```typescript
// app/planner/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches, scholarships } from "@/db/schema";
import { PlannerClient } from "./PlannerClient";
import type { KnapsackItem } from "@/lib/knapsack";

export default async function PlannerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await db
    .select({
      scholarshipId: scholarshipMatches.scholarshipId,
      matchScore:    scholarshipMatches.matchScore,
      evScore:       scholarshipMatches.evScore,
      evPerHour:     scholarshipMatches.evPerHour,
      estimatedHours: scholarshipMatches.estimatedHours,
      name:          scholarships.name,
      provider:      scholarships.provider,
      localityLevel: scholarships.localityLevel,
      deadline:      scholarships.deadline,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.isDismissed, false)
      )
    );

  // Empty state — no matches have been computed yet
  if (rows.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">No matches yet</h1>
          <p className="text-slate-400 mb-6">
            Run the scholarship matcher to score scholarships against your profile first.
          </p>
          {/*
            Linking to the GET route triggers matching and redirects back.
            A more polished flow would use a Server Action — fine for later.
          */}
          <a
            href="/api/scholarships/matches"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 transition-colors duration-150"
          >
            Run Matching
          </a>
        </div>
      </main>
    );
  }

  // Drizzle returns decimal columns as strings — parse to numbers here
  // so the client component receives plain serialisable props.
  const matches: KnapsackItem[] = rows.map((r) => ({
    scholarshipId:  r.scholarshipId!,
    name:           r.name,
    provider:       r.provider,
    evScore:        parseFloat(r.evScore        ?? "0"),
    evPerHour:      parseFloat(r.evPerHour      ?? "0"),
    estimatedHours: parseFloat(r.estimatedHours ?? "0.5"),
    matchScore:     parseFloat(r.matchScore     ?? "0"),
    localityLevel:  r.localityLevel,
    deadline:       r.deadline,
  }));

  return <PlannerClient matches={matches} />;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: error about missing `PlannerClient` module — that's fine, it's created in Task 3.

- [ ] **Step 3: Commit**

```bash
git add app/planner/page.tsx
git commit -m "feat: add /planner server component with auth and DB query"
```

---

### Task 3: Client component (`app/planner/PlannerClient.tsx`)

**Files:**
- Create: `app/planner/PlannerClient.tsx`

- [ ] **Step 1: Create the client component**

```typescript
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

/** Format a dollar amount concisely: $142, $14.20, $1.42 */
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
```

- [ ] **Step 2: Type-check everything**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Start the dev server and verify the page loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000/planner`.

Expected outcomes to verify:
1. Page renders the slider defaulting to 15 hrs
2. Summary bar shows scholarship count, hours, EV
3. Dragging the slider reactively updates the table
4. Rows show name/provider, locality badge, hours, EV, EV/hr, deadline, cumulative columns
5. Any scholarship with a deadline within 14 days shows an amber dot + amber text
6. Setting hours to 1 shows a reduced set (or the "no scholarships fit" message if all are > 0.5 hrs)
7. No console errors

- [ ] **Step 4: Commit**

```bash
git add app/planner/PlannerClient.tsx
git commit -m "feat: add reactive planner client with knapsack optimization and deadline highlighting"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] User inputs available hours → slider, 1–40, default 15
- [x] Reactive updates on drag → `useMemo` + synchronous `solveKnapsack`
- [x] 0/1 knapsack DP with half-hour slots → Task 1
- [x] Prioritized list → sorted by `evScore` desc in `solveKnapsack`
- [x] Cumulative hours and EV columns → computed in `rows` memo
- [x] Deadline column formatted "May 15" / "Jun 1" → `formatDeadline`
- [x] Amber highlight within 14 days → `urgent` flag + `text-amber-400` + dot
- [x] Empty state (no matches) → Task 2 server component
- [x] Empty state (no items fit budget) → inline message in client
- [x] Auth redirect → `auth()` in server component
- [x] Amounts stored in cents, `evScore` already in dollars → parsed via `parseFloat` in page.tsx

**Placeholder scan:** None found.

**Type consistency:**
- `KnapsackItem` defined once in `lib/knapsack.ts`, imported in both `page.tsx` and `PlannerClient.tsx`
- `solveKnapsack` signature matches usage in `PlannerClient`
- `PlannerRow` extends `KnapsackItem` with `rank`, `cumHours`, `cumEV` — all used in render
