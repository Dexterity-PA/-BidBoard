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
