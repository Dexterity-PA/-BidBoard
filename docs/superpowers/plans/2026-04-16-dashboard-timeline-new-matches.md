# Dashboard Widgets: 14-Day Deadline Timeline + New Matches Feed

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new dashboard widgets — a 14-day deadline dot timeline and a "new for you" recent matches feed — placed side-by-side below the Top Matches table on `/dashboard`.

**Architecture:** Both widgets are server components that receive pre-fetched data from `page.tsx`'s `Promise.all`. The timeline delegates hover-tooltip rendering to a thin `"use client"` component. Relative timestamps in the feed use a tiny `RelativeTime` client component to avoid stale server strings. No new npm packages, no new DB tables.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM, Tailwind CSS, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-16-dashboard-deadline-timeline-new-matches-design.md`

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `app/dashboard/_components/dashboard-utils.ts` | **Create** | Shared pure helpers: `fmtAmount`, `evScoreBadge` (extracted from page.tsx) |
| `app/dashboard/_components/RelativeTime.tsx` | **Create** | `"use client"` component — renders relative timestamp on mount |
| `app/dashboard/_components/DeadlineTimelineDots.tsx` | **Create** | `"use client"` component — 14-column dot grid with hover tooltips |
| `app/dashboard/_components/DeadlineTimeline.tsx` | **Create** | Server component — card shell, data grouping, empty state |
| `app/dashboard/_components/NewMatchesFeed.tsx` | **Create** | Server component — new matches card with rows and empty state |
| `app/dashboard/page.tsx` | **Modify** | Add 2 queries, render new grid row, update imports |

---

## Task 1: Create shared dashboard utilities

These two helpers are currently inlined in `page.tsx`. Both new components need them. Extract before building any component so there's no duplication.

**Files:**
- Create: `app/dashboard/_components/dashboard-utils.ts`
- Modify: `app/dashboard/page.tsx` (remove duplicate definitions, import from utils)

- [ ] **Step 1.1: Create the utils file**

```ts
// app/dashboard/_components/dashboard-utils.ts

export function fmtAmount(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min ?? max!);
}

export function evScoreBadge(raw: string | null): { bg: string; text: string } {
  const n = parseFloat(raw ?? "0");
  if (n >= 500_000) return { bg: "bg-emerald-50", text: "text-emerald-700" };
  if (n >= 100_000) return { bg: "bg-blue-50",    text: "text-blue-700"   };
  return                    { bg: "bg-gray-100",   text: "text-gray-600"   };
}
```

> Note: the thresholds above match the existing `evScoreBadge` in `page.tsx` exactly (`n >= 5000_00` is 500000 cents, `n >= 1000_00` is 100000 cents). Preserve them.

- [ ] **Step 1.2: Update page.tsx to use the shared utils**

In `app/dashboard/page.tsx`:

Remove the two inline function definitions:
```ts
// DELETE these two functions (keep all others):
function fmtAmount(min: number | null, max: number | null): string { ... }
function evScoreBadge(raw: string | null): { bg: string; text: string } { ... }
```

Add this import at the top (with the other local imports):
```ts
import { fmtAmount, evScoreBadge } from "./_components/dashboard-utils";
```

- [ ] **Step 1.3: TypeScript check**

```bash
cd /Users/main/PycharmProjects/Bidboard
npx tsc --noEmit
```

Expected: no errors. If `fmtAmount` or `evScoreBadge` have type errors, fix them before continuing.

- [ ] **Step 1.4: Commit**

```bash
git add app/dashboard/_components/dashboard-utils.ts app/dashboard/page.tsx
git commit -m "refactor: extract fmtAmount and evScoreBadge to dashboard-utils"
```

---

## Task 2: Build the RelativeTime client component

Used in the New Matches Feed to render "2d ago", "5h ago" etc. Must be client-side to avoid stale server-rendered timestamps on cached pages.

**Files:**
- Create: `app/dashboard/_components/RelativeTime.tsx`

- [ ] **Step 2.1: Create the file**

```tsx
// app/dashboard/_components/RelativeTime.tsx
"use client";

import { useEffect, useState } from "react";

function getRelativeLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

interface Props {
  date: Date;
  className?: string;
}

export function RelativeTime({ date, className }: Props) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    setLabel(getRelativeLabel(date));
  }, [date]);

  if (!label) return null;
  return <span className={className}>{label}</span>;
}
```

