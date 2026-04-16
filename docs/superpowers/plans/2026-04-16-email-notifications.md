# Email Notifications System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete transactional email system delivering 6 notification types via Resend with React Email templates, per-user preference controls, 2/day rate limiting, and idempotent send logic.

**Architecture:** All emails flow through `lib/email/send.ts` which checks preferences, enforces rate limits, sends via Resend, and logs every attempt to `notifications_log`. Cron routes handle bulk sends; event hooks (Clerk webhook, Stripe webhook, tracker action) handle per-user sends. Three new Drizzle tables store preferences, dedupe records, and audit logs.

**Tech Stack:** Resend v4, @react-email/components, Drizzle ORM + Neon Postgres, Vercel cron, Next.js App Router

---

## File Map

**Create:**
- `drizzle/0002_email_notifications.sql` — raw SQL migration reference
- `db/schema.ts` — extend with 3 new tables (modify)
- `lib/email/client.ts` — Resend singleton + NotificationType + FROM_EMAIL
- `lib/email/preferences.ts` — lazy-upsert prefs row, read preference boolean
- `lib/email/rate-limit.ts` — 2/day cap check, payment exempt
- `lib/email/send.ts` — core pipeline: pref check → rate limit → send → log
- `lib/email/send/welcome.ts`
- `lib/email/send/deadline-reminder.ts`
- `lib/email/send/new-matches.ts`
- `lib/email/send/status-change.ts`
- `lib/email/send/weekly-digest.ts`
- `lib/email/send/payment.ts`
- `emails/_components/EmailLayout.tsx`
- `emails/welcome.tsx`
- `emails/deadline-reminder.tsx`
- `emails/new-matches.tsx`
- `emails/status-change.tsx`
- `emails/weekly-digest.tsx`
- `emails/payment.tsx`
- `emails/README.md`
- `app/api/cron/deadline-reminders/route.ts`
- `app/api/cron/new-matches/route.ts`
- `app/api/cron/weekly-digest/route.ts`
- `app/settings/notifications/page.tsx`
- `vercel.json`

**Modify:**
- `app/api/auth/webhook/route.ts` — call sendWelcomeEmail on user.created
- `app/api/stripe/webhook/route.ts` — add 4 new payment event handlers
- `app/actions/tracker.ts` — fire sendStatusChangeEmail after updateApplicationStatus

---

## Task 1: Install packages + environment variables

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env`

- [ ] **Step 1.1: Install React Email packages**

```bash
cd /Users/main/PycharmProjects/Bidboard
npm install @react-email/components @react-email/render
```

Expected: both packages added to `node_modules/` and `package.json`.

- [ ] **Step 1.2: Add new env vars to `.env`**

Append to the bottom of `.env`:
```bash
# Email
RESEND_FROM_EMAIL=notifications@bidboard.app

# Cron
CRON_SECRET=replace-with-random-secret-before-deploying
```

- [ ] **Step 1.3: Create `.env.example` documenting all vars**

Create `/Users/main/PycharmProjects/Bidboard/.env.example`:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=

# Neon / Postgres
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ULTRA_PRICE_ID=
STRIPE_COUNSELOR_PRICE_ID=

# Resend
RESEND_API_KEY=

# Email
RESEND_FROM_EMAIL=notifications@bidboard.app

# App
NEXT_PUBLIC_APP_URL=https://www.bidboard.app

# Cron (generate a random secret: openssl rand -hex 32)
CRON_SECRET=
```

