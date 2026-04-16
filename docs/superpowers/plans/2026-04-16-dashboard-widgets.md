# Dashboard Widgets: Activity Heatmap + Win Rate Card — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two server-rendered widgets — an Activity Heatmap and a Win Rate Card — to the right column of `/dashboard`, below the existing Quick Actions panel.

**Architecture:** A new `activity_log` table is written to from server actions and API routes via a non-blocking `logActivity` helper. Both widgets are async server components that fetch their own data and receive `userId` as a prop from the dashboard page. `ActivityHeatmap` splits into a server data-fetcher and a `"use client"` grid component to enable CSS tooltips without a JS library.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM (`drizzle-orm/neon-http`), Tailwind CSS, TypeScript, Clerk (auth via `requireOnboarding()`), `@neondatabase/serverless`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `db/schema.ts` | Modify | Add `activityLog` table + `ActivityType` type export |
| `scripts/apply-activity-index.mjs` | Create | One-off script: add expression unique index for idempotency |
| `lib/activity.ts` | Create | Non-blocking `logActivity(userId, type, referenceId?)` helper |
| `app/actions/tracker.ts` | Modify | Call `logActivity` in `saveToTracker` + `updateApplicationStatus` |
| `app/api/essays/route.ts` | Modify | Call `logActivity` after successful essay insert |
| `app/dashboard/_components/ActivityHeatmapGrid.tsx` | Create | `"use client"` grid renderer with CSS group-hover tooltips |
| `app/dashboard/_components/ActivityHeatmap.tsx` | Create | Async server component: fetches activity data, renders card wrapper |
| `app/dashboard/_components/WinRateCard.tsx` | Create | Async server component: fetches win/submit stats, renders card |
| `app/dashboard/page.tsx` | Modify | Wrap right column in flex container; import + render new components |

---

### Task 1: Add `activityLog` table to `db/schema.ts`

**Files:**
- Modify: `db/schema.ts`

- [ ] **Step 1: Append `activityLog` table at the bottom of `db/schema.ts`**

All needed imports (`serial`, `text`, `integer`, `timestamp`) are already at the top of `schema.ts`. Just add:

```ts
// ── Activity log ──────────────────────────────────────────────────────────────
export const activityLog = pgTable("activity_log", {
  id:          serial("id").primaryKey(),
  userId:      text("user_id").notNull(),
  actionType:  text("action_type").notNull(),
  referenceId: integer("reference_id"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityType =
  | "scholarship_added"
  | "status_changed"
  | "essay_created"
  | "application_submitted";
```

Note: The expression unique index for idempotency can't be expressed in Drizzle schema syntax — it lives only in the SQL migration (Task 2). The table definition here is intentionally index-free.

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add db/schema.ts
git commit -m "feat: add activityLog table to Drizzle schema"
```

---

### Task 2: Create the `activity_log` table + unique index in the database

**Files:**
- Create: `scripts/apply-activity-index.mjs`

- [ ] **Step 1: Push the new table to the Neon database**

```bash
npm run db:push
```

When drizzle-kit prompts for confirmation, type `y` and press Enter. This creates the `activity_log` table. Expected output includes a line mentioning `activity_log`.

- [ ] **Step 2: Create the index script**

Create `scripts/apply-activity-index.mjs`:

```js
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS activity_log_dedup
  ON activity_log (
    user_id,
    action_type,
    COALESCE(reference_id, -1),
    date_trunc('day', created_at)
  )
`;

console.log("✓ activity_log_dedup index created");
```

Explanation: `COALESCE(reference_id, -1)` is used because PostgreSQL does not treat `NULL = NULL` in unique indexes — two rows with `NULL` reference_id would not conflict without the COALESCE. Using `-1` as the sentinel makes them conflict as intended.

- [ ] **Step 3: Apply the index**

```bash
node scripts/apply-activity-index.mjs
```

Expected: `✓ activity_log_dedup index created`

- [ ] **Step 4: Commit**

```bash
git add scripts/apply-activity-index.mjs
git commit -m "feat: add activity_log dedup index script"
```

---

### Task 3: Create `lib/activity.ts`