> **Why empty on server:** `useState("")` renders nothing until the client `useEffect` fires, so hydration always matches. Do not pass an SSR fallback — the mismatch would cause a hydration error.

- [ ] **Step 2.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add app/dashboard/_components/RelativeTime.tsx
git commit -m "feat: add RelativeTime client component for live relative timestamps"
```

---

## Task 3: Build DeadlineTimelineDots (client component)

The interactive part of the timeline. Receives pre-grouped data from the server component and renders 14 columns of dots with hover tooltips.

**Files:**
- Create: `app/dashboard/_components/DeadlineTimelineDots.tsx`

- [ ] **Step 3.1: Define the data shape used between server and client**

This type is used in both `DeadlineTimelineDots.tsx` and `DeadlineTimeline.tsx`. Define it in `dashboard-utils.ts` so both files import it from one place.

Add to `app/dashboard/_components/dashboard-utils.ts`:

```ts
export type TimelineItem = {
  id: number;               // applications.id
  scholarshipId: number;
  name: string;
  deadline: string;         // "YYYY-MM-DD"
  status: string;
  awardCents: number;       // awardAmount ?? amountMax ?? amountMin ?? 0
};

export type TimelineDay = {
  dateStr: string;          // "YYYY-MM-DD"
  dayLabel: string;         // "Mon"
  dateNum: number;          // 14
  items: TimelineItem[];
};

/** Build the 14-day slot array. Call with today's ISO date string. */
export function buildTimelineDays(today: string, items: TimelineItem[]): TimelineDay[] {
  const grouped = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const existing = grouped.get(item.deadline) ?? [];
    existing.push(item);
    grouped.set(item.deadline, existing);
  }

  const days: TimelineDay[] = [];
  const baseDate = new Date(today + "T12:00:00");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      dayLabel: dayNames[d.getDay()],
      dateNum:  d.getDate(),
      items:    grouped.get(dateStr) ?? [],
    });
  }
  return days;
}

export function dotSizeClass(awardCents: number): string {
  const dollars = awardCents / 100;
  if (dollars > 2000) return "w-4 h-4";
  if (dollars >= 500) return "w-3 h-3";
  return "w-2 h-2";
}

export function dotColorClass(deadline: string, today: string): string {
  const todayMs  = new Date(today + "T12:00:00").getTime();
  const deadMs   = new Date(deadline + "T12:00:00").getTime();
  const diffDays = Math.ceil((deadMs - todayMs) / 86_400_000);
  if (diffDays <= 1) return "bg-red-400";
  if (diffDays <= 3) return "bg-amber-400";
  return "bg-indigo-400";
}

export function fmtAwardCents(cents: number): string {
  if (cents === 0) return "—";
  if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(0)}K`;
  return `$${(cents / 100).toLocaleString()}`;
}
```

- [ ] **Step 3.2: TypeScript check after updating utils**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.3: Create DeadlineTimelineDots.tsx**

```tsx
// app/dashboard/_components/DeadlineTimelineDots.tsx
"use client";

import Link from "next/link";
import {
  type TimelineDay,
  dotSizeClass,
  dotColorClass,
  fmtAwardCents,
} from "./dashboard-utils";

interface Props {
  days: TimelineDay[];
  today: string;
}

export function DeadlineTimelineDots({ days, today }: Props) {
  return (
    <div className="flex gap-1 px-5 pb-5 pt-3 overflow-x-auto">
      {days.map((day) => {
        const isToday = day.dateStr === today;
        const visible = day.items.slice(0, 3);
        const overflow = day.items.length - visible.length;

        return (
          <div
            key={day.dateStr}
            className="flex flex-1 min-w-[36px] flex-col items-center gap-1"
          >
            {/* Dot stack — fixed height so all columns align */}
            <div className="flex flex-col-reverse items-center gap-1 min-h-[60px] justify-start">
              {overflow > 0 && (
                <span className="text-[9px] text-gray-400 leading-none">+{overflow}</span>
              )}
              {visible.map((item) => (
                <div key={item.id} className="relative group">
                  <div
                    className={`rounded-full ${dotSizeClass(item.awardCents)} ${dotColorClass(item.deadline, today)} cursor-default`}
                  />
                  {/* Tooltip — card must NOT have overflow-hidden */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                                  w-max max-w-[200px] rounded-lg bg-gray-900 px-3 py-2
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    <p className="text-xs font-semibold text-white leading-snug">{item.name}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {fmtAwardCents(item.awardCents)} · <span className="capitalize">{item.status.replace("_", " ")}</span>
                    </p>
                    <Link
                      href="/tracker"
                      className="pointer-events-auto text-[10px] text-indigo-300 hover:text-indigo-200 mt-1 inline-block"
                    >
                      Open in tracker →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Day label */}
            <span className="text-[10px] text-gray-400 leading-none">{day.dayLabel}</span>

            {/* Date number — highlighted for today */}
            <span
              className={`text-xs font-medium leading-none ${
                isToday
                  ? "text-indigo-600 underline decoration-indigo-500 decoration-2 underline-offset-2"
                  : "text-gray-500"
              }`}
            >
              {day.dateNum}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3.4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.5: Commit**

```bash
git add app/dashboard/_components/dashboard-utils.ts app/dashboard/_components/DeadlineTimelineDots.tsx
git commit -m "feat: add DeadlineTimelineDots client component with hover tooltips"
```

---

## Task 4: Build DeadlineTimeline server component

Card shell + data grouping. No `overflow-hidden` — intentional, so tooltips don't clip.

**Files:**
- Create: `app/dashboard/_components/DeadlineTimeline.tsx`

- [ ] **Step 4.1: Create the file**

```tsx
// app/dashboard/_components/DeadlineTimeline.tsx
import Link from "next/link";
import { buildTimelineDays, type TimelineItem } from "./dashboard-utils";
import { DeadlineTimelineDots } from "./DeadlineTimelineDots";

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  items: TimelineItem[];
  today: string;
}

