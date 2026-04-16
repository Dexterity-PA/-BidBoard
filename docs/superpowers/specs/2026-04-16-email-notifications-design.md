# BidBoard Email Notifications System — Design Spec

**Date:** 2026-04-16  
**Branch:** feature/email-notifications  
**Status:** Approved, ready for implementation

---

## 1. Overview

A complete transactional email system for BidBoard delivering 6 notification types via Resend. All emails use React Email templates matching the BidBoard dark/acid-green aesthetic. Users can opt out per notification type. A global rate limit of 2 emails/day/user applies to all types except payment events.

---

## 2. Tech Stack & Dependencies

| Concern | Solution |
|---|---|
| Email delivery | Resend (`^4.2.0`, already installed) |
| Templates | `@react-email/components` + `@react-email/render` (to install) |
| DB | Drizzle ORM + Neon Postgres (existing pattern) |
| Cron | Vercel cron via `vercel.json` + `app/api/cron/*` routes |
| Clerk webhook | Extend existing `app/api/auth/webhook/route.ts` |
| Stripe webhook | Extend existing `app/api/stripe/webhook/route.ts` |
| Cron auth | `CRON_SECRET` env var, Bearer token check |
| From address | `RESEND_FROM_EMAIL` env var, default `notifications@bidboard.app` |

---

## 3. Directory Structure

```
emails/
  README.md
  _components/
    EmailLayout.tsx          # shared: logo, footer, unsubscribe link
  welcome.tsx
  deadline-reminder.tsx
  new-matches.tsx
  status-change.tsx
  weekly-digest.tsx
  payment.tsx

lib/email/
  client.ts                  # Resend singleton (lazy getter, matches lib/stripe.ts pattern)
  send.ts                    # core sendEmail() — prefs check, rate limit, render, send, log
  preferences.ts             # checkPreference(userId, type) → boolean; lazy-creates prefs row
  rate-limit.ts              # canSendToday(userId, type) → boolean; 2/day cap, payment exempt
  send/
    welcome.ts
    deadline-reminder.ts
    new-matches.ts
    status-change.ts
    weekly-digest.ts
    payment.ts

app/api/cron/
  deadline-reminders/route.ts    # POST, daily 9am ET
  new-matches/route.ts           # POST, daily 8am ET
  weekly-digest/route.ts         # POST, Sunday 6pm ET

app/settings/notifications/
  page.tsx                       # stub page only — no UI built yet

vercel.json                      # cron schedule configuration
```

---

## 4. Database Migration — `0002_email_notifications.sql`

Three new tables. No changes to existing tables.

### `user_email_preferences`
Opt-in/out per notification type. Row created lazily on first preference check.

| Column | Type | Default |
|---|---|---|
| `user_id` | text PK → users.id CASCADE | — |
| `welcome` | boolean | true |
| `deadline_reminders` | boolean | true |
| `new_matches` | boolean | true |
| `status_changes` | boolean | true |
| `weekly_digest` | boolean | true |
| `payment_events` | boolean | true |
| `created_at` | timestamp | now() |
| `updated_at` | timestamp | now() |

### `sent_notifications`
Dedupe table. Prevents re-sending the same reminder. Unique constraint on `(user_id, scholarship_id, type)`.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | — |
| `user_id` | text → users.id CASCADE | — |
| `scholarship_id` | integer → scholarships.id CASCADE | nullable (non-scholarship types) |
| `type` | text | e.g. `deadline_14d`, `digest_2026-W16` |
| `sent_at` | timestamp | now() |

### `notifications_log`
Audit log for every send attempt (sent, skipped, or error).

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | — |
| `user_id` | text → users.id CASCADE | — |
| `type` | text | notification type enum |
| `status` | text | `sent` \| `skipped` \| `error` |
| `error` | text | null on success |
| `metadata` | jsonb | e.g. `{ scholarshipIds: [1,2], matchCount: 3 }` |
| `sent_at` | timestamp | now() |

---

## 5. Core Send Pipeline (`lib/email/send.ts`)

