# Dashboard Widgets: 14-Day Deadline Timeline + New Matches Feed

**Date:** 2026-04-16  
**Branch:** feature/dashboard-deadline-timeline (or feature/dashboard-new-matches)  
**Status:** Approved

---

## Overview

Two new server-component widgets added to `/dashboard`, placed in a new two-column row immediately **after** the existing Top Matches + Quick Actions section and **before** the existing deadline calendar strip. Side-by-side on desktop (`grid grid-cols-1 lg:grid-cols-2 gap-4`), stacked on mobile. No existing widgets are modified.

Both cards match the current dashboard aesthetic exactly: white background, `border-gray-200`, `shadow-sm`, `rounded-xl`, indigo/amber/red accents, `text-gray-900` headings.

---

## 1. Placement

`app/dashboard/page.tsx` receives two new data queries in `Promise.all` and renders a new grid row between the existing `flex gap-4` section (Top Matches + Quick Actions) and the existing deadline calendar strip `div`.

```jsx
{/* ── New widgets row ── */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <DeadlineTimeline items={deadlineTimelineItems} today={today} />
  <NewMatchesFeed matches={recentMatches} totalCount={recentMatchCount} />
</div>
```

---

## 2. Widget 1: 14-Day Deadline Timeline

### 2.1 Data query

Source: `applications` table joined with `scholarships`, for the current `userId`.

```ts
// In page.tsx Promise.all
db.select({
    id:            applications.id,
    scholarshipId: applications.scholarshipId,
    name:          scholarships.name,
    deadline:      applications.deadline,        // user-set deadline from tracker
    status:        applications.status,
    awardAmount:   applications.awardAmount,     // user-set award from tracker
    amountMin:     scholarships.amountMin,       // fallback if awardAmount is null
    amountMax:     scholarships.amountMax,
  })
  .from(applications)
  .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
  .where(
    and(
      eq(applications.userId, userId),
      notInArray(applications.status, ["submitted", "won", "lost", "skipped"]),
      gte(applications.deadline, today),          // today inclusive
      lte(applications.deadline, todayPlus14),    // today+14 inclusive
    )
  )
  .orderBy(asc(applications.deadline))
```

`today` = `now.toISOString().slice(0, 10)` (already computed in page).  
`todayPlus14` = ISO date string 14 days from now (computed inline).

Both bounds are explicit — past-due items are excluded by `>= today`.

### 2.2 Component split

- **`DeadlineTimeline.tsx`** — async server component. Receives pre-fetched `items[]` and `today: string` as props. Groups items by `deadline` date string into a `Map<string, item[]>`. Renders card shell + header, then passes serialized data to:
- **`DeadlineTimelineDots.tsx`** — `"use client"` component. Renders the 14-column dot grid with hover tooltips. Needed for hover state (no JS in server components).

### 2.3 Visual structure

Fourteen columns in a horizontal `flex gap-1` row, each `flex-1 flex flex-col items-center`.

**Column layout (top to bottom):**
1. Dot stack area (fixed height, `min-h-[60px]`, flex-col-reverse so dots stack from bottom)
2. Day label: `Mon`, `Tue`, etc. — `text-[10px] text-gray-400`
3. Date number: `14`, `15`, etc. — `text-xs font-medium text-gray-600`  
   — Today's column: date number gets `underline decoration-indigo-500 decoration-2` and `text-indigo-600`

**Dot sizing by award amount** (use `awardAmount ?? amountMax ?? amountMin ?? 0`, convert cents to dollars):

| Amount | Size class |
|--------|------------|
| < $500 | `w-2 h-2` |
| $500–$2000 | `w-3 h-3` |
| > $2000 | `w-4 h-4` |

**Dot color by urgency** (days until deadline, computed client-side from `today` prop):

| Condition | Class |
|-----------|-------|
| deadline ≤ 1 day | `bg-red-400` |
| deadline ≤ 3 days | `bg-amber-400` |
| otherwise | `bg-indigo-400` |

**Stacking:** max 3 dots visible per day. If more, render 3 dots + a `+N` text in `text-[9px] text-gray-500` above the stack.

### 2.4 Hover tooltip

Each dot is a `relative group` div. Tooltip is a sibling `span` with:
```
absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white
opacity-0 group-hover:opacity-100 transition-opacity duration-100
pointer-events-none
```

Tooltip content:
- Scholarship name (bold)
- Award amount formatted
- Status badge (e.g., "saved", "in_progress")
- "Open in tracker →" as a styled link