export function DeadlineTimeline({ items, today }: Props) {
  const days = buildTimelineDays(today, items);
  const hasItems = items.length > 0;

  return (
    // NOTE: no overflow-hidden here — intentional, so dot tooltips are not clipped
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">14-Day Timeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming tracker deadlines</p>
        </div>
        <Link
          href="/tracker"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View tracker →
        </Link>
      </div>

      {hasItems ? (
        <DeadlineTimelineDots days={days} today={today} />
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <IconCalendar className="h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            No deadlines in the next 14 days
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Time to find more matches and save them to your tracker.
          </p>
          <Link
            href="/scholarships"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Browse scholarships →
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add app/dashboard/_components/DeadlineTimeline.tsx
git commit -m "feat: add DeadlineTimeline server component"
```

---

## Task 5: Build NewMatchesFeed server component

Vertical feed of scholarships added to the DB in the last 7 days that match this user's profile.

**Files:**
- Create: `app/dashboard/_components/NewMatchesFeed.tsx`

- [ ] **Step 5.1: Create the file**

```tsx
// app/dashboard/_components/NewMatchesFeed.tsx
import Link from "next/link";
import { SaveToTrackerButton } from "@/app/tracker/_components/save-to-tracker-button";
import { RelativeTime } from "./RelativeTime";
import { fmtAmount, evScoreBadge } from "./dashboard-utils";

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

export type NewMatchItem = {
  id: number;
  name: string;
  amountMin: number | null;
  amountMax: number | null;
  matchScore: string | null;
  evScore: string | null;
  createdAt: Date;
  isSaved: boolean;
};

interface Props {
  matches: NewMatchItem[];
  totalCount: number;
  now: Date;
}

export function NewMatchesFeed({ matches, totalCount, now }: Props) {
  const fortyEightHrsAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">New for you</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {totalCount > 0
            ? `${totalCount} new match${totalCount === 1 ? "" : "es"} this week`
            : "No new matches this week"}
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {matches.map((m) => {
            const isNew = m.createdAt > fortyEightHrsAgo;
            const evBadge = evScoreBadge(m.evScore);
            const matchPct = m.matchScore
              ? `${Math.round(parseFloat(m.matchScore))}% match`
              : null;

            return (
              <Link
                key={m.id}
                href={`/scholarship/${m.id}`}
                className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100"
              >
                {/* Left: name + award */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                    {isNew && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtAmount(m.amountMin, m.amountMax)}
                  </p>
                </div>

                {/* Right: EV badge + match % + relative time + save */}
                <div className="flex items-center gap-2 shrink-0">
                  {m.evScore && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${evBadge.bg} ${evBadge.text}`}>
                      {`$${parseFloat(m.evScore).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                    </span>
                  )}
                  {matchPct && (
                    <span className="text-xs text-gray-500 hidden sm:inline">{matchPct}</span>
                  )}
                  <RelativeTime
                    date={m.createdAt}
                    className="text-xs text-gray-400 hidden sm:inline"
                  />
                  <SaveToTrackerButton scholarshipId={m.id} isSaved={m.isSaved} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <IconTarget className="h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No new matches this week</p>
          <p className="text-xs text-gray-500">
            We&apos;ll let you know when fresh scholarships drop.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add app/dashboard/_components/NewMatchesFeed.tsx
git commit -m "feat: add NewMatchesFeed server component"
```

---

## Task 6: Wire up in page.tsx

Add two new DB queries to the existing `Promise.all`, compute `todayPlus14` and `sevenDaysAgo`, and render the new widget row.

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 6.1: Add missing Drizzle imports**

In `app/dashboard/page.tsx`, update the drizzle-orm import line to include `notInArray` and `lte`:

```ts
// Before:
import { eq, count, and, gte, lt, desc, asc, sql } from "drizzle-orm";

// After:
import { eq, count, and, gte, lte, lt, desc, asc, sql, notInArray } from "drizzle-orm";
```

- [ ] **Step 6.2: Add schema imports**

Add `applications` to the schema import:

```ts
// Before:
import { scholarships, scholarshipMatches, studentEssays } from "@/db/schema";

// After:
import { scholarships, scholarshipMatches, studentEssays, applications } from "@/db/schema";
```

- [ ] **Step 6.3: Add component imports**

```ts
import { DeadlineTimeline } from "./_components/DeadlineTimeline";
import { NewMatchesFeed, type NewMatchItem } from "./_components/NewMatchesFeed";
```

- [ ] **Step 6.4: Compute new date variables**

In `DashboardPage`, after the existing `today` variable (around line 148), add:

```ts
const todayPlus14Date = new Date(now);
todayPlus14Date.setDate(todayPlus14Date.getDate() + 14);
const todayPlus14 = todayPlus14Date.toISOString().slice(0, 10);

const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
```

- [ ] **Step 6.5: Add two queries to Promise.all**

The existing `Promise.all` has 6 queries. Add two more at the end. Update the destructured variable names too.

Replace:
```ts
  const [
    matchCountResult,
    totalEvResult,
    essayCountResult,
    deadlinesThisMonthResult,
    upcomingDeadlines,
    topMatches,
  ] = await Promise.all([
    // ... existing 6 queries ...
  ]);
```

With:
```ts
  const [
    matchCountResult,
    totalEvResult,
    essayCountResult,
    deadlinesThisMonthResult,
    upcomingDeadlines,
    topMatches,
    deadlineTimelineItems,
    recentMatchesResult,
  ] = await Promise.all([
    // ... existing 6 queries unchanged ...

    // 14-day deadline timeline: from tracker applications
    db.select({
        id:            applications.id,
        scholarshipId: applications.scholarshipId,
        name:          scholarships.name,
        deadline:      applications.deadline,
        status:        applications.status,
        awardAmount:   applications.awardAmount,
        amountMin:     scholarships.amountMin,
        amountMax:     scholarships.amountMax,
      })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          notInArray(applications.status, ["submitted", "won", "lost", "skipped"]),
          gte(applications.deadline, today),
          lte(applications.deadline, todayPlus14),
        )
      )
      .orderBy(asc(applications.deadline)),

    // New matches: scholarships added in last 7 days matching this user
    db.select({
        id:          scholarships.id,
        name:        scholarships.name,
        amountMin:   scholarships.amountMin,
        amountMax:   scholarships.amountMax,
        matchScore:  scholarshipMatches.matchScore,
        evScore:     scholarshipMatches.evScore,
        createdAt:   scholarships.createdAt,
        isSaved:     scholarshipMatches.isSaved,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarships.createdAt, sevenDaysAgo),
          eq(scholarships.isActive, true),
        )
      )
      .orderBy(desc(scholarshipMatches.matchScore))
      .limit(5),
  ]);
```

- [ ] **Step 6.6: Shape the query results for components**

After the existing variable assignments (e.g. after `const hasMatches = matchCount > 0;`), add:

```ts
  // Shape timeline items
  const timelineItems = deadlineTimelineItems.map((r) => ({
    id:           r.id,
    scholarshipId: r.scholarshipId!,
    name:         r.name,
    deadline:     r.deadline!,
    status:       r.status,
    awardCents:   r.awardAmount ?? r.amountMax ?? r.amountMin ?? 0,
  }));

  // Shape new matches items
  const recentMatches: NewMatchItem[] = recentMatchesResult.map((r) => ({
    id:         r.id,
    name:       r.name,
    amountMin:  r.amountMin,
    amountMax:  r.amountMax,
    matchScore: r.matchScore,
    evScore:    r.evScore,
    createdAt:  r.createdAt!,
    isSaved:    r.isSaved ?? false,
  }));

  const recentMatchCount = recentMatches.length; // shown in header subtext
```

- [ ] **Step 6.7: Render the new widget row in JSX**

Find the existing `{/* ── Deadline calendar strip ── */}` block in the return statement. Insert the new grid row **immediately before** it:

```tsx
      {/* ── New widgets: timeline + recent matches ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeadlineTimeline items={timelineItems} today={today} />
        <NewMatchesFeed matches={recentMatches} totalCount={recentMatchCount} now={now} />
      </div>
```

- [ ] **Step 6.8: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. Common issues to fix:
- `applications.deadline` returns `string | null` — the `!` in the shape step handles this, but confirm `deadline` is always set for tracker items (it can be null in schema; the `gte`/`lte` filter guarantees it's non-null in practice, so `r.deadline!` is safe)
- `scholarships.createdAt` returns `Date | null` — use `r.createdAt ?? new Date()` as a safe fallback if the type checker objects

- [ ] **Step 6.9: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: wire up 14-day timeline and new matches feed in dashboard"
```

---

## Task 7: Build verification

- [ ] **Step 7.1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: `0` errors. Fix any before continuing.

- [ ] **Step 7.2: Next.js production build**

```bash
npm run build 2>&1 | tail -40
```

Expected output ends with something like:
```
✓ Compiled successfully
Route (app)    Size    First Load JS
...
/dashboard     X kB    Y kB
```

If the build fails, check for:
- Missing `"use client"` directives (if a server component imports a client component that uses hooks)
- Async server components passing non-serializable props (Dates must be serialized: pass `.toISOString()` and parse back, OR accept `Date` as-is since it's within the same server render)
- Drizzle type mismatches on new query columns

- [ ] **Step 7.3: Fix any build errors, then commit the fix**

If no errors: skip this step.

If errors: fix inline, then:
```bash
git add -A
git commit -m "fix: resolve build errors in dashboard widget wiring"
```

---

## Task 8: Push branch

- [ ] **Step 8.1: Confirm you're on the right branch**

```bash
git branch --show-current
```

If not already on `feature/dashboard-timeline-new-matches`, create it:
```bash
git checkout -b feature/dashboard-timeline-new-matches
```

If you are already on that branch (or a similarly named one), skip checkout.

- [ ] **Step 8.2: Push**

```bash
git push -u origin feature/dashboard-timeline-new-matches
```

Expected: branch appears on GitHub, ready for PR review.

---

## Self-Review Checklist

After writing this plan, checking spec coverage:

| Spec requirement | Covered in task |
|-----------------|-----------------|
| Widget 1: dots per day, sized by award | Task 3 — `dotSizeClass` |
| Widget 1: dot color by urgency | Task 3 — `dotColorClass` |
| Widget 1: hover tooltip with name/award/status/"Open in tracker" | Task 3 — `DeadlineTimelineDots` |
| Widget 1: day labels + date numbers, today highlighted | Task 3 |
| Widget 1: stacked dots, max 3 + "+N" | Task 3 |
| Widget 1: empty state with link to /scholarships | Task 4 |
| Widget 1: query from applications, status NOT IN excluded set | Task 6 |
| Widget 1: deadline >= today AND <= today+14 (both bounds) | Task 6 |
| Widget 1: no overflow-hidden (tooltip clipping fix) | Task 4 |
| Widget 2: rows with name/award/EV/relative time/bookmark | Task 5 |
| Widget 2: "New" pill for items < 48h old | Task 5 |
| Widget 2: header "New for you" / "N new matches this week" | Task 5 |
| Widget 2: empty state | Task 5 |
| Widget 2: relative time is client-side | Task 2 |
| Widget 2: query from scholarshipMatches + scholarships, last 7d | Task 6 |
| Widget 2: ordered by matchScore desc, limit 5 | Task 6 |
| Side-by-side desktop, stacked mobile | Task 6 — `grid-cols-1 lg:grid-cols-2` |
| Placed below Top Matches | Task 6 — before deadline strip |
| No chart library | All tasks — divs only |
| Matches light-mode aesthetic | All tasks — white cards, indigo accents |
| No existing widgets touched | Confirmed — only additions in page.tsx |

All spec requirements are covered.