```
sendEmail(userId, type, to, subject, ReactComponent, props) →
  1. checkPreference(userId, type)    → log "skipped:pref" and return if false
  2. canSendToday(userId, type)       → log "skipped:rate_limit" and return if false
  3. render(ReactComponent, props)    → { html, text }
  4. getResend().emails.send(...)     → { id } or throw
  5. insert into notifications_log   → status: "sent" | "error"
```

### Rate Limit Priority
When multiple types compete for the 2-email daily cap, priority order (highest first):
1. `payment_events` (exempt from cap — always sends)
2. `status_changes`
3. `deadline_reminders`
4. `weekly_digest`
5. `new_matches`
6. `welcome`

### `lib/email/preferences.ts`
```ts
// Upserts the prefs row (ON CONFLICT DO NOTHING), then reads the column.
checkPreference(userId: string, type: NotificationType): Promise<boolean>
```

### `lib/email/client.ts`
```ts
// Lazy singleton matching lib/stripe.ts pattern.
let _resend: Resend | undefined;
export function getResend(): Resend
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "notifications@bidboard.app"
```

---

## 6. Email Templates (`emails/`)

All templates use `<EmailLayout>` which provides:
- Dark background (`#0a0a0a`), acid-green accent (`#a3ff47`)
- BidBoard wordmark (text-based)
- Footer: "Manage notification preferences → bidboard.app/settings/notifications"
- Plain-text equivalent auto-generated by React Email's `render()`

### Template inventory

| File | Subject line | Key content |
|---|---|---|
| `welcome.tsx` | Welcome to BidBoard 🎓 | Warm intro, link to dashboard, 3 quick-start steps |
| `deadline-reminder.tsx` | Deadline coming up — {N} scholarship(s) due soon | Digest: list of scholarships + days remaining |
| `new-matches.tsx` | {N} new scholarships match your profile | Top 5 matches, ranked by match score, with amounts |
| `status-change.tsx` | Application update: {scholarshipName} | Status badge, scholarship name, next-step CTA |
| `weekly-digest.tsx` | Your BidBoard week in review | Upcoming deadlines, new matches, activity, $ totals |
| `payment.tsx` | Polymorphic — subject varies by event type | Subscription start/renewal/failure/cancellation/trial |

---

## 7. Notification Triggers

### 7.1 Welcome (Clerk webhook extension)
- **File:** `app/api/auth/webhook/route.ts`
- **Trigger:** `user.created` event only (not `user.updated`)
- **Logic:** After successful DB insert, call `sendWelcomeEmail(userId, email, firstName)`
- **Idempotence:** Clerk's `user.created` fires once per user. The `sent_notifications` dedupe is not needed here since the event is inherently unique.

### 7.2 Deadline Reminders (cron)
- **File:** `app/api/cron/deadline-reminders/route.ts`
- **Schedule:** Daily at 9am ET (`0 14 * * *` UTC)
- **Logic:**
  1. Query all `applications` where `status NOT IN ('submitted', 'won', 'lost')` and `deadline` in exactly 1, 3, 7, or 14 days from today
  2. Group by `userId`
  3. For each user: filter out any `(userId, scholarshipId, "deadline_{N}d")` rows already in `sent_notifications`
  4. If any remain: send one digest email listing all qualifying scholarships
  5. Insert dedupe rows into `sent_notifications`
- **Rate limit:** Counts against the 2/day cap.

### 7.3 New Matches (cron)
- **File:** `app/api/cron/new-matches/route.ts`
- **Schedule:** Daily at 8am ET (`0 13 * * *` UTC)
- **Logic:**
  1. Query `scholarships` with `created_at >= now() - interval '24 hours'`
  2. For each user with a `studentProfile`, run `computeMatchScore()` against each new scholarship
  3. Filter matches with score > 0; take top 5 by score
  4. Skip users with 0 qualifying new matches
  5. Dedupe via `sent_notifications` with `type = "new_matches_{YYYY-MM-DD}"`
- **Rate limit:** Counts against the 2/day cap (lowest priority).

