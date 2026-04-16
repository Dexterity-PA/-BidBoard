# Application Tracker — Design Spec

**Date:** 2026-04-15
**Route:** `/tracker`
**Branch:** `feature/application-tracker`

---

## Overview

A core retention feature that lets students track every scholarship they're pursuing from discovery to outcome. Primary view is a Kanban board with drag-and-drop; secondary view is a sortable/filterable table. Both views share the same data layer.

---

## Data Layer

### New DB Table: `applications`

Added to `db/schema.ts` alongside existing tables.

```
id               uuid PK (default gen_random_uuid())
user_id          text NOT NULL (Clerk userId)
scholarship_id   uuid NOT NULL FK → scholarships.id ON DELETE CASCADE
status           text NOT NULL default 'saved'
                 CHECK IN ('saved','in_progress','submitted','won','lost','skipped')
applied_at       timestamp nullable
deadline         date nullable
award_amount     numeric(10,2) nullable
notes            text nullable
essay_draft_ids  uuid[] nullable
reminder_sent    boolean default false NOT NULL
status_history   jsonb NOT NULL default '[]'
created_at       timestamp default now() NOT NULL
updated_at       timestamp default now() NOT NULL

UNIQUE(user_id, scholarship_id)
INDEX(user_id)
```

`status_history` is a JSONB array of `{ status: string, at: string (ISO), label: string }` objects appended on every status change. Avoids a JOIN for timeline display in the slide-over.

### Migration

`drizzle/0001_applications.sql` — standard `CREATE TABLE` + index creation.

### Sync Rule

`saveToTracker(scholarshipId)` writes to **both** `applications` (status='saved') **and** sets `scholarshipMatches.isSaved = true`. These tables serve different purposes (matches = ML scoring, applications = user intent) but saved state must be consistent across the app.

### Server Actions: `app/actions/tracker.ts`

| Action | Description |
|---|---|
| `getApplications()` | Fetch all user applications JOIN scholarships JOIN scholarshipMatches (for evScore). Returns merged type. |
| `saveToTracker(scholarshipId)` | Upsert into applications (status='saved') + update scholarshipMatches.isSaved=true. Idempotent. |
| `updateApplicationStatus(id, status)` | Update status + append `{status, at, label}` to status_history + set updated_at. |
| `updateApplicationNotes(id, notes)` | Update notes field only. |
| `deleteApplication(id)` | Hard delete by id WHERE user_id matches (auth guard). |
| `bulkUpdateStatus(ids[], status)` | Batch update status for selected ids (auth-guarded). |

All actions call `auth()` from Clerk and throw if no userId. No unauthenticated access.

---

## Route Structure

```
app/tracker/
  page.tsx                     ← server component: auth check, getApplications(), pass to client
  layout.tsx                   ← AppShell wrapper (matches dashboard/matches/essays pattern)

  _components/
    tracker-client.tsx         ← "use client" root: owns applications state, view toggle, confetti state
    stats-bar.tsx              ← total tracking, pipeline value, submitted count, won total
    deadline-banner.tsx        ← dismissable warning for scholarships due within 7 days
    kanban-board.tsx           ← renders 5 columns, manages drag state
    kanban-column.tsx          ← drop zone column: header + count badge + card list
    kanban-card.tsx            ← draggable card: scholarship info + quick actions
    slide-over.tsx             ← right-side fixed drawer: full detail, notes, timeline, actions
    list-view.tsx              ← sortable/filterable table with bulk select + CSV export
    empty-state.tsx            ← shown when applications array is empty
```

---

## Kanban Board

### Columns (in order)

1. Saved
2. In Progress
3. Submitted
4. Won 🏆
5. Lost / Skipped

Each column has a header with the column name and a count badge (number of cards in that column).

### Drag and Drop

**Native HTML5 — no new dependencies.**

- `kanban-card.tsx`: `draggable={true}`, `onDragStart` stores application id via `e.dataTransfer.setData('applicationId', id)`.
- `kanban-column.tsx`: `onDragOver` calls `e.preventDefault()` + adds CSS highlight class; `onDrop` reads the id, triggers optimistic state update immediately, then calls `updateApplicationStatus` server action in background.
- On server error: revert local state + show toast notification.

### Optimistic Updates

`tracker-client.tsx` owns the canonical `applications` state array. Drag-drop mutates this state before the server round-trip. The UI never waits for the DB to move a card.

### Card Contents

- Scholarship name (truncated to 2 lines)
- Sponsor / provider
- Award amount (from `applications.award_amount` if set, else `scholarships.amount`)
- Deadline — color coded: red if ≤7 days, amber if ≤14 days, gray otherwise
- EV Score badge (from scholarshipMatches.evScore, parsed as float)
- Quick action buttons: Edit notes (pencil icon), Delete (trash icon), View detail (external link → `/scholarship/[id]`)

