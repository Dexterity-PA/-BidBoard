# Meritously

Meritously is a free, student-built merit scholarship finder. Students can browse a source-linked catalog, answer four optional profile questions to find potential matches, and create an account to save awards and track deadlines. Matching is a starting point, not a guarantee of eligibility; students confirm the full requirements on each award's official page.

The live site remains at [bidboard.app](https://www.bidboard.app). The repository name and working email addresses keep the original domain. Some older research and strategy tools remain in the codebase but are not part of the current public homepage.

## Scholarship source reviews

`data/merit/verification.json` records an individual review date, outcome, and remaining limitations for each reviewed listing. `audit-2026-09-29.json` retains the field-level source evidence and corrections. A reviewed listing is only marked verified when its identity, value, deadline, application route, and eligibility are supported. Unpublished future-cycle terms and conflicting official information remain partial; inaccessible official information remains unavailable.

Review outcomes are separate from program classifications such as merit plus need or award directories. Unknown award values do not contribute dollar amounts or full-tuition labels to filters. Calendar steps require explicitly published years; edited targets remain visible alongside official dates. Renamed programs keep their existing URLs.

The build checks complete audit coverage before release. After compilation, production applies the committed catalog corrections only to existing `merit-ledger` database rows. It preserves edited application targets, notes, statuses, and checklists, and only adjusts deadline copies that are still untouched. Removed awards remain in students' saved history with reminders paused. Preview and local builds validate the evidence without changing a database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS 3, Framer Motion |
| UI Primitives | Radix UI, shadcn/ui |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL (serverless) + pgvector |
| Auth | Clerk v6 |
| AI (classification) | Anthropic SDK (Claude Haiku) |
| AI (embeddings) | OpenAI (`text-embedding-3-small`, 1536-dim) |
| AI (scraping) | Google Gemini (`@google/generative-ai`) |
| Email | Resend + React Email |
| Scraping | Playwright (headless Chromium) |
| Webhooks | svix (Clerk webhook verification) |
| Forms | React Hook Form + Zod |
| Language | TypeScript 5 |

---

## Features

### Scholarship Matching
- Hard disqualifiers eliminate scholarships where the student fails GPA, state, citizenship, gender, or grade-level requirements
- Soft penalties score partial matches across major, ethnicity, first-generation status, extracurriculars, and military family status
- Match scores (0-100) feed directly into the EV calculation

### Expected-Value (EV) Scoring
- Award amount (supports fixed, range, and full-ride types) × estimated win probability
- Win probability derived from applicant pool size (estimated from locality + eligibility filters) and adjusted by match score
- Produces `evScore` (expected dollars) and `evPerHour` (dollars per hour of effort) for every match

### Knapsack Planner
- 0/1 dynamic-programming knapsack over the student's active match list
- Time budget in hours converts to half-hour integer slots; runs in < 1 ms for typical inputs
- Returns the optimal subset sorted by EV, displayed as a ranked portfolio in the Planner page

### AI Essay Engine
- Claude Haiku classifies any essay prompt into one of 8 archetypes: `adversity`, `career_goals`, `community_impact`, `identity`, `leadership`, `innovation`, `financial_need`, `other`
- OpenAI `text-embedding-3-small` generates 1536-dim vectors stored in pgvector for semantic similarity
- Essay recycling endpoint (`POST /api/essays/recycle`) surfaces past essays that match a new scholarship's archetype and embedding

### Application Tracker
- Per-scholarship status: `saved → in_progress → submitted → awarded / declined`
- Full status history stored as JSONB for timeline display
- Links essay draft IDs to applications; tracks award amounts and notes

### Dashboard
- Live stat cards: total matched, upcoming deadlines, active applications, total EV pipeline
- Cycle Progress Ring and Next Action Card widgets highlight the highest-value next move
- Deadline Timeline (visual dot-plot of upcoming deadlines)
- New Matches Feed (recent scholarship additions)
- Activity Heatmap (GitHub-style contribution grid)
- Win Rate Card (applied vs. awarded ratio)

### Email Notifications (Resend)
- Welcome email on signup
- Deadline reminders at 7 days, 3 days, and 1 day out (cron-driven)
- New-matches digest when fresh scholarships enter the pipeline
- Status-change notifications
- Weekly digest summarizing the portfolio
- Per-user opt-in/opt-out preferences stored in the database
- Deduplication via `sent_notifications` table; full audit log in `notifications_log`

### Scholarship Database & Scraper
- Playwright-based scraper engine with site-specific configs and a Gemini-powered normalizer
- Bulk scrape scripts: `scripts/bulk-scrape.ts`, `scripts/scrape-gov.ts`
- Scholarships store essay prompts, tips, requirements, open/close dates, and locality level as structured data

### Fully Free
- Every feature is free for every user, including counselors
- No paid tiers, no checkout, and no payment data collected

---

## Project Structure

```
app/
  _components/        Landing page sections (hero, nav, scroll reveal)
  api/
    auth/webhook/     Clerk webhook that syncs users to DB
    cron/             Scheduled email jobs (deadline reminders, new matches, weekly digest)
    essays/           Essay CRUD and recycling endpoint
    scholarships/     Matching, deadlines, save/unsave
    user/profile/     Profile read/update
  dashboard/          Main dashboard with stat cards and widgets
  deadlines/          Deadline calendar view
  essays/             Essay engine UI
  matches/            Sortable/filterable scholarship match table
  onboarding/         Multi-step profile setup form
  planner/            Knapsack portfolio optimizer
  scholarships/       Public browse page + detail pages (by slug)
  settings/           Profile editing and notification prefs
  tracker/            Application tracker

components/
  ui/                 shadcn/ui primitives (Button, Card, Badge, etc.)
  essay-engine-client.tsx   Full essay CRUD + archetype display
  match-card.tsx            Scholarship card used in planner
  app-shell.tsx             Authenticated layout shell

db/
  schema.ts           All Drizzle table definitions (users, scholarships, matches, essays, applications, email tables, activity log)
  index.ts            Neon serverless db client
  seed.ts             Development seed data

drizzle/              SQL migration files

lib/
  ev-scoring.ts       EV formula, applicant estimation, hours estimation
  knapsack.ts         0/1 DP knapsack solver
  matching.ts         Match score computation (hard disqualifiers + soft penalties)
  essay-classifier.ts Claude Haiku archetype classifier
  embeddings.ts       OpenAI embedding client
  email/              Resend client, send pipeline, rate limiting, preference checks
  dashboard/queries.ts  Cycle progress and next action queries
  scraper/            Playwright scraper engine, configs, normalizer, DB writer
  scholarships/       Slug helpers and formatting utilities

emails/               React Email templates (welcome, deadline, new-matches, digest, status)
scripts/              CLI scraping scripts (bulk-scrape, scrape-gov, run-scrape)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database with the `pgvector` extension enabled
- A [Clerk](https://clerk.com) application
- An [Anthropic](https://console.anthropic.com) API key
- An [OpenAI](https://platform.openai.com) API key
- A [Resend](https://resend.com) account and verified sending domain

### Environment Variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (from Clerk dashboard) |
| `DATABASE_URL` | Neon connection string (pooled) |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude Haiku for essay classification) |
| `OPENAI_API_KEY` | OpenAI API key (text-embedding-3-small) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sending address (e.g. `notifications@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Public base URL (e.g. `https://www.bidboard.app`) |
| `CRON_SECRET` | Random secret for protecting cron endpoints (`openssl rand -hex 32`) |
| `NEWSLETTER_SECRET` | Optional stable secret for newsletter unsubscribe links; falls back to `CRON_SECRET` |
| `ANALYTICS_ENABLED` | Set to `true` to enable first-party outreach measurement |
| `ANALYTICS_SECRET` | Stable random secret used to hash analytics identifiers |
| `ANALYTICS_ADMIN_EMAIL` | Exact Clerk-verified email allowed to open `/admin/analytics` |

### Weekly scholarship digest

`npm run build` first runs `scripts/migrate-newsletter.mjs` and then
`scripts/migrate-analytics.mjs`. Only Vercel production
builds apply the reviewed additive SQL migration using the deployment's existing
database connection; local and preview builds skip it. Required email/cron settings
and a public HTTPS app URL are checked before connecting. Concurrent production
builds serialize the migration with a transaction advisory lock, and the four
newsletter tables, keys and deferred batch foreign key are verified before commit.
A failure stops the build without printing secrets. Existing accounts are not
enrolled. `db/schema.ts` also exports the newsletter schema for future migrations.

The homepage and notification settings offer a separate, unchecked digest opt-in.
Subscribers must follow a confirmation link and press Confirm before receiving
digests. Tracked-award reminders remain a separate account preference. New account
preference rows start with deadline reminders disabled; saved choices are preserved.

Configure a verified Resend sender, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL` and
`CRON_SECRET` in production. Keep the newsletter signing secret stable so existing
unsubscribe links keep working. There is no local subscriber-file fallback.

Vercel checks the digest queue daily at 15:00 UTC, sending at most one digest per
subscriber per UTC calendar week. Each invocation processes up to 100 batches of
100 messages within a bounded runtime. Daily invocations drain any remaining
recipients. Immutable stored payloads, atomic weekly claims and
[Resend batch idempotency](https://resend.com/changelog/batch-idempotency-keys)
protect retries. Failed batches receive one immediate retry; ambiguous attempts
are not retried after the provider's idempotency window. A recipient opting out
withholds their entire already-prepared batch to preserve consent and deduplication.
The cron response reports sent, failed, skipped and remaining-backlog counts.
Provider quotas still apply; this code does not purchase or upgrade a sending plan.

Confirmation links expire after 24 hours. Unsubscribe links support an explicit
browser confirmation and mail-client one-click POST. Opening a link with GET never
changes the subscription.

Run `npm test` for mocked provider and UI regression tests. Tests use a non-routable
database URL and do not send messages. Do not invoke an authenticated production
cron as a smoke test because it delivers real email.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The lockfile includes patched Next.js, Clerk and transitive dependencies. The
scoped `@esbuild-kit/core-utils` override keeps Drizzle's legacy loader on esbuild
0.25.12 or newer in that minor line, addressing
[GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
The separate development esbuild dependency satisfies Vite's newer peer range.
When changing these versions, run the tests, TypeScript check, dependency audit,
and `drizzle-kit export` against a non-routable database URL.

### Database Migrations

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to the database
npm run db:migrate

# Push schema directly (development shortcut, skips migration files)
npm run db:push

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

> The database requires the `pgvector` extension. Run `CREATE EXTENSION IF NOT EXISTS vector;` once on your Neon project before the first migration.

---

## Deployment

Meritously is designed for [Vercel](https://vercel.com).

1. Push the repository to GitHub and import it in Vercel.
2. Add all environment variables from the table above in the Vercel project settings.
3. Vercel will run `npm run build` automatically on every push to `main`.

### Cron Jobs

The three email cron routes are secured by the `CRON_SECRET` header. Configure them in `vercel.json` or via Vercel Cron Jobs in the dashboard:

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/deadline-reminders` | Daily | Send 7d / 3d / 1d deadline reminder emails |
| `/api/cron/new-matches` | Weekly | Notify users of new scholarship matches |
| `/api/cron/weekly-digest` | Weekly | Send portfolio summary digest |

### Clerk Webhooks

In the Clerk dashboard, add a webhook pointing to `https://yourdomain.com/api/auth/webhook` and subscribe to the `user.created` and `user.updated` events. Copy the signing secret into `CLERK_WEBHOOK_SECRET`.