- [ ] **Step 1.4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: install react-email packages and document env vars"
```

---

## Task 2: DB schema + migration

**Files:**
- Modify: `db/schema.ts`
- Create: `drizzle/0002_email_notifications.sql`

- [ ] **Step 2.1: Add 3 new tables to `db/schema.ts`**

Open `db/schema.ts`. After the `applications` table export at the bottom, append:

```ts
// ---------------------------------------------------------------------------
// user_email_preferences
// ---------------------------------------------------------------------------
export const userEmailPreferences = pgTable("user_email_preferences", {
  userId:            text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  welcome:           boolean("welcome").default(true).notNull(),
  deadlineReminders: boolean("deadline_reminders").default(true).notNull(),
  newMatches:        boolean("new_matches").default(true).notNull(),
  statusChanges:     boolean("status_changes").default(true).notNull(),
  weeklyDigest:      boolean("weekly_digest").default(true).notNull(),
  paymentEvents:     boolean("payment_events").default(true).notNull(),
  createdAt:         timestamp("created_at").defaultNow(),
  updatedAt:         timestamp("updated_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// sent_notifications  (dedupe — prevents re-sending the same reminder)
// ---------------------------------------------------------------------------
export const sentNotifications = pgTable(
  "sent_notifications",
  {
    id:           serial("id").primaryKey(),
    userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    scholarshipId: integer("scholarship_id").references(() => scholarships.id, { onDelete: "cascade" }),
    type:         text("type").notNull(),
    sentAt:       timestamp("sent_at").defaultNow(),
  },
  (t) => [
    // Partial unique indexes handle nullable scholarship_id correctly
    uniqueIndex("sent_notifs_with_scholarship")
      .on(t.userId, t.scholarshipId, t.type)
      .where(sql`${t.scholarshipId} IS NOT NULL`),
    uniqueIndex("sent_notifs_without_scholarship")
      .on(t.userId, t.type)
      .where(sql`${t.scholarshipId} IS NULL`),
    index("idx_sent_notifs_user").on(t.userId),
  ]
);

// ---------------------------------------------------------------------------
// notifications_log  (audit — every send attempt)
// ---------------------------------------------------------------------------
export const notificationsLog = pgTable(
  "notifications_log",
  {
    id:       serial("id").primaryKey(),
    userId:   text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type:     text("type").notNull(),
    status:   text("status").notNull(), // "sent" | "skipped" | "error"
    error:    text("error"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    sentAt:   timestamp("sent_at").defaultNow(),
  },
  (t) => [
    index("idx_notifications_log_user_sent").on(t.userId, t.sentAt),
  ]
);
```

- [ ] **Step 2.2: Create raw migration SQL `drizzle/0002_email_notifications.sql`**

```sql
-- 0002_email_notifications.sql
-- Run via: npm run db:push (Drizzle pushes schema.ts directly)
-- This file is a reference copy of what drizzle-kit would generate.

CREATE TABLE IF NOT EXISTS "user_email_preferences" (
  "user_id"           text PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "welcome"           boolean NOT NULL DEFAULT true,
  "deadline_reminders" boolean NOT NULL DEFAULT true,
  "new_matches"       boolean NOT NULL DEFAULT true,
  "status_changes"    boolean NOT NULL DEFAULT true,
  "weekly_digest"     boolean NOT NULL DEFAULT true,
  "payment_events"    boolean NOT NULL DEFAULT true,
  "created_at"        timestamp DEFAULT now(),
  "updated_at"        timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sent_notifications" (
  "id"             serial PRIMARY KEY,
  "user_id"        text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "scholarship_id" integer REFERENCES "scholarships"("id") ON DELETE CASCADE,
  "type"           text NOT NULL,
  "sent_at"        timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "sent_notifs_with_scholarship"
  ON "sent_notifications" ("user_id", "scholarship_id", "type")
  WHERE "scholarship_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "sent_notifs_without_scholarship"
  ON "sent_notifications" ("user_id", "type")
  WHERE "scholarship_id" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_sent_notifs_user"
  ON "sent_notifications" ("user_id");

CREATE TABLE IF NOT EXISTS "notifications_log" (
  "id"       serial PRIMARY KEY,
  "user_id"  text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"     text NOT NULL,
  "status"   text NOT NULL,
  "error"    text,
  "metadata" jsonb,
  "sent_at"  timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_notifications_log_user_sent"
  ON "notifications_log" ("user_id", "sent_at");
```

- [ ] **Step 2.3: Apply schema to Neon DB**

```bash
npm run db:push
```

Expected: Drizzle introspects the DB, detects 3 new tables, and applies them. Output mentions the new table names.

- [ ] **Step 2.4: Commit**

```bash
git add db/schema.ts drizzle/0002_email_notifications.sql
git commit -m "feat: add user_email_preferences, sent_notifications, notifications_log tables"
```

---

## Task 3: Core email infrastructure

**Files:**
- Create: `lib/email/client.ts`
- Create: `lib/email/preferences.ts`
- Create: `lib/email/rate-limit.ts`
- Create: `lib/email/send.ts`

- [ ] **Step 3.1: Create `lib/email/client.ts`**

```ts
import { Resend } from "resend";

export type NotificationType =
  | "welcome"
  | "deadline_reminders"
  | "new_matches"
  | "status_changes"
  | "weekly_digest"
  | "payment_events";

// Payment events bypass the 2/day rate limit
export const RATE_LIMIT_EXEMPT: NotificationType[] = ["payment_events"];

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "notifications@bidboard.app";

let _resend: Resend | undefined;
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}
```

- [ ] **Step 3.2: Create `lib/email/preferences.ts`**

```ts
import { db } from "@/db";
import { userEmailPreferences } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { NotificationType } from "./client";

const COLUMN_MAP: Record<NotificationType, keyof typeof userEmailPreferences.$inferSelect> = {
  welcome:            "welcome",
  deadline_reminders: "deadlineReminders",
  new_matches:        "newMatches",
  status_changes:     "statusChanges",
  weekly_digest:      "weeklyDigest",
  payment_events:     "paymentEvents",
};

export async function checkPreference(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  // Lazy-create the prefs row with all defaults = true
  await db.execute(sql`
    INSERT INTO user_email_preferences (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `);

  const [prefs] = await db
    .select()
    .from(userEmailPreferences)
    .where(eq(userEmailPreferences.userId, userId))
    .limit(1);

  if (!prefs) return true; // fallback: send
  const col = COLUMN_MAP[type];
  return prefs[col] as boolean;
}
```

- [ ] **Step 3.3: Create `lib/email/rate-limit.ts`**

```ts
import { db } from "@/db";
import { notificationsLog } from "@/db/schema";
import { and, eq, gte, ne, sql } from "drizzle-orm";
import { RATE_LIMIT_EXEMPT, type NotificationType } from "./client";

const DAILY_LIMIT = 2;

export async function canSendToday(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  if (RATE_LIMIT_EXEMPT.includes(type)) return true;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsLog)
    .where(
      and(
        eq(notificationsLog.userId, userId),
        eq(notificationsLog.status, "sent"),
        ne(notificationsLog.type, "payment_events"),
        gte(notificationsLog.sentAt, startOfDay)
      )
    );

  return (row?.count ?? 0) < DAILY_LIMIT;
}
```

- [ ] **Step 3.4: Create `lib/email/send.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import { notificationsLog } from "@/db/schema";
import { checkPreference } from "./preferences";
import { canSendToday } from "./rate-limit";
import { FROM_EMAIL, getResend, type NotificationType } from "./client";

export interface SendEmailParams {
  userId: string;
  type: NotificationType;
  to: string;
  subject: string;
  react: React.ReactElement;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; reason?: string }> {
  const { userId, type, to, subject, react, metadata } = params;

  // 1. Preference check
  const prefAllowed = await checkPreference(userId, type);
  if (!prefAllowed) {
    await logNotification(userId, type, "skipped", "preference_disabled", metadata);
    return { success: false, reason: "preference_disabled" };
  }

  // 2. Rate limit check
  const withinLimit = await canSendToday(userId, type);
  if (!withinLimit) {
    await logNotification(userId, type, "skipped", "rate_limited", metadata);
    return { success: false, reason: "rate_limited" };
  }

  // 3. Send via Resend
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to, subject, react });
    await logNotification(userId, type, "sent", null, metadata);
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await logNotification(userId, type, "error", error, metadata);
    console.error(`[email] Failed to send ${type} to ${userId}:`, err);
    return { success: false, reason: error };
  }
}

async function logNotification(
  userId: string,
  type: NotificationType,
  status: "sent" | "skipped" | "error",
  error: string | null,
  metadata?: Record<string, unknown>
) {
  await db.insert(notificationsLog).values({
    userId,
    type,
    status,
    error: error ?? undefined,
    metadata: metadata ?? undefined,
  });
}
```

- [ ] **Step 3.5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to the new files. (Ignore any pre-existing errors.)

- [ ] **Step 3.6: Commit**

```bash
git add lib/email/
git commit -m "feat: add core email infrastructure (client, preferences, rate-limit, send)"
```

---

## Task 4: EmailLayout shared template component

**Files:**
- Create: `emails/_components/EmailLayout.tsx`

- [ ] **Step 4.1: Create `emails/_components/EmailLayout.tsx`**

```tsx
import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>BidBoard</Text>
          </Section>

          {/* Content */}
          {children}

          {/* Footer */}
          <Hr style={divider} />
          <Section>
            <Text style={footerText}>
              You&apos;re receiving this because you have a BidBoard account.{" "}
              <Link
                href={`${APP_URL}/settings/notifications`}
                style={footerLink}
              >
                Manage email preferences
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} BidBoard. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#09090b",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 24px",
};

const logoSection: React.CSSProperties = {
  marginBottom: "32px",
};

const logo: React.CSSProperties = {
  color: "#a3e635",
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#27272a",
  borderTopWidth: "1px",
  margin: "32px 0",
};

export const footerText: React.CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center",
  margin: "4px 0",
};

export const footerLink: React.CSSProperties = {
  color: "#a3e635",
  textDecoration: "underline",
};

// Shared style tokens used by all templates
export const heading: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 8px 0",
};

export const bodyText: React.CSSProperties = {
  color: "#d4d4d8",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

export const mutedText: React.CSSProperties = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

export const card: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "12px",
  border: "1px solid #27272a",
};

export const accentText: React.CSSProperties = {
  color: "#a3e635",
  fontWeight: "600",
};

export const ctaButton: React.CSSProperties = {
  backgroundColor: "#a3e635",
  color: "#09090b",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};
```

- [ ] **Step 4.2: Commit**

```bash
git add emails/
git commit -m "feat: add EmailLayout shared template component"
```

---

## Task 5: Welcome email

**Files:**
- Create: `emails/welcome.tsx`
- Create: `lib/email/send/welcome.ts`
- Modify: `app/api/auth/webhook/route.ts`

- [ ] **Step 5.1: Create `emails/welcome.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  accentText,
  ctaButton,
  mutedText,
} from "./_components/EmailLayout";