### Card Click → Slide-Over

Clicking anywhere on the card body (not a quick action button) opens the slide-over panel.

---

## Slide-Over Panel

Fixed right drawer, `w-96`, with semi-transparent backdrop overlay. Controlled by `selectedApplicationId` state in `tracker-client.tsx`.

**Contents:**

- All card fields (name, sponsor, award, deadline, EV score)
- Notes textarea — fires `updateApplicationNotes` on `onBlur` (auto-save)
- Status dropdown — changing calls `updateApplicationStatus` + updates local state
- "Draft essay" button → links to `/essays?scholarship=[id]`
- "Mark as won" button → sets status to 'won' + triggers CSS keyframe confetti burst animation (no canvas-confetti dep — pure CSS + inline SVG particles)
- "Mark deadline" button → saves deadline date to the application record
- Status change timeline — rendered from `status_history` JSONB array, e.g. "Moved to In Progress — Apr 15"

---

## List View

Toggled from Kanban via a view-toggle control in the page header (grid icon / list icon).

**Columns:** Name, Sponsor, Award, Deadline, Status badge, EV Score, Notes preview, Actions

**Sort:** Clicking any column header sorts ascending/descending (client-side, no DB round trip).

**Filter panel:**
- Status (multi-select checkboxes)
- Deadline range (date pickers)
- Award amount (min/max inputs)

**Bulk select:**
- Checkbox per row + "Select all" header checkbox
- Bulk action bar appears when any rows selected: "Change status to…" dropdown + Apply button
- Calls `bulkUpdateStatus(ids[], status)`

**CSV export:**
- Free users: button shows with lock icon, clicking shows upgrade modal
- Pro users: exports all visible rows as CSV (client-side generation, no server action needed)
- Check via `users.tier` passed from server component

---

## Stats Bar

Shown at top of page above the view toggle, always visible in both views.

| Stat | Source |
|---|---|
| Total tracking | `applications.length` |
| Pipeline value | Sum of `award_amount ?? scholarships.amount` for status NOT IN ('lost','skipped') |
| Submitted | Count where status = 'submitted' |
| Won | Sum of award amounts where status = 'won' |

---

## Deadline Banner

Shown at top of page (above stats bar) when any tracked application has `deadline` within 7 days of today. Dismissable (localStorage key `tracker-deadline-banner-dismissed-{date}` so it re-appears the next day).

Format: `⚠️ N scholarship(s) due this week — don't miss them.`

---

## Empty State

Shown when `applications.length === 0`. Full-height centered card with:
- ClipboardList icon (lucide-react)
- "You haven't saved any scholarships yet"
- "Browse Scholarships" CTA button → links to `/matches`

---

## Save to Tracker Button

### Scholarship Detail Page

In the sidebar: add a "Save to Tracker" button that calls `saveToTracker(scholarshipId)`.
Add comment `// TODO: connect to tracker` so the other session can wire it up.
The server action is already defined in `app/actions/tracker.ts`.

### Matches Page Cards

Add a small "Save" button (bookmark icon) to each scholarship card row. Calls `saveToTracker(scholarshipId)`. Shows "Saved ✓" disabled state if `scholarshipMatches.isSaved === true` (already available in the matches query).

### Dashboard Top Matches

Same bookmark button on each match card row. Same saved-state logic.

---

## Sidebar Nav

Add Tracker to `NAV_ITEMS` array in `components/app-shell.tsx` **between** `/matches` and `/essays`:

```
{ href: '/tracker', label: 'Tracker', icon: <inline SVG clipboard> }
```

AppShell uses inline SVGs for all icons (no lucide-react import in that file). Add a clipboard-list inline SVG to match the existing icon style.

---

## Mobile Behavior

- Kanban scrolls horizontally on mobile (`overflow-x: auto`, column min-width: 280px)
- Default to list view when viewport < `lg` breakpoint (detect via `useEffect` + `window.innerWidth` on mount, or CSS only with `hidden lg:block` / `block lg:hidden` guards)
- Slide-over takes full width on mobile (`w-full sm:w-96`)

---

## Technical Constraints

- Next.js App Router, Tailwind, Drizzle ORM, Clerk auth (`auth()`)
- No new npm dependencies
- All DB operations via server actions in `app/actions/tracker.ts`
- Optimistic UI on drag (don't wait for DB)
- Responsive — horizontal scroll on mobile for kanban
- Do NOT touch: middleware, Stripe, essay engine, onboarding, marketing page

---

## Out of Scope

- Push notifications / email reminders (reminder_sent column is reserved for future use)
- AI-generated essay suggestions from the tracker
- Scholarship detail page full implementation (that's a separate session)
- Real-time multi-device sync
