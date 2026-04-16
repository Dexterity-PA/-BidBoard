# Email Notification Preferences UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/settings/notifications` stub page with a working 6-toggle preference UI, wire the `canSend` guard into all 6 email sender functions, and expose `getUserPrefs`/`savePref`/`setAllPrefs` helpers for the UI layer.

**Architecture:** The DB table (`user_email_preferences`) and all 6 sender modules already exist on main. This plan (a) extends `lib/email/preferences.ts` with new helpers, (b) adds the opt-out guard to each sender in one atomic commit, and (c) builds the page + server actions. Three tasks, two commits.

**Tech Stack:** Next.js 14 App Router (RSC + `"use client"`), Drizzle ORM (Neon Postgres), Clerk auth, Tailwind CSS, TypeScript.

---

## File Map

| File | Action |
|---|---|
| `lib/email/preferences.ts` | Edit — rename `checkPreference` → `canSend`, add `UserEmailPrefs` type, add `getUserPrefs`, `savePref`, `setAllPrefs` |
| `lib/email/send/welcome.ts` | Edit — add `canSend` guard (1 line) |
| `lib/email/send/status-change.ts` | Edit — add `canSend` guard (1 line) |
| `lib/email/send/payment.ts` | Edit — add `canSend` guard after user lookup |
| `lib/email/send/deadline-reminder.ts` | Edit — add `canSend` guard inside per-user loop |
| `lib/email/send/new-matches.ts` | Edit — add `canSend` guard inside per-user loop |
| `lib/email/send/weekly-digest.ts` | Edit — add `canSend` guard inside per-user loop |
| `app/settings/notifications/actions.ts` | Create — `saveEmailPref` + `unsubscribeAll` server actions |
| `app/settings/notifications/page.tsx` | Replace stub — server component (fetches prefs, renders form) |
| `app/settings/notifications/_components/EmailPrefsForm.tsx` | Create — `"use client"` toggle form |

---

## Task 1: Update `lib/email/preferences.ts` and wire guards in all 6 senders

> **These changes land in one atomic commit.** `canSend` must exist in `preferences.ts` before the sender files reference it.

**Files:**
- Modify: `lib/email/preferences.ts`
- Modify: `lib/email/send/welcome.ts`
- Modify: `lib/email/send/status-change.ts`
- Modify: `lib/email/send/payment.ts`
- Modify: `lib/email/send/deadline-reminder.ts`
- Modify: `lib/email/send/new-matches.ts`
- Modify: `lib/email/send/weekly-digest.ts`

- [ ] **Step 1: Replace `lib/email/preferences.ts` with the complete updated file**

```ts
// lib/email/preferences.ts
import { db } from "@/db";
import { userEmailPreferences } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { NotificationType } from "./client";

export type UserEmailPrefs = {
  welcome:           boolean;
  deadlineReminders: boolean;
  newMatches:        boolean;
  statusChanges:     boolean;
  weeklyDigest:      boolean;
  paymentEvents:     boolean;
  updatedAt:         Date | null;
};

type PrefKey = keyof Omit<
  typeof userEmailPreferences.$inferSelect,
  "userId" | "createdAt" | "updatedAt"
>;

const COLUMN_MAP: Record<NotificationType, PrefKey> = {
  welcome:            "welcome",
  deadline_reminders: "deadlineReminders",
  new_matches:        "newMatches",
  status_changes:     "statusChanges",
  weekly_digest:      "weeklyDigest",
  payment_events:     "paymentEvents",
};

async function ensurePrefsRow(userId: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO user_email_preferences (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `);
}

/** Fetch (or lazy-create) all 6 preference booleans + updatedAt for display. */
export async function getUserPrefs(userId: string): Promise<UserEmailPrefs> {
  await ensurePrefsRow(userId);
  const [row] = await db
    .select()
    .from(userEmailPreferences)
    .where(eq(userEmailPreferences.userId, userId))
    .limit(1);
  return {
    welcome:           row?.welcome           ?? true,
    deadlineReminders: row?.deadlineReminders ?? true,
    newMatches:        row?.newMatches        ?? true,
    statusChanges:     row?.statusChanges     ?? true,
    weeklyDigest:      row?.weeklyDigest      ?? true,
    paymentEvents:     row?.paymentEvents     ?? true,
    updatedAt:         row?.updatedAt         ?? null,
  };
}

