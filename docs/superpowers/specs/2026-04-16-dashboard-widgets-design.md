# Dashboard Widgets: Activity Heatmap + Win Rate Card

**Date:** 2026-04-16  
**Branch:** feature/dashboard-activity-heatmap (or feature/dashboard-win-rate)  
**Status:** Approved

---

## Overview

Two new server-component widgets added to the right-hand column of the dashboard (`/dashboard`), placed below the existing Quick Actions panel. Both match the current dashboard aesthetic: white cards, `border-gray-200`, indigo/emerald accents on a light background.

No existing widgets are modified. Only the right-column wrapper div gains `flex flex-col gap-4` to stack the panels.

---

## 1. Data Layer

### 1.1 New table: `activityLog`

```sql
CREATE TABLE activity_log (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  action_type TEXT        NOT NULL,
  reference_id INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX activity_log_dedup
  ON activity_log (user_id, action_type, reference_id, date_trunc('day', created_at));
```

- `action_type` values: `scholarship_added`, `status_changed`, `essay_created`, `application_submitted`
- `reference_id`: nullable int (application id, essay id) used for deduplication
- Unique index enforces idempotency: same action on same item on same calendar day = `ON CONFLICT DO NOTHING`

**Drizzle schema addition** (`db/schema.ts`):

```ts
export const activityLog = pgTable(
  "activity_log",
  {
    id:          serial("id").primaryKey(),
    userId:      text("user_id").notNull(),
    actionType:  text("action_type").notNull(),
    referenceId: integer("reference_id"),
    createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dedupIdx: uniqueIndex("activity_log_dedup").on(
      t.userId,
      t.actionType,
      t.referenceId,
      sql`date_trunc('day', ${t.createdAt})`
    ),
  })
);
```

**Migration file:** `drizzle/0003_activity_log.sql`

### 1.2 Helper: `lib/activity.ts`

```ts
export type ActivityType =
  | "scholarship_added"
  | "status_changed"
  | "essay_created"
  | "application_submitted";

export async function logActivity(
  userId: string,
  type: ActivityType,
  referenceId?: number
): Promise<void>
```

- Inserts into `activity_log` with `ON CONFLICT DO NOTHING`
- Entire body wrapped in `try/catch` — never throws, never blocks the caller
- Imported from server actions and API routes; not a `"use server"` module itself

### 1.3 Wiring points

| File | Function | Log call |
|------|----------|----------|
| `app/actions/tracker.ts` | `addApplication()` | `logActivity(userId, 'scholarship_added', application.id)` |
| `app/actions/tracker.ts` | `updateApplicationStatus()` | `logActivity(userId, 'status_changed', id)` + if new status === 'submitted': also `logActivity(userId, 'application_submitted', id)` |
| `app/api/essays/route.ts` | POST handler (after insert) | `logActivity(userId, 'essay_created', inserted.id)` |

All calls placed after the primary DB write succeeds, inside `try/catch`. A logging failure never surfaces to the user.

---

## 2. Widget: Activity Heatmap

### 2.1 File location

`app/dashboard/_components/ActivityHeatmap.tsx` — async server component.

### 2.2 Data query

```ts
// Fetch last 84 days of per-day counts for this user
const rows = await db
  .select({
    day: sql<string>`date_trunc('day', created_at)::date`,
    count: sql<number>`count(*)::int`,
  })
  .from(activityLog)
  .where(
    and(
      eq(activityLog.userId, userId),
      gte(activityLog.createdAt, subDays(new Date(), 83))
    )
  )
  .groupBy(sql`date_trunc('day', created_at)::date`);
```

Build a `Map<string, number>` keyed by ISO date string (`YYYY-MM-DD`).

**Streak calculation**: walk backward from today. Increment streak for each consecutive day with count > 0. Stop at first zero day.

### 2.3 Grid layout

- 12 columns (weeks) × 7 rows (days, Mon–Sun)
- Column = one week; cell [row][col] = a specific calendar date
- Grid built as a flat array of 84 date slots, ordered oldest→newest
- CSS: `display: grid; grid-template-rows: repeat(7, 12px); grid-template-columns: repeat(12, 12px); gap: 2px; grid-auto-flow: column`

### 2.4 Color scale

| Count | Tailwind class |
|-------|---------------|
| 0 | `bg-gray-100` |
| 1 | `bg-emerald-200` |
| 2–3 | `bg-emerald-400` |
| 4–6 | `bg-emerald-500` |
| 7+ | `bg-emerald-700` |

### 2.5 Labels

- **Day labels** (left of grid): M / W / F only, at rows 1, 3, 5 (0-indexed). `text-[9px] text-gray-400`.
- **Month markers** (above grid): show month abbreviation above the first column that starts a new month. `text-[9px] text-gray-400`.

### 2.6 Tooltip

**Not** a native `title` attribute — too slow (500ms delay), inconsistent styling, cheap feel.

**Approach**: split the heatmap into two files:
- `ActivityHeatmap.tsx` — async server component: fetches data + computes streak, passes serialized `dayCounts: Record<string, number>` and `dates: string[]` as props to the grid
- `ActivityHeatmapGrid.tsx` — `"use client"` component: renders the 84-cell grid with CSS tooltips

