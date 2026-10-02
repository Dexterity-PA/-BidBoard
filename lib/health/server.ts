import "server-only";
import { alertOwner, ownerAlertsEnabled } from "./alerts";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { healthQuery, healthReport, type HealthReport, type JobRun } from "./report";

export async function recordOperationalIssue(component: "accounts" | "email" | "app" | "root" | "cron", code: string) {
  try {
    await db.execute(sql`INSERT INTO operational_events (id, component, code) VALUES (${randomUUID()}, ${component}, ${code})`);
    await alertOwner(component, code);
  } catch { console.warn("[health] Could not record an operational issue."); }
}

async function monitorWrite(query: ReturnType<typeof sql>) {
  try { await db.execute(query); }
  catch { console.warn("[health] Scheduled job monitoring unavailable."); }
}

export async function observeJob<T extends { failed?: number }>(job: string, work: () => Promise<T>): Promise<T> {
  const id = randomUUID();
  await monitorWrite(sql`INSERT INTO scheduled_job_runs (id, job, status) VALUES (${id}, ${job}, 'running')`);
  try {
    const result = await work();
    const failed = result.failed || 0;
    await monitorWrite(sql`UPDATE scheduled_job_runs SET status = ${failed ? "failed" : "success"}, failed = ${failed}, finished_at = now() WHERE id = ${id}`);
    if (failed) await recordOperationalIssue("cron", `${job}_failed`);
    return result;
  } catch (error) {
    await monitorWrite(sql`UPDATE scheduled_job_runs SET status = 'failed', failed = 1, finished_at = now() WHERE id = ${id}`);
    await recordOperationalIssue("cron", `${job}_failed`);
    throw error;
  }
}

export async function healthSnapshot(): Promise<HealthReport | null> {
  try {
    const result = await db.execute(healthQuery());
    const row = result.rows[0];
    if (!row?.configured_at) return null;
    return { ...healthReport(String(row.configured_at), row.issues as HealthReport["issues"], row.runs as JobRun[]),
      ownerEmailAlerts: ownerAlertsEnabled(), alerts: row.alerts as NonNullable<HealthReport["alerts"]> };
  } catch { return null; }
}

export async function cleanHealthRetention() {
  await monitorWrite(sql`DELETE FROM operational_alerts WHERE created_at < now() - interval '30 days'`);
  await monitorWrite(sql`DELETE FROM operational_events WHERE created_at < now() - interval '30 days'`);
  await monitorWrite(sql`DELETE FROM scheduled_job_runs WHERE started_at < now() - interval '30 days'`);
}

export async function checkScheduledHealth() {
  const snapshot = await healthSnapshot();
  if (!snapshot) { await recordOperationalIssue("cron", "monitor_unavailable"); return { failed: 1 }; }
  const unhealthy = snapshot.jobs.filter((job) => job.status === "late" || job.status === "failed");
  for (const job of unhealthy) await recordOperationalIssue("cron", `${job.name}_${job.status === "late" ? "overdue" : "failed"}`);
  return { failed: unhealthy.length };
}