### 7.4 Status Changes (server action hook)
- **File:** `app/actions/tracker.ts` — extend `updateApplicationStatus()`
- **Trigger:** After the DB update, if `newStatus ∈ { 'submitted', 'won', 'lost' }`, fire `sendStatusChangeEmail()` as a void promise (no await — keeps UI responsive)
- **Content:** 
  - `submitted` → "Your application was submitted"
  - `won` → "Congratulations — you won!"
  - `lost` → "Application not selected"
- **Idempotence:** Status transitions are already stored in `statusHistory`. The email send is logged; if the action is called twice with the same status (edge case), rate limiting prevents double-send.

### 7.5 Weekly Digest (cron)
- **File:** `app/api/cron/weekly-digest/route.ts`
- **Schedule:** Sundays at 6pm ET (`0 23 * * 0` UTC)
- **Logic:**
  1. For each user with a `studentProfile`: 
     - **Upcoming deadlines:** query `applications` where `status NOT IN ('submitted','won','lost')` and `deadline` within 14 days
     - **New matches this week:** query `scholarshipMatches` where `createdAt >= 7 days ago`
     - **Status moves this week:** query `applications` where `updatedAt >= 7 days ago` and `status IN ('submitted','won','lost')` (derives from the `statusHistory` jsonb or `updatedAt` timestamp)
     - **$ totals:** sum `awardAmount` from `applications` where `status = 'won'`
  2. Skip if all four data categories are empty
  3. Dedupe via `sent_notifications` with `type = "digest_{YYYY-W{WW}}"`
- **Rate limit:** Counts against the 2/day cap.

### 7.6 Payment Events (Stripe webhook extension)
- **File:** `app/api/stripe/webhook/route.ts`
- **New event handlers:**

| Stripe event | Email content |
|---|---|
| `checkout.session.completed` | Subscription activated (extend existing handler) |
| `invoice.payment_succeeded` | Renewal confirmation — skip when `invoice.billing_reason === 'subscription_create'` (that send is handled by `checkout.session.completed`) |
| `invoice.payment_failed` | Payment failed, link to update payment method |
| `customer.subscription.deleted` | Subscription canceled |
| `customer.subscription.trial_will_end` | Trial ends in 3 days |

- **Rate limit:** Exempt — payment emails always send regardless of daily cap.
- **User lookup:** All payment events must resolve `userId` from `stripeCustomerId` via `users` table query.

---

## 8. Cron Authentication

All cron route handlers check:
```ts
const secret = process.env.CRON_SECRET;
if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
  return new Response("Unauthorized", { status: 401 });
}
```

Vercel automatically passes the `Authorization: Bearer <CRON_SECRET>` header when invoking cron routes — no manual configuration needed.

---

## 9. Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/new-matches",         "schedule": "0 13 * * *"  },
    { "path": "/api/cron/deadline-reminders",  "schedule": "0 14 * * *"  },
    { "path": "/api/cron/weekly-digest",       "schedule": "0 23 * * 0"  }
  ]
}
```

---

## 10. New Environment Variables

Add to `.env` and document in `.env.example`:

```bash
RESEND_FROM_EMAIL=notifications@bidboard.app
CRON_SECRET=<random-secret>
```

---

## 11. Notifications Stub Route

`app/settings/notifications/page.tsx` — minimal stub:
```tsx
export default function NotificationsSettingsPage() {
  return (
    <div>
      <h1>Notification Preferences</h1>
      <p>Coming soon.</p>
    </div>
  );
}
```

No layout, no styling required. Just enough that the footer unsubscribe link resolves to a real page.

---

## 12. Status Mapping (Tracker → Email)

| Tracker status | Email sent? | Framing |
|---|---|---|
| `saved` | No | — |
| `in_progress` | No | — |
| `submitted` | Yes | "Application submitted" |
| `won` | Yes | "Congratulations — you won!" |
| `lost` | Yes | "Application not selected" |
| `skipped` | No | — |

---

## 13. Out of Scope

- `/settings/notifications` UI (only stub route is built)
- User timezone storage (9am ET used for all deadline/match crons)
- Email preview / testing UI
- Unsubscribe one-click link (footer links to settings page only)