interface WelcomeEmailProps {
  firstName?: string | null;
  appUrl?: string;
}

export function WelcomeEmail({
  firstName,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: WelcomeEmailProps) {
  const name = firstName ? `, ${firstName}` : "";

  return (
    <EmailLayout preview="Welcome to BidBoard — your scholarship command center">
      <Section>
        <Text style={heading}>Welcome to BidBoard{name} 🎓</Text>
        <Text style={bodyText}>
          You&apos;re now set up to find, track, and win scholarships smarter.
          BidBoard matches you to opportunities you actually qualify for and
          tracks every application in one place.
        </Text>
      </Section>

      <Section style={{ marginBottom: "24px" }}>
        <Text style={{ ...bodyText, marginBottom: "12px", fontWeight: "600", color: "#fafafa" }}>
          Get started in 3 steps:
        </Text>

        <div style={card}>
          <Text style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}>
            Step 1
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>Complete your profile</strong> — the
            more we know about you, the better your matches.
          </Text>
        </div>

        <div style={card}>
          <Text style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}>
            Step 2
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>Browse your matches</strong> — we
            rank scholarships by expected value per hour of effort.
          </Text>
        </div>

        <div style={card}>
          <Text style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}>
            Step 3
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>Add your first scholarship</strong> to
            the tracker and never miss a deadline.
          </Text>
        </div>
      </Section>

      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href={`${appUrl}/dashboard`} style={ctaButton}>
          Go to your dashboard →
        </Link>
      </Section>

      <Text style={mutedText}>
        Questions? Reply to this email — we read every one.
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
```

- [ ] **Step 5.2: Create `lib/email/send/welcome.ts`**

```ts
import * as React from "react";
import { WelcomeEmail } from "@/emails/welcome";
import { sendEmail } from "../send";

export async function sendWelcomeEmail(params: {
  userId: string;
  email: string;
  firstName?: string | null;
}): Promise<void> {
  await sendEmail({
    userId: params.userId,
    type: "welcome",
    to: params.email,
    subject: "Welcome to BidBoard 🎓",
    react: React.createElement(WelcomeEmail, { firstName: params.firstName }),
    metadata: { userId: params.userId },
  });
}
```

- [ ] **Step 5.3: Extend `app/api/auth/webhook/route.ts` — add welcome email on user.created**

Find the `if (existingUser)` block and the `else` branch. In the `else` branch (new user insert), add the welcome email call **after** the INSERT completes:

The current `else` block ends with:
```ts
  } else {
    await db.execute(sql`DELETE FROM "users" WHERE "email" = ${primaryEmail}`);
    await db.execute(sql`
      INSERT INTO "users" ("id", "email", "first_name", "last_name")
      VALUES (${id}, ${primaryEmail}, ${first_name ?? null}, ${last_name ?? null})
    `);
  }

  return new Response("OK", { status: 200 });
```

Change it to:
```ts
  } else {
    await db.execute(sql`DELETE FROM "users" WHERE "email" = ${primaryEmail}`);
    await db.execute(sql`
      INSERT INTO "users" ("id", "email", "first_name", "last_name")
      VALUES (${id}, ${primaryEmail}, ${first_name ?? null}, ${last_name ?? null})
    `);
    // Fire welcome email — void (don't block the webhook response)
    void sendWelcomeEmail({ userId: id, email: primaryEmail, firstName: first_name });
  }

  return new Response("OK", { status: 200 });
```

Also add the import at the top of the file (after the existing imports):
```ts
import { sendWelcomeEmail } from "@/lib/email/send/welcome";
```

- [ ] **Step 5.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 5.5: Commit**

```bash
git add emails/welcome.tsx lib/email/send/welcome.ts app/api/auth/webhook/route.ts
git commit -m "feat: welcome email template, send function, and Clerk webhook integration"
```

---

## Task 6: Status change email

**Files:**
- Create: `emails/status-change.tsx`
- Create: `lib/email/send/status-change.ts`
- Modify: `app/actions/tracker.ts`

- [ ] **Step 6.1: Create `emails/status-change.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  mutedText,
} from "./_components/EmailLayout";

type ApplicationStatus = "submitted" | "won" | "lost";