/** Returns true if the user has this notification type enabled. */
export async function canSend(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  await ensurePrefsRow(userId);
  const [row] = await db
    .select()
    .from(userEmailPreferences)
    .where(eq(userEmailPreferences.userId, userId))
    .limit(1);
  if (!row) return true; // fallback: allow send
  return row[COLUMN_MAP[type]] as boolean;
}

/** Update one preference column and stamp updated_at. */
export async function savePref(
  userId: string,
  type: NotificationType,
  value: boolean
): Promise<void> {
  await ensurePrefsRow(userId);
  await db
    .update(userEmailPreferences)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set({ [COLUMN_MAP[type]]: value, updatedAt: new Date() } as any)
    .where(eq(userEmailPreferences.userId, userId));
}

/** Set all 6 columns to the same value. Used by Unsubscribe all. */
export async function setAllPrefs(
  userId: string,
  value: boolean
): Promise<void> {
  await ensurePrefsRow(userId);
  await db
    .update(userEmailPreferences)
    .set({
      welcome:           value,
      deadlineReminders: value,
      newMatches:        value,
      statusChanges:     value,
      weeklyDigest:      value,
      paymentEvents:     value,
      updatedAt:         new Date(),
    })
    .where(eq(userEmailPreferences.userId, userId));
}
```

- [ ] **Step 2: Add guard to `lib/email/send/welcome.ts`**

Add one import and one early-return line. The function takes `params.userId`:

```ts
// lib/email/send/welcome.ts
import * as React from "react";
import { WelcomeEmail } from "@/emails/welcome";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";       // ← add