**Files:**
- Create: `lib/activity.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/activity.ts
import { db } from "@/db";
import { activityLog, type ActivityType } from "@/db/schema";

export type { ActivityType };

/**
 * Logs a user action to the activity_log table.
 * - Non-blocking: failures are silently swallowed.
 * - Idempotent: same (userId, type, referenceId) within the same calendar day
 *   is a no-op (handled by DB unique index).
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  referenceId?: number
): Promise<void> {
  try {
    await db
      .insert(activityLog)
      .values({
        userId,
        actionType: type,
        referenceId: referenceId ?? null,
      })
      .onConflictDoNothing();
  } catch {
    // Intentionally swallowed — a logging failure must never break the caller.
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/activity.ts
git commit -m "feat: add logActivity helper (non-blocking, idempotent)"
```

---

### Task 4: Wire `logActivity` into `app/actions/tracker.ts`

**Files:**
- Modify: `app/actions/tracker.ts`

- [ ] **Step 1: Add the import at the top of the file**

After the last existing import in `app/actions/tracker.ts`, add:

```ts
import { logActivity } from "@/lib/activity";
```

- [ ] **Step 2: Log `scholarship_added` in `saveToTracker`**

Find the end of the `saveToTracker` function. The final statement is a `db.update(scholarshipMatches)...` call. Add `logActivity` after it, using `scholarshipId` as the referenceId (same scholarship added by the same user on the same day = idempotent no-op):

```ts
// existing:
  await db
    .update(scholarshipMatches)
    .set({ isSaved: true, updatedAt: new Date() })
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.scholarshipId, scholarshipId),
      ),
    );

  // ADD THIS:
  await logActivity(userId, "scholarship_added", scholarshipId);
}
```

- [ ] **Step 3: Log `status_changed` (and `application_submitted`) in `updateApplicationStatus`**

Find the end of `updateApplicationStatus`. The final statement is the `db.update(applications).set(...)` call. Add after it:

```ts
// existing:
  await db
    .update(applications)
    .set({ status, statusHistory: [...history, newEntry], updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  // ADD THIS:
  await logActivity(userId, "status_changed", id);
  if (status === "submitted") {
    await logActivity(userId, "application_submitted", id);
  }
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/actions/tracker.ts
git commit -m "feat: log activity on scholarship save and status change"
```

---

### Task 5: Wire `logActivity` into `app/api/essays/route.ts`

**Files:**
- Modify: `app/api/essays/route.ts`

- [ ] **Step 1: Add the import**

After the existing imports in `app/api/essays/route.ts`, add:

```ts
import { logActivity } from "@/lib/activity";
```

- [ ] **Step 2: Call `logActivity` after the successful essay insert**

Find the line `return NextResponse.json(inserted, { status: 200 });` inside the POST handler's try block. Add the log call immediately before it:

```ts
    const [inserted] = await db
      .insert(studentEssays)
      .values({
        userId,
        title,
        prompt,
        content,
        archetype,
        embedding,
        wordCount,
        scholarshipId: scholarshipId ?? null,
      })
      .returning({ id: studentEssays.id, createdAt: studentEssays.createdAt });

    // ADD THIS:
    await logActivity(userId, "essay_created", inserted.id);

    return NextResponse.json(inserted, { status: 200 });
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/api/essays/route.ts
git commit -m "feat: log activity on essay creation"
```

---

### Task 6: Create `ActivityHeatmapGrid.tsx` (client component)

**Files:**
- Create: `app/dashboard/_components/ActivityHeatmapGrid.tsx`

This component is pure rendering — the server component (Task 7) computes all data and passes it as serializable props.

- [ ] **Step 1: Create the file**

