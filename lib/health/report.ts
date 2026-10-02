import { sql } from "drizzle-orm";

export type JobRun = { job: string; started_at: string; finished_at: string | null; status: string; failed: number };
export type HealthReport = {
  configuredAt: string;
  ownerEmailAlerts?: boolean;
  alerts?: { component: string; status: string; count: number }[];
  issues: { component: string; code: string; count: number; last_at: string }[];
  jobs: { name: string; label: string; status: "waiting" | "healthy" | "running" | "failed" | "late"; lastRun: string | null }[];
};
export function healthQuery() {
  return sql`SELECT
    COALESCE((SELECT jsonb_agg(q) FROM (
      SELECT component, status, count(*)::int AS count FROM operational_alerts
      WHERE created_at > now() - interval '24 hours' GROUP BY component, status
    ) q), '[]'::jsonb) AS alerts,
    (SELECT started_at FROM health_monitor_config WHERE id = 1) AS configured_at,
    COALESCE((SELECT jsonb_agg(q) FROM (
      SELECT component, code, count(*)::int AS count, max(created_at) AS last_at
      FROM operational_events WHERE created_at > now() - interval '24 hours'
      GROUP BY component, code ORDER BY max(created_at) DESC
    ) q), '[]'::jsonb) AS issues,
    COALESCE((SELECT jsonb_agg(q) FROM (
      SELECT DISTINCT ON (job) job, started_at, finished_at, status, failed
      FROM scheduled_job_runs ORDER BY job, started_at DESC
    ) q), '[]'::jsonb) AS runs`;
}
export function healthReport(configuredAt: string, issues: HealthReport["issues"], runs: JobRun[], now = new Date()): HealthReport {
  const schedules = [
    { name: "deadline-reminders", label: "Deadline reminders", hour: 14 },
    { name: "weekly-digest", label: "Scholarship digest", hour: 15 },
  ];
  return { configuredAt, issues, jobs: schedules.map(({ name, label, hour }) => {
    const due = new Date(now);
    due.setUTCHours(hour, 0, 0, 0);
    if (due > now) due.setUTCDate(due.getUTCDate() - 1);
    const run = runs.find((item) => item.job === name);
    const expected = due.getTime() > new Date(configuredAt).getTime();
    const late = expected && now.getTime() - due.getTime() > 90 * 60_000 &&
      (!run || new Date(run.started_at).getTime() < due.getTime());
    const status = late ? "late" : !run ? "waiting" : run.status === "failed" ||
      (run.status === "running" && now.getTime() - new Date(run.started_at).getTime() > 10 * 60_000)
      ? "failed" : run.status === "running" ? "running" : "healthy";
    return { name, label, status, lastRun: run?.started_at ?? null };
  }) };
}