export async function sendWelcomeEmail(params: {
  userId: string;
  email: string;
  firstName?: string | null;
}): Promise<void> {
  if (!await canSend(params.userId, "welcome")) return;   // ← add
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

- [ ] **Step 3: Add guard to `lib/email/send/status-change.ts`**

`userId` is destructured at the top of the function. Guard goes before the DB query:

```ts
// at the top of sendStatusChangeEmail, after destructuring:
const { userId, applicationId, newStatus } = params;

if (!await canSend(userId, "status_changes")) return;   // ← add

const [row] = await db
  .select({ ... })
  ...
```

Add `import { canSend } from "../preferences";` with the other imports.

- [ ] **Step 4: Add guard to `lib/email/send/payment.ts`**

`payment.ts` looks up the user by `stripeCustomerId` first. The guard goes *after* the user lookup so we have `user.id`:

```ts
// after the user lookup block:
if (!user) {
  console.warn(`[email/payment] No user found for stripeCustomerId: ${stripeCustomerId}`);
  return;
}

if (!await canSend(user.id, "payment_events")) return;   // ← add

await sendEmail({ ... });
```

Add `import { canSend } from "../preferences";` with the other imports.

- [ ] **Step 5: Add guard to `lib/email/send/deadline-reminder.ts`**

This function loops over users after grouping. The guard goes at the top of the `for (const [userId, reminders] of byUser)` loop, before the dedupe check:

```ts
for (const [userId, reminders] of byUser) {
  // Check user preference before any work
  if (!await canSend(userId, "deadline_reminders")) {   // ← add
    skipped++;                                           // ← add
    continue;                                            // ← add
  }                                                      // ← add

  // Filter out already-sent dedupe records
  const notSent: PendingReminder[] = [];
  ...
```

Add `import { canSend } from "../preferences";` with the other imports.

- [ ] **Step 6: Add guard to `lib/email/send/new-matches.ts`**

Guard goes inside the `for (const { userId, email, profile } of profileRows)` loop, right after the `if (!userId) continue;` guard:

```ts
for (const { userId, email, profile } of profileRows) {
  if (!userId) continue;

  if (!await canSend(userId, "new_matches")) {   // ← add
    skipped++;                                    // ← add
    continue;                                     // ← add
  }                                               // ← add

  // Already sent today?
  const [existing] = await db
  ...
```

Add `import { canSend } from "../preferences";` with the other imports.

- [ ] **Step 7: Add guard to `lib/email/send/weekly-digest.ts`**

Same pattern as new-matches — inside the per-user loop, after the `if (!userId) continue;` check:

```ts
for (const { userId, email } of profileRows) {
  if (!userId) continue;

  if (!await canSend(userId, "weekly_digest")) {   // ← add
    skipped++;                                       // ← add
    continue;                                        // ← add
  }                                                  // ← add

  // Already sent this week?
  const [existing] = await db
  ...
```

Add `import { canSend } from "../preferences";` with the other imports.

- [ ] **Step 8: TypeScript check**

```bash
cd /Users/main/PycharmProjects/Bidboard && npx tsc --noEmit
```

Expected: zero errors. If you see `TS2345` on the `.set(... as any)` line in `savePref`, that's the eslint comment suppressing it — the type cast is intentional.

- [ ] **Step 9: Commit**

```bash
git add lib/email/preferences.ts \
        lib/email/send/welcome.ts \
        lib/email/send/status-change.ts \
        lib/email/send/payment.ts \
        lib/email/send/deadline-reminder.ts \
        lib/email/send/new-matches.ts \
        lib/email/send/weekly-digest.ts
git commit -m "$(cat <<'EOF'
feat(email): rename checkPreference → canSend, add getUserPrefs/savePref/setAllPrefs, wire guards in all 6 senders

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create `app/settings/notifications/actions.ts`

**Files:**
- Create: `app/settings/notifications/actions.ts`

- [ ] **Step 1: Create the file**

```ts
// app/settings/notifications/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { savePref, setAllPrefs } from "@/lib/email/preferences";
import type { NotificationType } from "@/lib/email/client";

async function getVerifiedUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/** Auto-save a single preference toggle. Called on every flip. */
export async function saveEmailPref(
  type: NotificationType,
  value: boolean
): Promise<void> {
  const userId = await getVerifiedUserId();
  await savePref(userId, type, value);
  revalidatePath("/settings/notifications");
}

/** Set all 6 preferences to false. Called by Unsubscribe all. */
export async function unsubscribeAll(): Promise<void> {
  const userId = await getVerifiedUserId();
  await setAllPrefs(userId, false);
  revalidatePath("/settings/notifications");
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/main/PycharmProjects/Bidboard && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/settings/notifications/actions.ts
git commit -m "$(cat <<'EOF'
feat(settings): email notification preference server actions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Build the notifications page

**Files:**
- Modify: `app/settings/notifications/page.tsx` (replace stub)
- Create: `app/settings/notifications/_components/EmailPrefsForm.tsx`

- [ ] **Step 1: Create `app/settings/notifications/_components/EmailPrefsForm.tsx`**

```tsx
// app/settings/notifications/_components/EmailPrefsForm.tsx
"use client";

import { useState, useTransition } from "react";
import type { UserEmailPrefs } from "@/lib/email/preferences";
import type { NotificationType } from "@/lib/email/client";
import { saveEmailPref, unsubscribeAll } from "../actions";

type BoolPrefs = Omit<UserEmailPrefs, "updatedAt">;

const PREF_KEY_MAP: Record<NotificationType, keyof BoolPrefs> = {
  welcome:            "welcome",
  deadline_reminders: "deadlineReminders",
  new_matches:        "newMatches",
  status_changes:     "statusChanges",
  weekly_digest:      "weeklyDigest",
  payment_events:     "paymentEvents",
};

const PREF_ROWS: { type: NotificationType; label: string; description: string }[] = [
  {
    type: "welcome",
    label: "Welcome email",
    description: "Sent when you first join BidBoard.",
  },
  {
    type: "deadline_reminders",
    label: "Deadline reminders",
    description: "Alerts before scholarships you're tracking close.",
  },
  {
    type: "new_matches",
    label: "New matches",
    description: "When BidBoard finds new scholarships matching your profile.",
  },
  {
    type: "status_changes",
    label: "Status changes",
    description: "Updates when your application status changes.",
  },
  {
    type: "weekly_digest",
    label: "Weekly digest",
    description: "A Sunday summary of your top matches and deadlines.",
  },
  {
    type: "payment_events",
    label: "Payment events",
    description: "Receipts and billing alerts. Recommended to leave on.",
  },
];

export function EmailPrefsForm({ prefs: initialPrefs }: { prefs: UserEmailPrefs }) {
  const [prefs, setPrefs] = useState<BoolPrefs>({
    welcome:           initialPrefs.welcome,
    deadlineReminders: initialPrefs.deadlineReminders,
    newMatches:        initialPrefs.newMatches,
    statusChanges:     initialPrefs.statusChanges,
    weeklyDigest:      initialPrefs.weeklyDigest,
    paymentEvents:     initialPrefs.paymentEvents,
  });
  const [errors, setErrors] = useState<Partial<Record<NotificationType, string>>>({});
  const [unsubError, setUnsubError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(type: NotificationType) {
    const key = PREF_KEY_MAP[type];
    const newValue = !prefs[key];
    // Optimistic update
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    startTransition(async () => {
      try {
        await saveEmailPref(type, newValue);
        setErrors((prev) => ({ ...prev, [type]: undefined }));
      } catch {
        // Revert on failure
        setPrefs((prev) => ({ ...prev, [key]: !newValue }));
        setErrors((prev) => ({ ...prev, [type]: "Failed to save. Try again." }));
      }
    });
  }

  function handleUnsubscribeAll() {
    if (!window.confirm("Turn off all email notifications?")) return;
    setUnsubError(null);
    startTransition(async () => {
      try {
        await unsubscribeAll();
        setPrefs({
          welcome:           false,
          deadlineReminders: false,
          newMatches:        false,
          statusChanges:     false,
          weeklyDigest:      false,
          paymentEvents:     false,
        });
      } catch {
        setUnsubError("Failed to unsubscribe. Try again.");
      }
    });
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {PREF_ROWS.map(({ type, label, description }) => {
          const key = PREF_KEY_MAP[type];
          const checked = prefs[key];
          return (
            <div key={type} className="flex items-center justify-between px-4 py-4">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                {errors[type] && (
                  <p className="text-xs text-red-500 mt-1">{errors[type]}</p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => toggle(type)}
                disabled={isPending}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 ${
                  checked ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleUnsubscribeAll}
          disabled={isPending}
          className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          Unsubscribe from all emails
        </button>
        {unsubError && (
          <p className="text-xs text-red-500 mt-2 text-center">{unsubError}</p>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Replace `app/settings/notifications/page.tsx`**

The current file is a 12-line "coming soon" stub. Replace it entirely:

```tsx
// app/settings/notifications/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib/email/preferences";
import { EmailPrefsForm } from "./_components/EmailPrefsForm";

function formatUpdatedAt(date: Date | null): string {
  if (!date) return "Never";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function NotificationsSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const prefs = await getUserPrefs(userId);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Email Notifications
      </h1>
      <p className="text-sm text-gray-500 mb-1">
        Manage which emails BidBoard sends you.
      </p>
      <p className="text-xs text-gray-400 mb-8">
        Last updated: {formatUpdatedAt(prefs.updatedAt)}
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
        <EmailPrefsForm prefs={prefs} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/main/PycharmProjects/Bidboard && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Smoke-test in browser**

Start the dev server and navigate to `/settings/notifications`:

```bash
npm run dev
```

Verify:
1. Page loads with 6 toggles, all on by default for a new user.
2. Flipping a toggle saves immediately (no save button required).
3. Refreshing the page preserves the toggled state.
4. "Unsubscribe from all emails" flips all toggles off after confirm.
5. "Last updated" timestamp updates after first toggle (visible on next page refresh).
6. "← Settings" link returns to `/settings`.

- [ ] **Step 5: Commit**

```bash
git add app/settings/notifications/page.tsx \
        app/settings/notifications/_components/EmailPrefsForm.tsx
git commit -m "$(cat <<'EOF'
feat(settings): email notification preferences page with auto-save toggles

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
