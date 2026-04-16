# BidBoard

BidBoard is a scholarship strategy platform that helps students maximize their aid by applying quantitative finance techniques to the scholarship hunt. Every scholarship in the database is scored with an expected-value (EV) formula — award amount × win probability, adjusted for match quality — then a 0/1 knapsack solver selects the highest-EV portfolio that fits inside a student's time budget. An AI essay engine (Claude for prompt classification, OpenAI for semantic embeddings) clusters and recycles essays across multiple applications, and a full application tracker records every stage from "saved" through "awarded."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 18) |
| Styling | Tailwind CSS 3, Framer Motion |
| UI Primitives | Radix UI, shadcn/ui |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL (serverless) + pgvector |
| Auth | Clerk v6 |
| Payments | Stripe (subscriptions + billing portal) |
| AI — classification | Anthropic SDK (Claude Haiku) |
| AI — embeddings | OpenAI (`text-embedding-3-small`, 1536-dim) |
| AI — scraping | Google Gemini (`@google/generative-ai`) |
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
- Match scores (0–100) feed directly into the EV calculation

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
- Payment confirmation emails
- Per-user opt-in/opt-out preferences stored in the database
- Deduplication via `sent_notifications` table; full audit log in `notifications_log`

### Scholarship Database & Scraper
- Playwright-based scraper engine with site-specific configs and a Gemini-powered normalizer
- Bulk scrape scripts: `scripts/bulk-scrape.ts`, `scripts/scrape-gov.ts`
- Scholarships store essay prompts, tips, requirements, open/close dates, and locality level as structured data

### Subscription Tiers
- **Free** — limited matches, basic tracker
- **Premium** — unlimited matches, essay recycling
- **Ultra** — long-tail scholarships
- **Counselor** — counselor dashboard access
- Stripe Checkout and Customer Portal fully integrated; tier stored on the `users` row and synced via Stripe webhooks

---

## Project Structure

```
app/
  _components/        Landing page sections (hero, nav, scroll reveal)
  api/
    auth/webhook/     Clerk webhook — syncs users to DB
    cron/             Scheduled email jobs (deadline reminders, new matches, weekly digest)
    essays/           Essay CRUD and recycling endpoint
    scholarships/     Matching, deadlines, save/unsave
    stripe/           Checkout, portal, webhook
    user/profile/     Profile read/update
  dashboard/          Main dashboard with stat cards and widgets
  deadlines/          Deadline calendar view
  essays/             Essay engine UI
  matches/            Sortable/filterable scholarship match table
  onboarding/         Multi-step profile setup form
  planner/            Knapsack portfolio optimizer
  pricing/            Subscription plans + Stripe checkout
  scholarships/       Public browse page + detail pages (by slug)
  settings/           Profile editing, notification prefs, billing portal
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
  tier.ts             Feature gate checks by subscription tier
  stripe.ts           Stripe client, checkout, and portal helpers
  email/              Resend client, send pipeline, rate limiting, preference checks
  dashboard/queries.ts  Cycle progress and next action queries
  scraper/            Playwright scraper engine, configs, normalizer, DB writer
  scholarships/       Slug helpers and formatting utilities

emails/               React Email templates (welcome, deadline, new-matches, digest, status, payment)
scripts/              CLI scraping scripts (bulk-scrape, scrape-gov, run-scrape)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database with the `pgvector` extension enabled
- A [Clerk](https://clerk.com) application
- A [Stripe](https://stripe.com) account with three subscription price IDs (Premium, Ultra, Counselor)
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
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for the Premium plan |
| `STRIPE_ULTRA_PRICE_ID` | Stripe price ID for the Ultra plan |
| `STRIPE_COUNSELOR_PRICE_ID` | Stripe price ID for the Counselor plan |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sending address (e.g. `notifications@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Public base URL (e.g. `https://www.bidboard.app`) |
| `CRON_SECRET` | Random secret for protecting cron endpoints (`openssl rand -hex 32`) |

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

BidBoard is designed for [Vercel](https://vercel.com).

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

### Stripe Webhooks

In the Stripe dashboard, add a webhook pointing to `https://yourdomain.com/api/stripe/webhook` and subscribe to `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events.
