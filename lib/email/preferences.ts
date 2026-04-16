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