interface StatusChangeEmailProps {
  scholarshipName: string;
  scholarshipProvider: string;
  status: ApplicationStatus;
  applicationUrl?: string | null;
  appUrl?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { emoji: string; label: string; description: string; cta: string }
> = {
  submitted: {
    emoji: "📬",
    label: "Application Submitted",
    description: "Your application has been marked as submitted. Good luck!",
    cta: "View application",
  },
  won: {
    emoji: "🏆",
    label: "Congratulations — You Won!",
    description:
      "Your application was selected. This is a huge achievement — you earned it.",
    cta: "View in tracker",
  },
  lost: {
    emoji: "📋",
    label: "Application Not Selected",
    description:
      "This one didn&apos;t work out, but every application sharpens your approach. Keep going.",
    cta: "Find more scholarships",
  },
};

export function StatusChangeEmail({
  scholarshipName,
  scholarshipProvider,
  status,
  applicationUrl,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: StatusChangeEmailProps) {
  const config = STATUS_CONFIG[status];
  const ctaHref =
    status === "lost"
      ? `${appUrl}/matches`
      : applicationUrl ?? `${appUrl}/tracker`;

  return (
    <EmailLayout preview={`${config.emoji} ${config.label} — ${scholarshipName}`}>
      <Section>
        <Text style={{ fontSize: "32px", margin: "0 0 8px 0" }}>
          {config.emoji}
        </Text>
        <Text style={heading}>{config.label}</Text>
        <Text style={bodyText}>{config.description}</Text>
      </Section>

      <div style={card}>
        <Text style={{ color: "#fafafa", fontWeight: "600", margin: "0 0 2px 0", fontSize: "15px" }}>
          {scholarshipName}
        </Text>
        <Text style={{ color: "#71717a", fontSize: "13px", margin: 0 }}>
          {scholarshipProvider}
        </Text>
      </div>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={ctaHref} style={ctaButton}>
          {config.cta} →
        </Link>
      </Section>

      {status !== "lost" && (
        <Text style={mutedText}>
          Track all your applications at{" "}
          <Link href={`${appUrl}/tracker`} style={{ color: "#a3e635" }}>
            bidboard.app/tracker
          </Link>
        </Text>
      )}
    </EmailLayout>
  );
}

export default StatusChangeEmail;
```

- [ ] **Step 6.2: Create `lib/email/send/status-change.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import { applications, scholarships, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusChangeEmail } from "@/emails/status-change";
import { sendEmail } from "../send";

type TriggerStatus = "submitted" | "won" | "lost";

const SUBJECT_MAP: Record<TriggerStatus, string> = {
  submitted: "Application submitted",
  won:       "Congratulations — you won! 🏆",
  lost:      "Application update",
};

export async function sendStatusChangeEmail(params: {
  userId: string;
  applicationId: number;
  newStatus: TriggerStatus;
}): Promise<void> {
  const { userId, applicationId, newStatus } = params;

  // Fetch user email + application + scholarship in one query
  const [row] = await db
    .select({
      email:               users.email,
      scholarshipName:     scholarships.name,
      scholarshipProvider: scholarships.provider,
      applicationUrl:      scholarships.applicationUrl,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId)
      )
    )
    .limit(1);

  if (!row) return;

  await sendEmail({
    userId,
    type: "status_changes",
    to: row.email,
    subject: SUBJECT_MAP[newStatus],
    react: React.createElement(StatusChangeEmail, {
      scholarshipName:     row.scholarshipName,
      scholarshipProvider: row.scholarshipProvider,
      status:              newStatus,
      applicationUrl:      row.applicationUrl,
    }),
    metadata: { applicationId, status: newStatus },
  });
}
```

- [ ] **Step 6.3: Extend `app/actions/tracker.ts` — hook into `updateApplicationStatus`**

Find the `updateApplicationStatus` function (line ~98). The current implementation ends with:
```ts
export async function updateApplicationStatus(id: number, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db
    .select({ statusHistory: applications.statusHistory })
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  if (!existing[0]) throw new Error("Application not found");

  const history = (existing[0].statusHistory ?? []) as StatusHistoryEntry[];
  const newEntry: StatusHistoryEntry = {
    status,
    at: new Date().toISOString(),
    label: STATUS_LABELS[status] ?? `Moved to ${status}`,
  };

  await db
    .update(applications)
    .set({ status, statusHistory: [...history, newEntry], updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}
```

Replace the entire function with:
```ts
export async function updateApplicationStatus(id: number, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db
    .select({ statusHistory: applications.statusHistory })
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  if (!existing[0]) throw new Error("Application not found");

  const history = (existing[0].statusHistory ?? []) as StatusHistoryEntry[];
  const newEntry: StatusHistoryEntry = {
    status,
    at: new Date().toISOString(),
    label: STATUS_LABELS[status] ?? `Moved to ${status}`,
  };

  await db
    .update(applications)
    .set({ status, statusHistory: [...history, newEntry], updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  // Fire status-change email for terminal/notable transitions only
  if (status === "submitted" || status === "won" || status === "lost") {
    void sendStatusChangeEmail({
      userId,
      applicationId: id,
      newStatus: status as "submitted" | "won" | "lost",
    });
  }
}
```

Add the import at the top of `app/actions/tracker.ts` (after the existing imports):
```ts
import { sendStatusChangeEmail } from "@/lib/email/send/status-change";
```

- [ ] **Step 6.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 6.5: Commit**

```bash
git add emails/status-change.tsx lib/email/send/status-change.ts app/actions/tracker.ts
git commit -m "feat: status-change email template, send function, and tracker integration"
```

---

## Task 7: Deadline reminder email + cron

**Files:**
- Create: `emails/deadline-reminder.tsx`
- Create: `lib/email/send/deadline-reminder.ts`
- Create: `app/api/cron/deadline-reminders/route.ts`

- [ ] **Step 7.1: Create `emails/deadline-reminder.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  accentText,
  mutedText,
} from "./_components/EmailLayout";

export interface DeadlineScholarship {
  name: string;
  provider: string;
  daysLeft: number;
  deadline: string; // formatted date string e.g. "April 30, 2026"
  amountMax?: number | null;
  applicationUrl?: string | null;
}

interface DeadlineReminderEmailProps {
  scholarships: DeadlineScholarship[];
  appUrl?: string;
}

function daysLabel(n: number) {
  return n === 1 ? "1 day" : `${n} days`;
}

export function DeadlineReminderEmail({
  scholarships,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: DeadlineReminderEmailProps) {
  const count = scholarships.length;
  const preview =
    count === 1
      ? `⏰ ${scholarships[0].name} is due in ${daysLabel(scholarships[0].daysLeft)}`
      : `⏰ ${count} scholarship deadlines coming up`;

  return (
    <EmailLayout preview={preview}>
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>⏰</Text>
        <Text style={heading}>
          {count === 1
            ? "Deadline coming up"
            : `${count} deadlines coming up`}
        </Text>
        <Text style={bodyText}>
          {count === 1
            ? "You have a scholarship deadline approaching. Don't let it slip."
            : "You have multiple scholarship deadlines approaching. Stay on top of them."}
        </Text>
      </Section>

      {scholarships.map((s, i) => (
        <div key={i} style={card}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: "15px", margin: "0 0 2px 0" }}>
            {s.name}
          </Text>
          <Text style={{ color: "#71717a", fontSize: "13px", margin: "0 0 6px 0" }}>
            {s.provider}
          </Text>
          <Text style={{ margin: "0 0 4px 0" }}>
            <span style={accentText}>Due in {daysLabel(s.daysLeft)}</span>
            <span style={{ color: "#71717a", fontSize: "13px" }}>
              {" "}— {s.deadline}
            </span>
          </Text>
          {s.amountMax && (
            <Text style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 4px 0" }}>
              Up to ${s.amountMax.toLocaleString()}
            </Text>
          )}
          {s.applicationUrl && (
            <Link href={s.applicationUrl} style={{ color: "#a3e635", fontSize: "13px" }}>
              Apply now →
            </Link>
          )}
        </div>
      ))}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}/tracker`} style={ctaButton}>
          Open tracker →
        </Link>
      </Section>

      <Text style={mutedText}>
        You&apos;re receiving this because you have active scholarships in your
        BidBoard tracker.
      </Text>
    </EmailLayout>
  );
}

export default DeadlineReminderEmail;
```

- [ ] **Step 7.2: Create `lib/email/send/deadline-reminder.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import { applications, scholarships, users, sentNotifications } from "@/db/schema";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { DeadlineReminderEmail, type DeadlineScholarship } from "@/emails/deadline-reminder";
import { sendEmail } from "../send";

const REMINDER_DAYS = [1, 3, 7, 14] as const;
type ReminderDay = (typeof REMINDER_DAYS)[number];

function reminderType(days: ReminderDay): string {
  return `deadline_${days}d`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface PendingReminder {
  userId: string;
  email: string;
  applicationId: number;
  scholarshipId: number;
  scholarshipName: string;
  scholarshipProvider: string;
  amountMax: number | null;
  applicationUrl: string | null;
  deadline: string;
  daysLeft: ReminderDay;
}

export async function runDeadlineReminderCron(): Promise<{ sent: number; skipped: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all applications due in 1, 3, 7, or 14 days with actionable status
  const TERMINAL_STATUSES = ["submitted", "won", "lost"];
  const allPending: PendingReminder[] = [];

  for (const days of REMINDER_DAYS) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const rows = await db
      .select({
        userId:              applications.userId,
        email:               users.email,
        applicationId:       applications.id,
        scholarshipId:       scholarships.id,
        scholarshipName:     scholarships.name,
        scholarshipProvider: scholarships.provider,
        amountMax:           scholarships.amountMax,
        applicationUrl:      scholarships.applicationUrl,
        deadline:            applications.deadline,
        status:              applications.status,
      })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(
        and(
          eq(applications.deadline, targetDateStr),
          sql`${applications.status} NOT IN (${TERMINAL_STATUSES.map(() => "?").join(",")})`
            // Use inArray for safety:
        )
      );

    // Re-query with proper inArray syntax
    const validRows = await db
      .select({
        userId:              applications.userId,
        email:               users.email,
        applicationId:       applications.id,
        scholarshipId:       scholarships.id,
        scholarshipName:     scholarships.name,
        scholarshipProvider: scholarships.provider,
        amountMax:           scholarships.amountMax,
        applicationUrl:      scholarships.applicationUrl,
        deadline:            applications.deadline,
      })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(
        and(
          eq(applications.deadline, targetDateStr),
          sql`${applications.status} NOT IN ('submitted', 'won', 'lost', 'skipped')`
        )
      );

    for (const row of validRows) {
      if (!row.deadline) continue;
      allPending.push({ ...row, daysLeft: days });
    }
  }

  // Group by userId
  const byUser = new Map<string, PendingReminder[]>();
  for (const p of allPending) {
    if (!byUser.has(p.userId)) byUser.set(p.userId, []);
    byUser.get(p.userId)!.push(p);
  }

  let sent = 0;
  let skipped = 0;

  for (const [userId, reminders] of byUser) {
    // Filter out already-sent reminders via sent_notifications
    const notSent: PendingReminder[] = [];
    for (const r of reminders) {
      const type = reminderType(r.daysLeft);
      const [existing] = await db
        .select({ id: sentNotifications.id })
        .from(sentNotifications)
        .where(
          and(
            eq(sentNotifications.userId, userId),
            eq(sentNotifications.scholarshipId, r.scholarshipId),
            eq(sentNotifications.type, type)
          )
        )
        .limit(1);
      if (!existing) notSent.push(r);
    }

    if (notSent.length === 0) {
      skipped++;
      continue;
    }

    const scholarshipsPayload: DeadlineScholarship[] = notSent.map((r) => ({
      name:           r.scholarshipName,
      provider:       r.scholarshipProvider,
      daysLeft:       r.daysLeft,
      deadline:       formatDate(r.deadline!),
      amountMax:      r.amountMax,
      applicationUrl: r.applicationUrl,
    }));

    const email = notSent[0].email;
    const result = await sendEmail({
      userId,
      type: "deadline_reminders",
      to: email,
      subject:
        notSent.length === 1
          ? `⏰ Deadline in ${notSent[0].daysLeft} day${notSent[0].daysLeft === 1 ? "" : "s"}: ${notSent[0].scholarshipName}`
          : `⏰ ${notSent.length} scholarship deadlines coming up`,
      react: React.createElement(DeadlineReminderEmail, { scholarships: scholarshipsPayload }),
      metadata: { scholarshipIds: notSent.map((r) => r.scholarshipId) },
    });

    if (result.success) {
      // Insert dedupe records
      for (const r of notSent) {
        await db
          .insert(sentNotifications)
          .values({ userId, scholarshipId: r.scholarshipId, type: reminderType(r.daysLeft) })
          .onConflictDoNothing();
      }
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
```

- [ ] **Step 7.3: Create `app/api/cron/deadline-reminders/route.ts`**

```ts
import { NextResponse } from "next/server";
import { runDeadlineReminderCron } from "@/lib/email/send/deadline-reminder";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runDeadlineReminderCron();
    console.log("[cron/deadline-reminders]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/deadline-reminders] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
```

- [ ] **Step 7.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 7.5: Commit**

```bash
git add emails/deadline-reminder.tsx lib/email/send/deadline-reminder.ts app/api/cron/deadline-reminders/
git commit -m "feat: deadline reminder email, send function, and cron route"
```

---

## Task 8: New matches email + cron

**Files:**
- Create: `emails/new-matches.tsx`
- Create: `lib/email/send/new-matches.ts`
- Create: `app/api/cron/new-matches/route.ts`

- [ ] **Step 8.1: Create `emails/new-matches.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  accentText,
  mutedText,
} from "./_components/EmailLayout";

export interface MatchedScholarship {
  name: string;
  provider: string;
  matchScore: number; // 0–100
  amountMin?: number | null;
  amountMax?: number | null;
  deadline?: string | null; // formatted
  applicationUrl?: string | null;
}

interface NewMatchesEmailProps {
  matches: MatchedScholarship[];
  appUrl?: string;
}

function formatAmount(min?: number | null, max?: number | null): string | null {
  if (max) return `Up to $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return null;
}

export function NewMatchesEmail({
  matches,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: NewMatchesEmailProps) {
  const count = matches.length;

  return (
    <EmailLayout
      preview={`✨ ${count} new scholarship${count === 1 ? "" : "s"} match your profile`}
    >
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>✨</Text>
        <Text style={heading}>
          {count} new scholarship{count === 1 ? "" : "s"} match your profile
        </Text>
        <Text style={bodyText}>
          Fresh opportunities just added to BidBoard — ranked by how well they
          fit your profile.
        </Text>
      </Section>

      {matches.map((m, i) => {
        const amount = formatAmount(m.amountMin, m.amountMax);
        return (
          <div key={i} style={card}>
            <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: "15px", margin: "0 0 2px 0" }}>
              {m.name}
            </Text>
            <Text style={{ color: "#71717a", fontSize: "13px", margin: "0 0 6px 0" }}>
              {m.provider}
            </Text>
            <Text style={{ margin: "0 0 4px 0" }}>
              <span style={accentText}>{m.matchScore}% match</span>
              {amount && (
                <span style={{ color: "#a1a1aa", fontSize: "13px" }}>
                  {" "}· {amount}
                </span>
              )}
              {m.deadline && (
                <span style={{ color: "#a1a1aa", fontSize: "13px" }}>
                  {" "}· Due {m.deadline}
                </span>
              )}
            </Text>
            {m.applicationUrl && (
              <Link href={m.applicationUrl} style={{ color: "#a3e635", fontSize: "13px" }}>
                View scholarship →
              </Link>
            )}
          </div>
        );
      })}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}/matches`} style={ctaButton}>
          See all matches →
        </Link>
      </Section>

      <Text style={mutedText}>
        Matches are ranked by expected value per hour of application effort.
      </Text>
    </EmailLayout>
  );
}

export default NewMatchesEmail;
```

- [ ] **Step 8.2: Create `lib/email/send/new-matches.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import { scholarships, studentProfiles, scholarshipMatches, users, sentNotifications } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { computeMatchScore } from "@/lib/matching";
import { NewMatchesEmail, type MatchedScholarship } from "@/emails/new-matches";
import { sendEmail } from "../send";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function runNewMatchesCron(): Promise<{ sent: number; skipped: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get scholarships added in the last 24h
  const newScholarships = await db
    .select()
    .from(scholarships)
    .where(and(eq(scholarships.isActive, true), gte(scholarships.createdAt, since)));

  if (newScholarships.length === 0) return { sent: 0, skipped: 0 };

  // Get all users with student profiles
  const profileRows = await db
    .select({
      userId:  studentProfiles.userId,
      email:   users.email,
      profile: studentProfiles,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id));

  let sent = 0;
  let skipped = 0;
  const key = todayKey();
  const dedupeType = `new_matches_${key}`;

  for (const { userId, email, profile } of profileRows) {
    if (!userId) continue;

    // Already sent today?
    const [existing] = await db
      .select({ id: sentNotifications.id })
      .from(sentNotifications)
      .where(
        and(
          eq(sentNotifications.userId, userId),
          eq(sentNotifications.type, dedupeType),
          sql`${sentNotifications.scholarshipId} IS NULL`
        )
      )
      .limit(1);
    if (existing) { skipped++; continue; }

    // Score each new scholarship against this user's profile
    const scored = newScholarships
      .map((s) => ({ scholarship: s, score: computeMatchScore(profile, s) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (scored.length === 0) { skipped++; continue; }

    const matchPayload: MatchedScholarship[] = scored.map(({ scholarship: s, score }) => ({
      name:           s.name,
      provider:       s.provider,
      matchScore:     Math.round(score),
      amountMin:      s.amountMin,
      amountMax:      s.amountMax,
      deadline:       formatDate(s.deadline),
      applicationUrl: s.applicationUrl,
    }));

    const result = await sendEmail({
      userId,
      type: "new_matches",
      to: email,
      subject: `✨ ${scored.length} new scholarship${scored.length === 1 ? "" : "s"} match your profile`,
      react: React.createElement(NewMatchesEmail, { matches: matchPayload }),
      metadata: { count: scored.length, date: key },
    });

    if (result.success) {
      await db
        .insert(sentNotifications)
        .values({ userId, scholarshipId: null, type: dedupeType })
        .onConflictDoNothing();
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
```

- [ ] **Step 8.3: Create `app/api/cron/new-matches/route.ts`**

```ts
import { NextResponse } from "next/server";
import { runNewMatchesCron } from "@/lib/email/send/new-matches";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runNewMatchesCron();
    console.log("[cron/new-matches]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/new-matches] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
```

- [ ] **Step 8.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 8.5: Commit**

```bash
git add emails/new-matches.tsx lib/email/send/new-matches.ts app/api/cron/new-matches/
git commit -m "feat: new-matches email, send function, and cron route"
```

---

## Task 9: Weekly digest email + cron

**Files:**
- Create: `emails/weekly-digest.tsx`
- Create: `lib/email/send/weekly-digest.ts`
- Create: `app/api/cron/weekly-digest/route.ts`

- [ ] **Step 9.1: Create `emails/weekly-digest.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  accentText,
  mutedText,
} from "./_components/EmailLayout";

export interface DigestDeadline {
  name: string;
  daysLeft: number;
  deadline: string;
}

export interface DigestMatch {
  name: string;
  matchScore: number;
  amountMax?: number | null;
}

export interface DigestActivity {
  scholarshipName: string;
  status: "submitted" | "won" | "lost";
}

interface WeeklyDigestEmailProps {
  upcomingDeadlines: DigestDeadline[];
  newMatches: DigestMatch[];
  recentActivity: DigestActivity[];
  totalWon: number;
  appUrl?: string;
}

export function WeeklyDigestEmail({
  upcomingDeadlines,
  newMatches,
  recentActivity,
  totalWon,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: WeeklyDigestEmailProps) {
  return (
    <EmailLayout preview="📊 Your BidBoard week in review">
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>📊</Text>
        <Text style={heading}>Your week in review</Text>
        <Text style={bodyText}>Here&apos;s what&apos;s happening with your scholarships.</Text>
      </Section>

      {upcomingDeadlines.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: "15px", margin: "0 0 8px 0" }}>
            ⏰ Upcoming deadlines
          </Text>
          {upcomingDeadlines.map((d, i) => (
            <div key={i} style={{ ...card, marginBottom: "8px" }}>
              <Text style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}>{d.name}</Text>
              <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                <span style={accentText}>{d.daysLeft}d left</span> · {d.deadline}
              </Text>
            </div>
          ))}
        </Section>
      )}

      {newMatches.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: "15px", margin: "0 0 8px 0" }}>
            ✨ New matches this week
          </Text>
          {newMatches.map((m, i) => (
            <div key={i} style={{ ...card, marginBottom: "8px" }}>
              <Text style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}>{m.name}</Text>
              <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                <span style={accentText}>{m.matchScore}% match</span>
                {m.amountMax && ` · Up to $${m.amountMax.toLocaleString()}`}
              </Text>
            </div>
          ))}
        </Section>
      )}

      {recentActivity.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: "15px", margin: "0 0 8px 0" }}>
            📋 Application activity
          </Text>
          {recentActivity.map((a, i) => {
            const label =
              a.status === "submitted" ? "Submitted"
              : a.status === "won"       ? "Won 🏆"
              : "Not selected";
            return (
              <div key={i} style={{ ...card, marginBottom: "8px" }}>
                <Text style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}>
                  {a.scholarshipName}
                </Text>
                <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>{label}</Text>
              </div>
            );
          })}
        </Section>
      )}

      {totalWon > 0 && (
        <div style={{ ...card, backgroundColor: "#14532d", border: "1px solid #166534" }}>
          <Text style={{ color: "#86efac", fontSize: "14px", fontWeight: "600", margin: "0 0 2px 0" }}>
            Total won so far
          </Text>
          <Text style={{ color: "#dcfce7", fontSize: "22px", fontWeight: "700", margin: 0 }}>
            ${totalWon.toLocaleString()}
          </Text>
        </div>
      )}

      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Link href={`${appUrl}/dashboard`} style={ctaButton}>
          Open dashboard →
        </Link>
      </Section>

      <Text style={mutedText}>
        Sent every Sunday. Update your preferences at{" "}
        <Link href={`${appUrl}/settings/notifications`} style={{ color: "#a3e635" }}>
          bidboard.app/settings/notifications
        </Link>
      </Text>
    </EmailLayout>
  );
}

export default WeeklyDigestEmail;
```

- [ ] **Step 9.2: Create `lib/email/send/weekly-digest.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import {
  applications,
  scholarships,
  scholarshipMatches,
  studentProfiles,
  users,
  sentNotifications,
} from "@/db/schema";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import {
  WeeklyDigestEmail,
  type DigestActivity,
  type DigestDeadline,
  type DigestMatch,
} from "@/emails/weekly-digest";
import { sendEmail } from "../send";

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `digest_${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function runWeeklyDigestCron(): Promise<{ sent: number; skipped: number }> {
  const weekKey = getWeekKey();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Get all users with student profiles
  const profileRows = await db
    .select({ userId: studentProfiles.userId, email: users.email })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id));

  let sent = 0;
  let skipped = 0;

  for (const { userId, email } of profileRows) {
    if (!userId) continue;

    // Already sent this week?
    const [existing] = await db
      .select({ id: sentNotifications.id })
      .from(sentNotifications)
      .where(
        and(
          eq(sentNotifications.userId, userId),
          eq(sentNotifications.type, weekKey),
          sql`${sentNotifications.scholarshipId} IS NULL`
        )
      )
      .limit(1);
    if (existing) { skipped++; continue; }

    // 1. Upcoming deadlines (next 14 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenOut = fourteenDaysOut.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const deadlineRows = await db
      .select({ name: scholarships.name, deadline: applications.deadline })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          sql`${applications.deadline} >= ${todayStr}`,
          sql`${applications.deadline} <= ${fourteenOut}`,
          sql`${applications.status} NOT IN ('submitted', 'won', 'lost', 'skipped')`
        )
      );

    const upcomingDeadlines: DigestDeadline[] = deadlineRows
      .filter((r) => r.deadline)
      .map((r) => {
        const dl = new Date(r.deadline!);
        const daysLeft = Math.ceil(
          (dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          name: r.name,
          daysLeft,
          deadline: dl.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // 2. New matches this week
    const matchRows = await db
      .select({
        name:       scholarships.name,
        matchScore: scholarshipMatches.matchScore,
        amountMax:  scholarships.amountMax,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarshipMatches.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(sql`${scholarshipMatches.matchScore} DESC`)
      .limit(5);

    const newMatches: DigestMatch[] = matchRows.map((m) => ({
      name:       m.name,
      matchScore: Math.round(parseFloat(m.matchScore ?? "0")),
      amountMax:  m.amountMax,
    }));

    // 3. Recent activity (status moves to submitted/won/lost this week)
    const activityRows = await db
      .select({ name: scholarships.name, status: applications.status })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          gte(applications.updatedAt, sevenDaysAgo),
          sql`${applications.status} IN ('submitted', 'won', 'lost')`
        )
      );

    const recentActivity: DigestActivity[] = activityRows.map((a) => ({
      scholarshipName: a.name,
      status: a.status as "submitted" | "won" | "lost",
    }));

    // 4. Total won
    const [wonRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(award_amount), 0)::int` })
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "won")));
    const totalWon = wonRow?.total ?? 0;

    // Skip if everything is empty
    if (
      upcomingDeadlines.length === 0 &&
      newMatches.length === 0 &&
      recentActivity.length === 0 &&
      totalWon === 0
    ) {
      skipped++;
      continue;
    }

    const result = await sendEmail({
      userId,
      type: "weekly_digest",
      to: email,
      subject: "📊 Your BidBoard week in review",
      react: React.createElement(WeeklyDigestEmail, {
        upcomingDeadlines,
        newMatches,
        recentActivity,
        totalWon,
      }),
      metadata: { weekKey },
    });

    if (result.success) {
      await db
        .insert(sentNotifications)
        .values({ userId, scholarshipId: null, type: weekKey })
        .onConflictDoNothing();
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
```

- [ ] **Step 9.3: Create `app/api/cron/weekly-digest/route.ts`**

```ts
import { NextResponse } from "next/server";
import { runWeeklyDigestCron } from "@/lib/email/send/weekly-digest";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runWeeklyDigestCron();
    console.log("[cron/weekly-digest]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/weekly-digest] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
```

- [ ] **Step 9.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 9.5: Commit**

```bash
git add emails/weekly-digest.tsx lib/email/send/weekly-digest.ts app/api/cron/weekly-digest/
git commit -m "feat: weekly digest email, send function, and cron route"
```

---

## Task 10: Payment email + Stripe webhook extension

**Files:**
- Create: `emails/payment.tsx`
- Create: `lib/email/send/payment.ts`
- Modify: `app/api/stripe/webhook/route.ts`

- [ ] **Step 10.1: Create `emails/payment.tsx`**

```tsx
import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  mutedText,
} from "./_components/EmailLayout";

export type PaymentEventType =
  | "subscription_started"
  | "subscription_renewed"
  | "payment_failed"
  | "subscription_canceled"
  | "trial_ending";

interface PaymentEmailProps {
  event: PaymentEventType;
  tier?: string;
  amount?: string | null;
  nextBillingDate?: string | null;
  trialEndDate?: string | null;
  appUrl?: string;
}

const EVENT_CONFIG: Record<
  PaymentEventType,
  { emoji: string; subject: string; headline: string; body: string; cta: string; ctaPath: string }
> = {
  subscription_started: {
    emoji: "🎉",
    subject: "Welcome to BidBoard Premium",
    headline: "Your subscription is active",
    body:  "You now have full access to BidBoard. Start finding and winning more scholarships.",
    cta:   "Go to dashboard",
    ctaPath: "/dashboard",
  },
  subscription_renewed: {
    emoji: "✅",
    subject: "Subscription renewed",
    headline: "Your subscription has been renewed",
    body:  "Your BidBoard subscription has been successfully renewed. Happy scholarship hunting.",
    cta:   "View account",
    ctaPath: "/settings",
  },
  payment_failed: {
    emoji: "⚠️",
    subject: "Action required: payment failed",
    headline: "Your payment couldn't be processed",
    body:  "We couldn't charge your payment method. Update it to keep your access.",
    cta:   "Update payment method",
    ctaPath: "/settings",
  },
  subscription_canceled: {
    emoji: "💔",
    subject: "Subscription canceled",
    headline: "Your subscription has been canceled",
    body:  "Your BidBoard subscription has been canceled. You'll retain access until the end of your billing period.",
    cta:   "Reactivate subscription",
    ctaPath: "/pricing",
  },
  trial_ending: {
    emoji: "⏳",
    subject: "Your trial ends in 3 days",
    headline: "Trial ending soon",
    body:  "Your BidBoard trial ends in 3 days. Subscribe to keep your matches, tracker, and all your data.",
    cta:   "Upgrade now",
    ctaPath: "/pricing",
  },
};

export function PaymentEmail({
  event,
  tier,
  amount,
  nextBillingDate,
  trialEndDate,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: PaymentEmailProps) {
  const config = EVENT_CONFIG[event];

  return (
    <EmailLayout preview={`${config.emoji} ${config.subject}`}>
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>{config.emoji}</Text>
        <Text style={heading}>{config.headline}</Text>
        <Text style={bodyText}>{config.body}</Text>
      </Section>

      {(tier || amount || nextBillingDate || trialEndDate) && (
        <div style={card}>
          {tier && (
            <Text style={{ color: "#a3e635", fontWeight: "600", fontSize: "14px", margin: "0 0 4px 0" }}>
              Plan: {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Text>
          )}
          {amount && (
            <Text style={{ color: "#d4d4d8", fontSize: "14px", margin: "0 0 4px 0" }}>
              Amount: {amount}
            </Text>
          )}
          {nextBillingDate && (
            <Text style={{ color: "#71717a", fontSize: "13px", margin: "0 0 4px 0" }}>
              Next billing: {nextBillingDate}
            </Text>
          )}
          {trialEndDate && (
            <Text style={{ color: "#71717a", fontSize: "13px", margin: 0 }}>
              Trial ends: {trialEndDate}
            </Text>
          )}
        </div>
      )}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}${config.ctaPath}`} style={ctaButton}>
          {config.cta} →
        </Link>
      </Section>

      <Text style={mutedText}>
        Questions about billing? Reply to this email or visit{" "}
        <Link href={`${appUrl}/settings`} style={{ color: "#a3e635" }}>
          your account settings
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

export default PaymentEmail;
```

- [ ] **Step 10.2: Create `lib/email/send/payment.ts`**

```ts
import * as React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PaymentEmail, type PaymentEventType } from "@/emails/payment";
import { sendEmail } from "../send";

const SUBJECTS: Record<PaymentEventType, string> = {
  subscription_started:  "🎉 Welcome to BidBoard Premium",
  subscription_renewed:  "✅ Subscription renewed",
  payment_failed:        "⚠️ Action required: payment failed",
  subscription_canceled: "Your subscription has been canceled",
  trial_ending:          "⏳ Your trial ends in 3 days",
};

interface SendPaymentEmailParams {
  stripeCustomerId: string;
  event: PaymentEventType;
  tier?: string;
  amount?: string | null;
  nextBillingDate?: string | null;
  trialEndDate?: string | null;
}

export async function sendPaymentEmail(params: SendPaymentEmailParams): Promise<void> {
  const { stripeCustomerId, event, tier, amount, nextBillingDate, trialEndDate } = params;

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);

  if (!user) {
    console.warn(`[email/payment] No user found for stripeCustomerId: ${stripeCustomerId}`);
    return;
  }

  await sendEmail({
    userId: user.id,
    type: "payment_events",
    to: user.email,
    subject: SUBJECTS[event],
    react: React.createElement(PaymentEmail, { event, tier, amount, nextBillingDate, trialEndDate }),
    metadata: { event, stripeCustomerId },
  });
}
```

- [ ] **Step 10.3: Extend `app/api/stripe/webhook/route.ts`**

Add the import at the top:
```ts
import { sendPaymentEmail } from "@/lib/email/send/payment";
```

Then extend the `switch (event.type)` block. The current switch handles 3 cases. Add 4 more cases and extend the existing `checkout.session.completed` case to fire a payment email.

Replace the entire `switch` block with:
```ts
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId) break;

        const customerId = session.customer;
        const subscriptionId = session.subscription;
        if (!customerId || typeof customerId !== "string") break;
        if (!subscriptionId || typeof subscriptionId !== "string") break;

        const fullSession = await getStripe().checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });
        const priceId = fullSession.line_items?.data[0]?.price?.id;
        const tier = getPriceToTier()[priceId ?? ""] ?? "free";

        await db
          .update(users)
          .set({ tier, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
          .where(eq(users.id, userId));

        void sendPaymentEmail({
          stripeCustomerId: customerId,
          event: "subscription_started",
          tier,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const tier = getPriceToTier()[priceId ?? ""] ?? "free";
        const customerId = subscription.customer as string;

        await db
          .update(users)
          .set({ tier })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await db
          .update(users)
          .set({ tier: "free" })
          .where(eq(users.stripeCustomerId, customerId));

        void sendPaymentEmail({ stripeCustomerId: customerId, event: "subscription_canceled" });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Skip the first invoice — checkout.session.completed already handles subscription_started
        if (invoice.billing_reason === "subscription_create") break;
        const customerId = invoice.customer as string;
        const amount = invoice.amount_paid
          ? `$${(invoice.amount_paid / 100).toFixed(2)}`
          : null;
        const nextDate = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })
          : null;
        void sendPaymentEmail({
          stripeCustomerId: customerId,
          event: "subscription_renewed",
          amount,
          nextBillingDate: nextDate,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        void sendPaymentEmail({ stripeCustomerId: customerId, event: "payment_failed" });
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })
          : null;
        void sendPaymentEmail({
          stripeCustomerId: customerId,
          event: "trial_ending",
          trialEndDate: trialEnd,
        });
        break;
      }
    }
