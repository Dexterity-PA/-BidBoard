import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { FROM_EMAIL, getResend } from "@/lib/email/client";

export function ownerAlertsEnabled() {
  return process.env.VERCEL_ENV === "production" && process.env.HEALTH_ALERTS_ENABLED === "true" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ANALYTICS_ADMIN_EMAIL || "");
}

/** One owner message per failure category per UTC day. No student data is included. */
export async function alertOwner(component: string, code: string, now = new Date()) {
  if (!ownerAlertsEnabled()) return;
  // Page reports are unauthenticated, so a single browser report must not trigger mail.
  if (component === "app" || component === "root") {
    const count = await db.execute(sql`SELECT count(*)::int AS count FROM operational_events
      WHERE component = ${component} AND code = ${code} AND created_at > now() - interval '15 minutes'`);
    if (Number(count.rows[0]?.count || 0) < 3) return;
  }
  const key = `health:${component}:${code}:${now.toISOString().slice(0, 10)}`;
  const claim = await db.execute(sql`INSERT INTO operational_alerts (key, component, code, status)
    VALUES (${key}, ${component}, ${code}, 'pending') ON CONFLICT (key) DO NOTHING RETURNING key`);
  if (!claim.rows.length) return;
  const label = component === "accounts" ? "Account syncing" : component === "email" ? "Email delivery" :
    component === "cron" ? "Scheduled jobs" : "Page rendering";
  let status = "failed";
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL, to: process.env.ANALYTICS_ADMIN_EMAIL!,
      subject: `Meritously: ${label.toLowerCase()} needs attention`,
      text: `${label} reported a failure on Meritously.\n\nCheck your private dashboard: https://meritously.com/admin/analytics\n\nThis alert contains no student details. Repeated failures in this category are grouped into one email per UTC day.`,
    }, { idempotencyKey: key });
    if (!error && typeof data?.id === "string" && data.id.trim()) status = "sent";
  } catch { /* The alert's own failure stays in the dashboard and cannot recursively send mail. */ }
  await db.execute(sql`UPDATE operational_alerts SET status = ${status} WHERE key = ${key}`);
}
