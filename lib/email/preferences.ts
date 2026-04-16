import { db } from "@/db";
import { userEmailPreferences } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { NotificationType } from "./client";

const COLUMN_MAP: Record<
  NotificationType,
  keyof Omit<typeof userEmailPreferences.$inferSelect, "userId" | "createdAt" | "updatedAt">
> = {
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
  // Lazy-create the prefs row — all columns default to true
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

  if (!prefs) return true; // fallback: allow send
  const col = COLUMN_MAP[type];
  return prefs[col] as boolean;
}
