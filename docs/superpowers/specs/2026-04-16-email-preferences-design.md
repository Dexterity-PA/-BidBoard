# Email Notification Preferences — Design Spec

**Date:** 2026-04-16  
**Route:** `/settings/notifications`  
**Branch ordering:** build after `feature/scholarship-detail` merges  

---

## Context

The email notification system (send functions, `user_email_preferences` table, `lib/email/preferences.ts`) already exists on `main`. The route `/settings/notifications` renders a "coming soon" stub. This spec describes replacing that stub with a working toggle UI and wiring the preference guard into every send function.

---

## What exists on main

| File | State |
|---|---|
| `db/schema.ts` | Has `userEmailPreferences` table (6 boolean columns, all default `true`) |
| `drizzle/0002_email_notifications.sql` | Reference DDL with `IF NOT EXISTS` guards — no new migration needed |
| `lib/email/preferences.ts` | Has `checkPreference(userId, type)` — lazy-creates row, checks one column |
| `lib/email/client.ts` | Has `NotificationType` union (6 values) |
| `lib/email/send/*.ts` | 6 sender functions — no preference guards wired |
| `app/settings/notifications/page.tsx` | Stub: "coming soon" only |
| `app/settings/notifications/actions.ts` | Does not exist |

---

## Scope

### Not in scope
- The settings shell's "Notifications" tab (manages old `student_profiles.notification_preferences` jsonb — separate system, leave untouched).
- Email unsubscribe link tokens or one-click unsubscribe from email headers (future work).
- New migration file (`0002_email_notifications.sql` already contains the DDL).

---

## Section 1: Data layer — `lib/email/preferences.ts`

Three changes, all in one commit with the send-function guards:

**1. Rename `checkPreference` → `canSend`**  
Same logic. The rename happens atomically with the guard insertions so no send function is ever broken between commits.

**2. Add `getUserPrefs(userId: string): Promise<UserEmailPrefs>`**  
Fetches (or lazy-creates) the full preferences row. Returns the 6 boolean columns only — `userId`, `createdAt`, `updatedAt` stripped out. Used by the page server component to seed initial state.

**3. Add `setAllPrefs(userId: string, value: boolean): Promise<void>`**  
Sets all 6 columns to `value` in one `UPDATE`. Used by the Unsubscribe all action.

```ts
export type UserEmailPrefs = {
  welcome: boolean;
  deadlineReminders: boolean;
  newMatches: boolean;
  statusChanges: boolean;
  weeklyDigest: boolean;
  paymentEvents: boolean;
};
```

---

## Section 2: Send function guards — `lib/email/send/*.ts`

Each of the 6 sender files receives one additive line at the top of its exported function:

```ts
if (!await canSend(params.userId, "welcome")) return;
```

This is the only edit to each file. No other changes. The type string matches the `NotificationType` value already threaded through each sender.

Files: `welcome.ts`, `deadline-reminder.ts`, `new-matches.ts`, `status-change.ts`, `weekly-digest.ts`, `payment.ts`.

---

## Section 3: Server actions — `app/settings/notifications/actions.ts`

New file, two actions:

**`saveEmailPref(type: NotificationType, value: boolean): Promise<void>`**  
Lazy-creates the row if missing (INSERT … ON CONFLICT DO NOTHING), then UPDATE the one column plus `updated_at = now()`. Uses `COLUMN_MAP` from `preferences.ts` to resolve `type` → column name. Calls `revalidatePath("/settings/notifications")`. Updating `updated_at` on every call keeps the "Last updated" timestamp accurate.

**`unsubscribeAll(): Promise<void>`**  
Calls `setAllPrefs(userId, false)`. Calls `revalidatePath("/settings/notifications")`.

Both actions call `auth()` and redirect to `/sign-in` if `userId` is missing.

---

## Section 4: UI — `app/settings/notifications/page.tsx`

**Architecture:** Server component fetches `getUserPrefs(userId)` and passes data to a `"use client"` `EmailPrefsForm` component in the same file (or a co-located `_components/` file if the server+client split feels cleaner).

**Layout:**

```
← Settings                                    (Link href="/settings", top of page)

Email Notifications                           (h1, font-semibold text-gray-900)
Manage which emails BidBoard sends you.       (text-sm text-gray-500)
Last updated: Apr 16 at 8:19 AM              (text-xs text-gray-400, from updatedAt; "Never" if null)

─── divider ────────────────────────────────

[6 toggle rows]

─── divider ────────────────────────────────

[Unsubscribe from all emails]                (destructive outline button)
```

**Toggle rows** (one per notification type):

| Type | Label | Description |
|---|---|---|
| `welcome` | Welcome email | Sent when you first join BidBoard. |
| `deadline_reminders` | Deadline reminders | Alerts before scholarships you're tracking close. |
| `new_matches` | New matches | When BidBoard finds new scholarships matching your profile. |
| `status_changes` | Status changes | Updates when your application status changes. |
| `weekly_digest` | Weekly digest | A Sunday summary of your top matches and deadlines. |
| `payment_events` | Payment events | Receipts and billing alerts. Recommended to leave on. |

**Toggle behavior (auto-save, Option A):**
1. User flips toggle → optimistic local flip immediately.
2. `saveEmailPref(type, newValue)` fires inside `useTransition`.
3. On error: revert local state, show inline error text next to the toggle ("Failed to save. Try again."). No toast.
4. No save button. No unsaved-dot tracking (this page is standalone, not inside the settings shell).

**Unsubscribe all:**
- Outline button with red/destructive color, full width at the bottom.
- `window.confirm("Turn off all email notifications?")` before firing.
- On confirm: calls `unsubscribeAll()`, then flips all local toggle state to `false`.
- On error: show an error message below the button.

**Style:** Matches `notifications-section.tsx` in the settings shell — `bg-indigo-600` active toggle, `bg-gray-200` inactive, `text-gray-900` labels, `text-gray-500` descriptions, `max-w-2xl` container. Inherits `AppShell` chrome from `app/settings/layout.tsx`.

---

## File summary

| File | Action |
|---|---|
| `lib/email/preferences.ts` | Edit — rename + add `getUserPrefs` + add `setAllPrefs` |
| `lib/email/send/welcome.ts` | Edit — add `canSend` guard (1 line) |
| `lib/email/send/deadline-reminder.ts` | Edit — add `canSend` guard |
| `lib/email/send/new-matches.ts` | Edit — add `canSend` guard |
| `lib/email/send/status-change.ts` | Edit — add `canSend` guard |
| `lib/email/send/weekly-digest.ts` | Edit — add `canSend` guard |
| `lib/email/send/payment.ts` | Edit — add `canSend` guard |
| `app/settings/notifications/actions.ts` | Create — `saveEmailPref` + `unsubscribeAll` |
| `app/settings/notifications/page.tsx` | Replace stub with server + client UI |

No new migration. No new packages. No changes to the settings shell.

---

## Commit plan

1. **`feat(email): rename checkPreference → canSend, add getUserPrefs/setAllPrefs, wire guards in all 6 senders`** — `lib/email/preferences.ts` + all 6 `send/*.ts` files, one atomic commit.
2. **`feat(settings): email notification preferences page and actions`** — `actions.ts` + `page.tsx`.
