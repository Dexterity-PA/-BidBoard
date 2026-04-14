# Monthly Strategy Planner — Design Spec

**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

A `/planner` page where the user sets their available hours for the month via a slider, and the system runs a 0/1 knapsack optimization to select the scholarship subset that maximizes total expected value within that hour budget. The list updates reactively as the slider is dragged — no submit button.

---

## Architecture

Three new files, no new API routes:

| File | Role |
|---|---|
| `lib/knapsack.ts` | Pure 0/1 DP function — no imports beyond types, no side effects |
| `app/planner/PlannerClient.tsx` | `"use client"` — owns slider state, runs knapsack on every render, displays results |
| `app/planner/page.tsx` | Server component — auth, DB query, empty state, passes data to client |

**Data source:** `scholarship_matches` joined to `scholarships`, filtered to `isDismissed = false` for the current user. Uses already-computed `evScore`, `estimatedHours`, `matchScore` from the matches table. No re-scoring on this page.

---

## 1. Knapsack Algorithm (`lib/knapsack.ts`)

### Types

```ts
export type KnapsackItem = {
  scholarshipId: number;
  name: string;
  provider: string;
  evScore: number;        // dollars
  evPerHour: number;      // dollars per hour
  estimatedHours: number; // e.g. 0.5, 1.5, 3.5
  matchScore: number;
  localityLevel: string | null;
  deadline: string | null; // ISO date "YYYY-MM-DD"
};
```

### Export

```ts
export function solveKnapsack(items: KnapsackItem[], budgetHours: number): KnapsackItem[]
```

### Algorithm

1. `budgetSlots = Math.round(budgetHours * 2)` — converts 1–40 hrs to 2–80 integer slots
2. Each item weight: `Math.round(item.estimatedHours * 2)`
3. Bottom-up DP: `dp[j]` = max total `evScore` achievable with exactly `j` slots of budget
4. `keep[i][j]` boolean matrix for traceback
5. Traceback from `dp[budgetSlots]` to recover selected items
6. Return selected subset sorted by `evScore` descending (highest EV = rank 1)

Items with `estimatedHours` weight of 0 are assigned weight 1 (half hour minimum) to avoid degenerate DP.

---

## 2. Server Component (`app/planner/page.tsx`)

1. `auth()` from `@clerk/nextjs/server` — redirect to `/sign-in` if no session
2. Query `scholarshipMatches` joined to `scholarships` where `userId = currentUserId` and `isDismissed = false`
3. Select: `scholarshipId`, `matchScore`, `evScore`, `evPerHour`, `estimatedHours` from matches + `name`, `provider`, `localityLevel`, `deadline` from scholarships
4. **Empty state:** if zero rows, render a centered card: "No matches yet. Run matching to get started." with a link/button to trigger `GET /api/scholarships/matches`
5. Otherwise: render `<PlannerClient matches={rows} />`

All DB data is serialized to plain objects before passing to the client component (Drizzle `decimal` fields → `parseFloat`).

---

## 3. Client Component (`app/planner/PlannerClient.tsx`)

### State
- `hours: number` — default 15, range 1–40

### Computation (on every render, synchronous)
1. Call `solveKnapsack(matches, hours)` → `selected: KnapsackItem[]`
2. Walk `selected` in order to build cumulative columns:
   - `cumHours[i] = sum of estimatedHours for items 0..i`
   - `cumEV[i] = sum of evScore for items 0..i`
3. Summary totals: `selected.length`, `cumHours[last]`, `cumEV[last]`

### Deadline highlighting
- Parse `item.deadline` as a date
- If `deadline` is within 14 calendar days of today: render deadline cell with `text-amber-400` and an amber dot indicator
- If no deadline: render `—`
- Format: `'May 15'`, `'Jun 1'` (no year unless it's a different year)

### Layout

Dark theme matching existing app: `bg-slate-950`, `bg-slate-900` cards, `emerald-500` accent.

```
┌──────────────────────────────────────────────────────┐
│  Monthly Strategy Planner                             │  bg-slate-950
│  "Maximize your scholarship EV within your…"         │
│                                                      │
│  Hours available this month                          │
│  [━━━━━━━━━━●────────────────]  15 hrs              │  emerald slider
│                                                      │
│  ┌─── Summary bar ────────────────────────────────┐ │
│  │  6 scholarships · 18.5 hrs · $142 expected    │ │  slate-800 pill
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  # │ Name + Provider   │ Loc  │ Hrs │  EV  │ EV/hr │ Deadline │ Cum.Hrs │ Cum.EV │
│  1 │ AXA Achievement   │ natl │ 0.5 │ $28  │ $56/h │ Jun 1    │   0.5   │  $28   │
│  2 │ Maricopa County   │ state│ 0.5 │ $21  │ $42/h │ ●Apr 24  │   1.0   │  $49   │  ← amber dot + text
│  … │                   │      │     │      │       │          │         │        │
└──────────────────────────────────────────────────────┘
```

### Columns
| Column | Content |
|---|---|
| `#` | Rank (1-based) |
| Name | `name` (bold) with `provider` as muted subtext |
| Loc | `localityLevel` as a small badge (national/state/local/niche) |
| Hrs | `estimatedHours` (e.g. `0.5h`, `3.5h`) |
| EV | `evScore` formatted as `$28` |
| EV/hr | `evPerHour` formatted as `$56/hr` |
| Deadline | Formatted date, amber if ≤14 days away |
| Cum. Hrs | Running total hours |
| Cum. EV | Running total EV |

### Locality badge colors
- `national` → slate-600 bg
- `state` → blue-900/blue-400 text
- `local` → purple-900/purple-400 text
- niche/other → slate-700

---

## 4. Empty State

If no matches exist: centered card on slate-950, message "No scholarship matches yet", subtext "Run the matcher to score scholarships against your profile first", and an emerald button that calls `GET /api/scholarships/matches` then reloads.

---

## Out of Scope

- Saving the plan / persisting the selected set
- "Apply" / "Save" actions on individual rows (those belong on a dashboard)
- Mobile-optimized table layout (responsive is nice-to-have, not required)
- Pagination (50 scholarships max, all fit in one list)
