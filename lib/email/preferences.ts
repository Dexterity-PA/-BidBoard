// lib/email/preferences.ts
import { db } from "@/db";
import { studentProfiles, userEmailPreferences } from "@/db/schema";
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

type LegacyPrefs = Partial<NonNullable<typeof studentProfiles.$inferSelect.notificationPreferences>>;
const DEADLINE_DAYS = [1, 3, 7, 14] as const;
const LEGACY_DAY_KEYS = { 1: "deadlines_1d", 3: "deadlines_3d", 7: "deadlines_7d" } as const;

async function readPrefs(userId: string) {
  await ensurePrefsRow(userId);
  const [[row], [profile]] = await Promise.all([
    db.select().from(userEmailPreferences).where(eq(userEmailPreferences.userId, userId)).limit(1),
    db.select({ notificationPreferences: studentProfiles.notificationPreferences })
      .from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1),
  ]);
  const legacy: LegacyPrefs = profile?.notificationPreferences ?? {};
  const allLegacyDaysOff = Object.values(LEGACY_DAY_KEYS).every((key) => legacy[key] === false);
  const prefs: UserEmailPrefs = {
    welcome: row?.welcome ?? true,
    deadlineReminders: (row?.deadlineReminders ?? false) && !allLegacyDaysOff,
    newMatches: row?.newMatches ?? false,
    statusChanges: row?.statusChanges ?? true,
    weeklyDigest: (row?.weeklyDigest ?? false) && legacy.weekly_digest !== false,
    paymentEvents: row?.paymentEvents ?? true,
    updatedAt: row?.updatedAt ?? null,
  };
  return { prefs, legacy };
}

async function ensurePrefsRow(userId: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO user_email_preferences (user_id, deadline_reminders, new_matches, weekly_digest)
    VALUES (${userId}, false, false, false)
    ON CONFLICT (user_id) DO NOTHING
  `);
}

/** Fetch (or lazy-create) all 6 preference booleans + updatedAt for display. */
export async function getUserPrefs(userId: string): Promise<UserEmailPrefs> {
  return (await readPrefs(userId)).prefs;
}

/** Returns true if the user has this notification type enabled. */
export async function canSend(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const prefs = await getUserPrefs(userId);
  return prefs[COLUMN_MAP[type]] === true;
}

/** Keep legacy per-day opt-outs until reminders are explicitly re-enabled. */
export async function getDeadlineReminderDays(userId: string): Promise<readonly number[]> {
  const { prefs, legacy } = await readPrefs(userId);
  if (!prefs.deadlineReminders) return [];
  return DEADLINE_DAYS.filter((day) => day === 14 || legacy[LEGACY_DAY_KEYS[day]] !== false);
}

function legacyPatch(type: NotificationType, value: boolean): LegacyPrefs {
  if (type === "weekly_digest") return { weekly_digest: value };
  if (type === "deadline_reminders") {
    return { deadlines_1d: value, deadlines_3d: value, deadlines_7d: value };
  }
  return {};
}

function syncLegacyPrefs(userId: string, patch: LegacyPrefs) {
  return db.update(studentProfiles).set({
    // Merge only the corresponding choices; preserve unrelated legacy settings.
    notificationPreferences: sql`coalesce(${studentProfiles.notificationPreferences}, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb`,
    updatedAt: new Date(),
  }).where(eq(studentProfiles.userId, userId));
}

/** Update one preference column and stamp updated_at. */
export async function savePref(
  userId: string,
  type: NotificationType,
  value: boolean
): Promise<void> {
  if (!Object.hasOwn(COLUMN_MAP, type) || typeof value !== "boolean") {
    throw new Error("Invalid email preference");
  }
  await ensurePrefsRow(userId);
  const update = db
    .update(userEmailPreferences)
    .set({ [COLUMN_MAP[type]]: value, updatedAt: new Date() })
    .where(eq(userEmailPreferences.userId, userId));
  const patch = legacyPatch(type, value);
  if (Object.keys(patch).length) {
    // neon-http supports atomic batch transactions, not interactive transactions.
    await db.batch([update, syncLegacyPrefs(userId, patch)]);
  } else {
    await update;
  }
}

/** Set all 6 columns to the same value. Used by Unsubscribe all. */
export async function setAllPrefs(
  userId: string,
  value: boolean
): Promise<void> {
  await ensurePrefsRow(userId);
  const update = db
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
  await db.batch([update, syncLegacyPrefs(userId, {
    ...legacyPatch("deadline_reminders", value),
    ...legacyPatch("weekly_digest", value),
    product_updates: value,
  })]);
}
