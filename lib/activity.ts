// lib/activity.ts
import { db } from "@/db";
import { activityLog, type ActivityType } from "@/db/schema";

export type { ActivityType };

/**
 * Logs a user action to the activity_log table.
 * - Non-blocking: failures are silently swallowed.
 * - Idempotent: same (userId, type, referenceId) within the same calendar day
 *   is a no-op (handled by DB unique index activity_log_dedup).
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  referenceId?: number
): Promise<void> {
  try {
    await db
      .insert(activityLog)
      .values({
        userId,
        actionType: type,
        referenceId: referenceId ?? null,
      })
      .onConflictDoNothing();
  } catch {
    // Intentionally swallowed — a logging failure must never break the caller.
  }
}