```

- [ ] **Step 10.4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 10.5: Commit**

```bash
git add emails/payment.tsx lib/email/send/payment.ts app/api/stripe/webhook/route.ts
git commit -m "feat: payment email template, send function, and Stripe webhook extension"
```

---

## Task 11: Cron config, stub page, README

**Files:**
- Create: `vercel.json`
- Create: `app/settings/notifications/page.tsx`
- Create: `emails/README.md`

- [ ] **Step 11.1: Create `vercel.json`**

```json
{
  "crons": [
    { "path": "/api/cron/new-matches",        "schedule": "0 13 * * *"  },
    { "path": "/api/cron/deadline-reminders", "schedule": "0 14 * * *"  },
    { "path": "/api/cron/weekly-digest",      "schedule": "0 23 * * 0"  }
  ]
}
```

- [ ] **Step 11.2: Create `app/settings/notifications/page.tsx`**

```tsx
export default function NotificationsSettingsPage() {
  return (
    <main style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
        Email Preferences
      </h1>
      <p style={{ color: "#71717a" }}>
        Notification preference controls are coming soon.
      </p>
    </main>
  );
}
```

- [ ] **Step 11.3: Create `emails/README.md`**

```markdown
# BidBoard Email Notifications

Six transactional email types delivered via Resend using React Email templates.