```tsx
// app/dashboard/_components/ActivityHeatmapGrid.tsx
"use client";

export interface HeatmapCell {
  date:     string;   // ISO "YYYY-MM-DD"
  label:    string;   // "Apr 14, 2026"
  count:    number;
  isFuture: boolean;
}

export interface MonthMarker {
  colIndex: number; // 0–11
  label:    string; // "Apr"
}

interface Props {
  cells:        HeatmapCell[];  // exactly 84 items, Mon–Sun per week, oldest week first
  monthMarkers: MonthMarker[];
}

function cellColor(count: number, isFuture: boolean): string {
  if (isFuture) return "bg-gray-50 border border-gray-100";
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-emerald-200";
  if (count <= 3)  return "bg-emerald-400";
  if (count <= 6)  return "bg-emerald-500";
  return "bg-emerald-700";
}

export function ActivityHeatmapGrid({ cells, monthMarkers }: Props) {
  return (
    <div className="flex flex-col gap-1">

      {/* Month label row */}
      <div className="relative h-[12px]" style={{ paddingLeft: "20px" }}>
        {monthMarkers.map((m) => (
          <span
            key={`${m.label}-${m.colIndex}`}
            className="absolute text-[9px] leading-none text-gray-400"
            style={{ left: `${20 + m.colIndex * 14}px`, top: 0 }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex items-start gap-1">

        {/* Day-of-week labels: M, W, F only (rows 0, 2, 4) */}
        <div
          className="flex flex-col text-[9px] leading-none text-gray-400"
          style={{ gap: "2px" }}
        >
          {["M", "", "W", "", "F", "", ""].map((label, i) => (
            <span
              key={i}
              className="flex items-center"
              style={{ height: "12px", lineHeight: "12px" }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Grid — column-major flow renders weeks left→right */}
        <div
          className="grid"
          style={{
            gridTemplateRows:    "repeat(7, 12px)",
            gridTemplateColumns: "repeat(12, 12px)",
            gridAutoFlow:        "column",
            gap:                 "2px",
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.date}
              className={`relative group rounded-sm ${cellColor(cell.count, cell.isFuture)}`}
              style={{ width: "12px", height: "12px" }}
            >
              {!cell.isFuture && (
                <span
                  className={[
                    "pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5",
                    "-translate-x-1/2 whitespace-nowrap rounded bg-gray-900",
                    "px-2 py-1 text-[10px] leading-none text-white",
                    "opacity-0 transition-opacity duration-100 group-hover:opacity-100",
                  ].join(" ")}
                >
                  {cell.count} action{cell.count !== 1 ? "s" : ""} on {cell.label}
                  {/* Tooltip arrow */}
                  <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/_components/ActivityHeatmapGrid.tsx
git commit -m "feat: add ActivityHeatmapGrid client component with CSS tooltips"
```

---

### Task 7: Create `ActivityHeatmap.tsx` (server component)

**Files:**
- Create: `app/dashboard/_components/ActivityHeatmap.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/dashboard/_components/ActivityHeatmap.tsx
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import {
  ActivityHeatmapGrid,
  type HeatmapCell,
  type MonthMarker,
} from "./ActivityHeatmapGrid";

interface Props {
  userId: string;
}

/** Returns YYYY-MM-DD using UTC so the grid never drifts by timezone. */
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function formatCellLabel(isoDate: string): string {
  const [y, m, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function ActivityHeatmap({ userId }: Props) {
  const today    = new Date();
  const todayISO = toISODate(today);

  // Align columns to Monday weeks: column 11 = the current week.
  const dowSun           = today.getUTCDay();          // 0=Sun … 6=Sat
  const daysToMonday     = (dowSun + 6) % 7;           // days elapsed since Mon
  const currentWeekMonday = addDays(today, -daysToMonday);
  const startDate        = addDays(currentWeekMonday, -77); // 11 full prior weeks
  const startISO         = toISODate(startDate);

  // Fetch per-day event counts for the 12-week window.
  const rows = await db
    .select({
      day:   sql<string>`date_trunc('day', ${activityLog.createdAt})::date::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.userId, userId),
        gte(activityLog.createdAt, startDate),
      )
    )
    .groupBy(sql`date_trunc('day', ${activityLog.createdAt})::date`);

  const dayCounts = new Map<string, number>(rows.map((r) => [r.day, r.count]));

  // Build 84 cells in column-major order: Mon(row 0)…Sun(row 6) per week.
  // With CSS gridAutoFlow: "column", index i = week⌊i/7⌋, day(i%7).
  const cells: HeatmapCell[] = Array.from({ length: 84 }, (_, i) => {
    const weekIndex = Math.floor(i / 7);
    const dayIndex  = i % 7; // 0=Mon … 6=Sun
    const date      = addDays(startDate, weekIndex * 7 + dayIndex);
    const iso       = toISODate(date);
    return {
      date:     iso,
      label:    formatCellLabel(iso),
      count:    dayCounts.get(iso) ?? 0,
      isFuture: iso > todayISO,
    };
  });

  // Month markers: show the month abbreviation above the first column
  // of each calendar month.
  const monthMarkers: MonthMarker[] = [];
  let lastMonth = -1;
  for (let week = 0; week < 12; week++) {
    const mondayOfWeek = addDays(startDate, week * 7);
    const month = mondayOfWeek.getUTCMonth();
    if (month !== lastMonth) {
      monthMarkers.push({
        colIndex: week,
        label: mondayOfWeek.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
      });
      lastMonth = month;
    }
  }

  // Streak: consecutive days with ≥1 event walking backward from today.
  // If today has 0 events the loop breaks immediately → streak = 0.
  let streak = 0;
  for (let d = 0; ; d++) {
    const iso = toISODate(addDays(today, -d));
    if (iso < startISO) break;
    if ((dayCounts.get(iso) ?? 0) > 0) {
      streak++;
    } else {
      break;
    }
  }

  const streakText =
    streak > 0 ? `${streak}-day streak 🔥` : "Start a streak today";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Your activity</h2>
        <p className="text-xs text-gray-500 mt-0.5">{streakText}</p>
      </div>
      {/* overflow-visible is intentional: CSS tooltips must escape card bounds */}
      <div className="px-4 py-4 overflow-visible">
        <ActivityHeatmapGrid cells={cells} monthMarkers={monthMarkers} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/_components/ActivityHeatmap.tsx
