# BidBoard Email Notifications

All email templates live in `emails/` and are built with [React Email](https://react.email).
The shared layout and style tokens are in `emails/_components/EmailLayout.tsx`.

## Notification Types

| Type | Template | Send Function | Trigger |
|------|----------|---------------|---------|
| `welcome` | `emails/welcome.tsx` | `lib/email/send/welcome.ts` | Clerk `user.created` webhook |
| `deadline_reminders` | `emails/deadline-reminder.tsx` | `lib/email/send/deadline-reminder.ts` | Daily cron — 9 AM ET (`0 14 * * *` UTC) |
| `new_matches` | `emails/new-matches.tsx` | `lib/email/send/new-matches.ts` | Daily cron — 8 AM ET (`0 13 * * *` UTC) |
| `status_changes` | `emails/status-change.tsx` | `lib/email/send/status-change.ts` | `updateApplicationStatus` server action (submitted / won / lost only) |
| `weekly_digest` | `emails/weekly-digest.tsx` | `lib/email/send/weekly-digest.ts` | Weekly cron — Sunday 6 PM ET (`0 23 * * 0` UTC) |
| `payment_events` | `emails/payment.tsx` | `lib/email/send/payment.ts` | Stripe webhook events |

## Cron Routes

Cron routes are under `app/api/cron/` and require a `Authorization: Bearer <CRON_SECRET>` header.
Vercel sends this automatically when the cron schedule fires (configured in `vercel.json`).

| Route | Schedule (UTC) | Description |
|-------|---------------|-------------|
| `/api/cron/new-matches` | `0 13 * * *` | 8 AM ET — new scholarship matches |
| `/api/cron/deadline-reminders` | `0 14 * * *` | 9 AM ET — upcoming deadlines (7-day window) |
| `/api/cron/weekly-digest` | `0 23 * * 0` | 6 PM ET Sunday — weekly digest |

## Rate Limiting & Dedupe

- Non-payment emails are capped at **2 per user per day** (checked via `notifications_log`).
- `payment_events` are exempt from the rate limit.
- `sent_notifications` prevents re-sending the same notification type for the same scholarship (or the same non-scholarship type) using partial unique indexes.

## User Preferences

`user_email_preferences` stores per-user opt-outs (all default `true`). Users can manage preferences at `/settings/notifications`.

## Local Testing

Install the React Email dev server:

```bash
npx react-email dev
```

This starts a preview server at `http://localhost:3000` where you can browse all templates in `emails/`.

To test a specific template, pass props directly in the preview file or use the React Email playground.

To trigger a cron route locally:

```bash
curl -H "Authorization: Bearer dev-cron-secret-replace-before-deploy" \
  http://localhost:3000/api/cron/deadline-reminders
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for sending emails |
| `RESEND_FROM_EMAIL` | Sender address (default: `notifications@bidboard.app`) |
| `CRON_SECRET` | Shared secret for cron route auth — set in Vercel project settings |