## Templates

| Template | Trigger | File |
|---|---|---|
| Welcome | Clerk `user.created` webhook | `emails/welcome.tsx` |
| Deadline Reminder | Cron: daily 9am ET | `emails/deadline-reminder.tsx` |
| New Matches | Cron: daily 8am ET | `emails/new-matches.tsx` |
| Status Change | `updateApplicationStatus()` server action | `emails/status-change.tsx` |
| Weekly Digest | Cron: Sunday 6pm ET | `emails/weekly-digest.tsx` |
| Payment | Stripe webhook events | `emails/payment.tsx` |

## Send Functions

Each template has a corresponding send function in `lib/email/send/`:

```
lib/email/send/welcome.ts          → sendWelcomeEmail()
lib/email/send/deadline-reminder.ts → runDeadlineReminderCron()
lib/email/send/new-matches.ts      → runNewMatchesCron()
lib/email/send/status-change.ts    → sendStatusChangeEmail()
lib/email/send/weekly-digest.ts    → runWeeklyDigestCron()
lib/email/send/payment.ts          → sendPaymentEmail()
```

## Infrastructure

- **Rate limit:** 2 non-payment emails/day/user (enforced in `lib/email/rate-limit.ts`)
- **Preferences:** Per-type opt-out stored in `user_email_preferences` table
- **Dedupe:** `sent_notifications` table prevents re-sending the same reminder
- **Audit log:** Every send attempt (sent/skipped/error) logged to `notifications_log`
- **From address:** `RESEND_FROM_EMAIL` env var (default: `notifications@bidboard.app`)