Each cell is `relative group`:
```jsx
<div className="relative group h-[12px] w-[12px] rounded-sm {colorClass}">
  <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2
                   whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] text-white
                   opacity-0 transition-opacity duration-100 group-hover:opacity-100">
    {count} action{count !== 1 ? 's' : ''} on {formatted date}
    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
  </span>
</div>
```

- Tooltip appears above cell by default (always-above is fine — the heatmap sits low in the right column)
- `z-50` ensures it renders above siblings; the heatmap card must **not** have `overflow-hidden`
- Date format: `"Apr 14, 2026"` via `toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`

### 2.7 Rendered structure

```
┌─────────────────────────────────────────────┐
│ Your activity                 🔥 5-day streak│
│ [month labels row]                           │
│ M [■ ■ □ ■ ■ ■ □  ...  12 cols]            │
│   [■ □ □ □ ■ □ □  ...       ]              │
│ W [□ ■ ■ ■ □ ■ ■  ...       ]              │
│   [□ □ □ □ □ □ □  ...       ]              │
│ F [■ ■ □ □ ■ ■ □  ...       ]              │
│   [□ □ □ □ □ □ □  ...       ]              │
│   [■ □ ■ □ ■ □ ■  ...       ]              │
└─────────────────────────────────────────────┘
```

### 2.8 Empty state

If no activity in 84 days, streak shows "Start a streak today" and all cells render gray.

---

## 3. Widget: Win Rate Card

### 3.1 File location

`app/dashboard/_components/WinRateCard.tsx` — async server component.

### 3.2 Data query

Two counts from `applications` table, filtered by `userId`:

```ts
const [submitted, won, wonAmount, prevSubmitted, prevWon] = await Promise.all([
  // submitted count (all time)
  db.select({ c: count() }).from(applications)
    .where(and(eq(applications.userId, userId), inArray(applications.status, ['submitted','won','lost']))),
  // won count (all time)
  db.select({ c: count() }).from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.status, 'won'))),
  // total award amount won
  db.select({ s: sum(applications.awardAmount) }).from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.status, 'won'))),
  // submitted this 30 days (for trend)
  db.select({ c: count() }).from(applications)
    .where(and(eq(applications.userId, userId),
      inArray(applications.status, ['submitted','won','lost']),
      gte(applications.appliedAt, subDays(new Date(), 30)))),
  // won this 30 days (for trend)
  db.select({ c: count() }).from(applications)
    .where(and(eq(applications.userId, userId),
      eq(applications.status, 'won'),
      gte(applications.appliedAt, subDays(new Date(), 30)))),
]);
```

**Trend**: current 30-day win rate vs prior 30-day win rate. Show `↑` (emerald) if improved, `↓` (red) if declined, nothing if unchanged or insufficient data.

### 3.3 Rendering

**Below threshold (submitted < 3)**:
```
┌──────────────────────────────┐
│ Win Rate                     │
│                              │
│  Submit more applications    │
│  to see your win rate        │
└──────────────────────────────┘
```

**Above threshold**:
```
┌──────────────────────────────┐
│ Win Rate               ↑     │
│                              │
│        33%                   │
│    1 won / 3 submitted       │
│                              │
│  3 submitted  1 won  $500    │
└──────────────────────────────┘
```

- Big number: `text-4xl font-bold text-gray-900`
- Caption: `text-xs text-gray-500`
- Three bottom stats: `text-xs font-semibold text-gray-700` labels, `text-[10px] text-gray-400` values — separator dots between them
- Card style: `rounded-xl border border-gray-200 bg-white shadow-sm` (matches Quick Actions)

---

## 4. Right-Column Structure Change

**Before** (`app/dashboard/page.tsx` lines ~471–499):
```jsx
{/* Quick Actions panel */}
<div className="w-full lg:w-64 shrink-0 rounded-xl border ...">
  ...
</div>
```

**After**:
```jsx
{/* Right column: Quick Actions + new widgets */}
<div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
  {/* existing Quick Actions panel — unchanged */}
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    ...
  </div>
  <ActivityHeatmap userId={userId} />
  <WinRateCard userId={userId} />
</div>
```

The `w-full lg:w-64 shrink-0` sizing moves from the Quick Actions div to the outer wrapper, so all three panels share the same column width automatically.

---

## 5. Files Changed

| File | Change |
|------|--------|
| `db/schema.ts` | Add `activityLog` table + `ActivityType` export |
| `drizzle/0003_activity_log.sql` | New migration |
| `lib/activity.ts` | New file — `logActivity` helper |
| `app/actions/tracker.ts` | Call `logActivity` in `addApplication` + `updateApplicationStatus` |
| `app/api/essays/route.ts` | Call `logActivity` in POST handler |
| `app/dashboard/_components/ActivityHeatmap.tsx` | New async server component (fetches data, renders wrapper) |
| `app/dashboard/_components/ActivityHeatmapGrid.tsx` | New client component (renders grid + CSS tooltips) |
| `app/dashboard/_components/WinRateCard.tsx` | New server component |
| `app/dashboard/page.tsx` | Wrap right column, add data queries, render new components |

---

## 6. Non-Goals

- No chart library (recharts, d3, etc.)
- No client-side interactivity beyond native `title` tooltips
- No changes to existing Quick Actions, stat cards, Top Matches, or Deadline strip
- No new API routes — all data fetched server-side in page.tsx and passed as props
