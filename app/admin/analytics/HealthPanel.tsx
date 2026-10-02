import type { HealthReport } from "@/lib/health/report";
import styles from "./page.module.css";

const statuses = { waiting: "Waiting for first scheduled run", healthy: "Last run completed", running: "Running", failed: "Needs attention: run failed or stalled", late: "Needs attention: scheduled run is overdue" };
const format = (value: string) => new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC";
export default function HealthPanel({ health }: { health: HealthReport | null }) {
  return <section className={styles.panel}>
    <h2>App health</h2>
    <p>Account sync, reported page errors and scheduled email jobs.</p>
    {!health ? <p>Health checks are temporarily unavailable.</p> : <>
      <dl className={styles.conversions}>
        {health.jobs.map((job) => <div key={job.name}>
          <dt>{job.label}</dt><dd style={{fontSize:15}}>{statuses[job.status]}</dd>
          {job.lastRun && <small>{format(job.lastRun)}</small>}
        </div>)}
      </dl>
      <p>Owner email alerts: {health.ownerEmailAlerts ? "enabled" : "not configured"}. Repeated failures are grouped into one message per category per UTC day.</p>
      {health.alerts?.map((alert) => <p key={`${alert.component}:${alert.status}`}>
        {alert.count} owner alert{alert.count === 1 ? "" : "s"}: {alert.status === "sent" ? "accepted by email provider" : alert.status === "failed" ? "email delivery failed, check mail configuration" : "delivery pending"}.
      </p>)}
      <h3>Issues reported in the last 24 hours</h3>
      {health.issues.length ? <ul role="status">{health.issues.map((issue) => <li key={`${issue.component}:${issue.code}`}>
        {issue.component === "accounts" ? "Account sync" : issue.component === "email" ? "Email delivery" : issue.component === "cron" ? "Scheduled emails" : "Page rendering"}: {issue.count} issue{issue.count === 1 ? "" : "s"}. Latest {format(issue.last_at)}.
      </li>)}</ul> : <p>No issues recorded in the last 24 hours.</p>}
      <p className={styles.caption}>Monitoring started {format(health.configuredAt)}. Earlier failures are not backfilled. Page reports can be incomplete when privacy settings or blockers prevent reporting. Monitoring history is retained for 30 days.</p>
    </>}
  </section>;
}