## Testing Locally

### Test a welcome email
Trigger a `user.created` Clerk webhook via the Clerk dashboard or ngrok.

### Test cron routes manually
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/deadline-reminders
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/new-matches
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/weekly-digest
```

### Test status-change email
Move an application card to "Submitted", "Won", or "Lost" in the tracker UI.

### Test payment emails
Use Stripe CLI: `stripe trigger invoice.payment_failed`

### Preview templates (React Email devserver)
```bash
npx email dev --dir emails --port 3001
```

## Required Environment Variables

```
RESEND_API_KEY=           # Resend API key
RESEND_FROM_EMAIL=        # From address (default: notifications@bidboard.app)
CRON_SECRET=              # Random secret for cron auth (generate: openssl rand -hex 32)
```
```

- [ ] **Step 11.4: Commit**

```bash
git add vercel.json app/settings/notifications/ emails/README.md
git commit -m "feat: vercel cron config, notifications stub page, email README"
```

---

## Task 12: Final TypeScript check, build verification, branch push

- [ ] **Step 12.1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: zero errors (or only pre-existing errors unrelated to this feature).

- [ ] **Step 12.2: Next.js build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds. Address any errors before proceeding.

- [ ] **Step 12.3: Push to new branch**

```bash
git checkout -b feature/email-notifications
git push -u origin feature/email-notifications
```

Expected: branch pushed, GitHub URL returned.
```