git commit -m "feat: add ActivityHeatmap server component"
```

---

### Task 8: Create `WinRateCard.tsx` (server component)

**Files:**
- Create: `app/dashboard/_components/WinRateCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/dashboard/_components/WinRateCard.tsx
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, and, gte, lt, count, sum, sql } from "drizzle-orm";

interface Props {
  userId: string;
}

function fmtDollarsShort(cents: number): string {
  if (cents <= 0)             return "$0";
  if (cents >= 1_000_000_00) return `$${(cents / 1_000_000_00).toFixed(1)}M`;
  if (cents >= 1_000_00)     return `$${Math.round(cents / 1_000_00)}K`;
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export async function WinRateCard({ userId }: Props) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // "submitted" denominator = statuses that represent a completed submission attempt
  const submittedFilter = sql`${applications.status} IN ('submitted','won','lost')`;

  const [
    [allSubmitted],
    [allWon],
    [wonAmount],
    [recentSubmitted],
    [recentWon],
    [prevSubmitted],
    [prevWon],
  ] = await Promise.all([
    // All-time: submissions
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), submittedFilter)),
    // All-time: wins
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "won"))),
    // All-time: dollar amount of wins
    db.select({ s: sum(applications.awardAmount) }).from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "won"))),
    // Current 30-day: submissions
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), submittedFilter,
        gte(applications.updatedAt, thirtyDaysAgo))),
    // Current 30-day: wins
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "won"),
        gte(applications.updatedAt, thirtyDaysAgo))),
    // Prior 30-day (30–60 days ago): submissions
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), submittedFilter,
        gte(applications.updatedAt, sixtyDaysAgo), lt(applications.updatedAt, thirtyDaysAgo))),
    // Prior 30-day: wins
    db.select({ c: count() }).from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "won"),
        gte(applications.updatedAt, sixtyDaysAgo), lt(applications.updatedAt, thirtyDaysAgo))),
  ]);

  const submittedCount = allSubmitted.c;
  const wonCount       = allWon.c;
  const wonCents       = Number(wonAmount.s ?? 0);
  const winRate        = submittedCount > 0
    ? Math.round((wonCount / submittedCount) * 100)
    : 0;

  // Trend indicator: compare this-30d vs prior-30d win rate.
  // Both periods need at least one submission to produce a meaningful rate.
  const currentRate = recentSubmitted.c > 0
    ? recentWon.c / recentSubmitted.c
    : null;
  const priorRate = prevSubmitted.c > 0
    ? prevWon.c / prevSubmitted.c
    : null;
  const trend =
    currentRate !== null && priorRate !== null
      ? currentRate > priorRate ? "up"
      : currentRate < priorRate ? "down"
      : null
    : null;

  const showPlaceholder = submittedCount < 3;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Win Rate</h2>
        {trend === "up" && (
          <span className="text-xs font-medium text-emerald-600">↑ Improving</span>
        )}
        {trend === "down" && (
          <span className="text-xs font-medium text-red-500">↓ Declining</span>
        )}
      </div>

      {showPlaceholder ? (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Submit more applications<br />to see your win rate
          </p>
        </div>
      ) : (
        <div className="px-5 py-4">
          <div className="mb-4 text-center">
            <p className="text-4xl font-bold text-gray-900">{winRate}%</p>
            <p className="mt-1 text-xs text-gray-500">
              {wonCount} won / {submittedCount} submitted
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{submittedCount}</p>
              <p className="text-[10px] text-gray-400">submitted</p>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{wonCount}</p>
              <p className="text-[10px] text-gray-400">won</p>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{fmtDollarsShort(wonCents)}</p>
              <p className="text-[10px] text-gray-400">won to date</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/_components/WinRateCard.tsx
git commit -m "feat: add WinRateCard server component"
```

---

### Task 9: Update `app/dashboard/page.tsx`

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Add component imports**

After the existing `import { SaveToTrackerButton }` line (line 9 of the file), add:

```ts
import { ActivityHeatmap } from "./_components/ActivityHeatmap";
import { WinRateCard }     from "./_components/WinRateCard";
```

- [ ] **Step 2: Wrap the Quick Actions panel in a right-column flex container**

Find this exact block in `page.tsx` (starts near line 471):

```tsx
        {/* Quick Actions panel */}
        <div className="w-full lg:w-64 shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-500 leading-snug">{a.description}</p>
                </div>
                <IconChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
```

Replace with:

```tsx
        {/* Right column: Quick Actions + Activity Heatmap + Win Rate */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">

          {/* Quick Actions panel — unchanged */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}>
                    {a.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{a.label}</p>
                    <p className="text-xs text-gray-500 leading-snug">{a.description}</p>
                  </div>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>

          <ActivityHeatmap userId={userId} />
          <WinRateCard userId={userId} />

        </div>
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 4: Verify Next.js production build**

```bash
npm run build 2>&1 | tail -25
```

Expected: `✓ Compiled successfully`. Route `/dashboard` should appear with no errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: render ActivityHeatmap and WinRateCard in dashboard right column"
```

---

### Task 10: Final verification + push

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Expected: no output.

- [ ] **Step 2: Production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`. No errors on any route.

- [ ] **Step 3: Push branch**

```bash
git push -u origin feature/dashboard-widgets
```

Expected: branch pushed to remote. Ready for PR review against `main`.

---

## Self-Review: Spec Coverage

| Spec requirement | Task |
|-----------------|------|
| `activity_log` table (id, user_id, action_type, reference_id, created_at) | Task 1 |
| Unique index for idempotency (same event, same day = no-op) | Task 2 |
| `logActivity` helper in `lib/activity.ts`, non-blocking | Task 3 |
| Wire into `saveToTracker` (scholarship_added) | Task 4 |
| Wire into `updateApplicationStatus` (status_changed + application_submitted) | Task 4 |
| Wire into `/api/essays` POST (essay_created) | Task 5 |
| 7×12 grid, 12px rounded cells, column-major flow | Task 6 |
| Color scale: gray-100 → emerald-200/400/500/700 | Task 6 |
| CSS tooltip above cell, styled dark pill with arrow, 100ms fade | Task 6 |
| M/W/F day-of-week labels, month markers | Task 6, 7 |
| Streak header subcaption | Task 7 |
| Server component, fetches own data | Task 7, 8 |
| Win rate big number (%), placeholder when <3 submitted | Task 8 |
| 3 inline stats row (submitted / won / $ won) | Task 8 |
| Trend indicator vs prior 30 days | Task 8 |
| Widgets placed in right column below Quick Actions | Task 9 |
| Right column width matches Quick Actions exactly | Task 9 (wrapper owns width) |
| No chart library | Tasks 6-8 |
| Match actual dashboard aesthetic (white/gray-200/indigo) | Tasks 6-9 |
| Push on `feature/dashboard-widgets` branch | Task 10 |