**Important:** The timeline card must **not** have `overflow-hidden` so absolute-positioned tooltips are not clipped. The card uses `rounded-xl border border-gray-200 bg-white shadow-sm` without `overflow-hidden`.

### 2.5 Empty state

```jsx
<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
  <IconCalendar className="h-8 w-8 text-gray-300 mb-3" />
  <p className="text-sm font-semibold text-gray-700 mb-1">No deadlines in the next 14 days</p>
  <p className="text-xs text-gray-500 mb-4">
    Time to find more matches and save them to your tracker.
  </p>
  <Link href="/scholarships" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
    Browse scholarships →
  </Link>
</div>
```

### 2.6 Card header

```
"14-Day Timeline" / "Upcoming tracker deadlines"
```
Same header pattern as existing cards: `border-b border-gray-100 px-5 py-4`.

---

## 3. Widget 2: Recently Added Matches Feed

### 3.1 Data query

Two queries in `Promise.all`:

```ts
// Count for header subcaption
db.select({ count: count() })
  .from(scholarshipMatches)
  .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
  .where(
    and(
      eq(scholarshipMatches.userId, userId),
      gte(scholarships.createdAt, sevenDaysAgo),
      eq(scholarships.isActive, true),
    )
  ),

// Top 5 by matchScore
db.select({
    id:          scholarships.id,
    name:        scholarships.name,
    amountMin:   scholarships.amountMin,
    amountMax:   scholarships.amountMax,
    matchScore:  scholarshipMatches.matchScore,
    evScore:     scholarshipMatches.evScore,
    createdAt:   scholarships.createdAt,
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
```

`sevenDaysAgo` = `new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)`.

### 3.2 Component split

- **`NewMatchesFeed.tsx`** — async server component. Receives `matches[]` and `totalCount: number`. Renders card shell + header + list rows. Imports `RelativeTime` for each row's timestamp.
- **`RelativeTime.tsx`** — `"use client"`, ~15 lines. Takes `date: Date`. On mount, computes and renders relative string ("2d ago", "5h ago"). Renders nothing (or `""`) on the server to avoid stale hydration mismatch.

### 3.3 Row layout

Each row is a `<Link href={/scholarship/${id}}>` wrapping:

```
[Left]  Name (semibold, truncated) + "New" pill if < 48h old
        Award amount (xs, gray-500)
[Right] EV score badge (reuse evScoreBadge helper from page.tsx — extract to shared util)
        Match % (xs, gray-500)
        RelativeTime (xs, gray-400)
        SaveToTrackerButton (existing component)
```

Row hover: `hover:bg-gray-50 transition-colors`.

**"New" pill:** `inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700` rendered inline next to name if `createdAt > now - 48h`.

### 3.4 Card header

```
"New for you" / "N new matches this week"
```

N = `totalCount` from the count query.

### 3.5 Empty state

```jsx
<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
  <IconTarget className="h-8 w-8 text-gray-300 mb-3" />
  <p className="text-sm font-semibold text-gray-700 mb-1">No new matches this week</p>
  <p className="text-xs text-gray-500">
    We&apos;ll let you know when fresh scholarships drop.
  </p>
</div>
```

---

## 4. Shared helpers to extract

`evScoreBadge()` is currently defined inline in `page.tsx`. Both widgets reference it. Extract to `app/dashboard/_components/dashboard-utils.ts` (no `"use client"` — pure function).

Similarly extract `fmtAmount()` to the same file for reuse in `NewMatchesFeed`.

---

## 5. Files changed

| File | Change |
|------|--------|
| `app/dashboard/page.tsx` | Add 2 data queries to Promise.all; render new `<div className="grid ...">` row; import new components |
| `app/dashboard/_components/DeadlineTimeline.tsx` | New server component — card shell, groups items by date |
| `app/dashboard/_components/DeadlineTimelineDots.tsx` | New client component — 14-column dot grid with hover tooltips |
| `app/dashboard/_components/NewMatchesFeed.tsx` | New server component — feed card |
| `app/dashboard/_components/RelativeTime.tsx` | New client component — relative timestamp |
| `app/dashboard/_components/dashboard-utils.ts` | New file — extracted `fmtAmount`, `evScoreBadge` |

---

## 6. Non-goals

- No chart library
- No new npm packages (no Radix Tooltip — overflow-hidden omitted from timeline card instead)
- No changes to existing stats row, Quick Actions, Top Matches, or deadline calendar strip
- No dark theme — matches existing light-mode aesthetic
- No new DB tables or migrations
