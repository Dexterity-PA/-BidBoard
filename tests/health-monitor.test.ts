import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
const mock = vi.hoisted(() => ({ execute: vi.fn(), send: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { execute: mock.execute } }));
vi.mock("@/lib/email/client", () => ({ FROM_EMAIL: "notifications@meritously.com", getResend: () => ({ emails: { send: mock.send } }) }));
import { alertOwner } from "@/lib/health/alerts";
import { recordOperationalIssue, observeJob, healthSnapshot, checkScheduledHealth, cleanHealthRetention } from "@/lib/health/server";
import { healthReport } from "@/lib/health/report";

const database = new PGlite();
const dialect = new PgDialect();
beforeAll(async () => {
  await database.exec(await readFile(new URL("../scripts/migrations/2026-10-02-account-health.sql", import.meta.url), "utf8"));
}, 20_000);
beforeEach(async () => {
  vi.resetAllMocks();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("HEALTH_ALERTS_ENABLED", "true");
  vi.stubEnv("ANALYTICS_ADMIN_EMAIL", "owner@example.test");
  mock.execute.mockImplementation(async (statement) => {
    const query = dialect.sqlToQuery(statement);
    return database.query(query.sql, query.params);
  });
  mock.send.mockResolvedValue({ data: { id: "provider-message" }, error: null });
  await database.exec("TRUNCATE operational_alerts, operational_events, scheduled_job_runs; UPDATE health_monitor_config SET started_at = now() WHERE id = 1");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
afterAll(() => database.close());

describe("private health monitoring and owner alerts", () => {
  it("keeps failures visible and claims only one owner message for concurrent repeated failures", async () => {
    await Promise.all([recordOperationalIssue("accounts", "sync_failed"), recordOperationalIssue("accounts", "sync_failed")]);
    expect(mock.send).toHaveBeenCalledTimes(1);
    const [message, options] = mock.send.mock.calls[0];
    expect(message.to).toBe("owner@example.test");
    expect(message.text).toContain("https://meritously.com/admin/analytics");
    expect(options.idempotencyKey).toMatch(/^health:accounts:sync_failed:\d{4}-\d{2}-\d{2}$/);
    expect((await healthSnapshot())?.issues[0].count).toBe(2);
    expect((await healthSnapshot())?.alerts).toEqual([{ component: "accounts", status: "sent", count: 1 }]);
  });
  it("keeps preview environments quiet while recording dashboard failures", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    await recordOperationalIssue("accounts", "sync_failed");
    expect(mock.send).not.toHaveBeenCalled();
    expect((await healthSnapshot())?.issues).toHaveLength(1);
    expect((await healthSnapshot())?.ownerEmailAlerts).toBe(false);
  });
  it("requires multiple page errors before email and never stores page or student details", async () => {
    await recordOperationalIssue("app", "render_failed");
    await recordOperationalIssue("app", "render_failed");
    expect(mock.send).not.toHaveBeenCalled();
    await recordOperationalIssue("app", "render_failed");
    expect(mock.send).toHaveBeenCalledTimes(1);
    const rows = (await database.query("SELECT * FROM operational_events")).rows;
    expect(Object.keys(rows[0] as object).sort()).toEqual(["code", "component", "created_at", "id"]);
  });
  it.each([{ data: null, error: { message: "Private provider failure" } }, { data: {}, error: null }])("records failed alert delivery without recursive emails or false success", async (response) => {
    mock.send.mockResolvedValue(response);
    await recordOperationalIssue("email", "provider_failed");
    await recordOperationalIssue("email", "provider_failed");
    expect(mock.send).toHaveBeenCalledTimes(1);
    expect((await healthSnapshot())?.alerts).toEqual([{ component: "email", status: "failed", count: 1 }]);
  });
  it("uses a new durable claim the next UTC day", async () => {
    await alertOwner("accounts", "sync_failed", new Date("2026-10-02T23:59:00Z"));
    await alertOwner("accounts", "sync_failed", new Date("2026-10-03T00:01:00Z"));
    expect(mock.send).toHaveBeenCalledTimes(2);
    expect(mock.send.mock.calls[0][1]).not.toEqual(mock.send.mock.calls[1][1]);
  });
  it("records partial failures and throws job errors so the scheduler can retry", async () => {
    await expect(observeJob("deadline-reminders", async () => ({ sent: 2, failed: 1 }))).resolves.toEqual({ sent: 2, failed: 1 });
    await expect(observeJob("weekly-digest", async () => { throw new Error("Private error"); })).rejects.toThrow("Private error");
    expect((await database.query("SELECT job, status, failed FROM scheduled_job_runs ORDER BY job")).rows).toEqual([
      { job: "deadline-reminders", status: "failed", failed: 1 }, { job: "weekly-digest", status: "failed", failed: 1 },
    ]);
    expect(mock.send).toHaveBeenCalledTimes(2);
  });
  it("detects missing scheduled runs and sends owner alerts without sending student mail", async () => {
    const checkTime = new Date(); checkTime.setUTCHours(17, 0, 0, 0);
    vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(checkTime);
    await database.exec("UPDATE health_monitor_config SET started_at = now() - interval '3 days'");
    await expect(checkScheduledHealth()).resolves.toEqual({ failed: 2 });
    expect(mock.send).toHaveBeenCalledTimes(2);
    expect(mock.send.mock.calls.every(([message]) => message.to === "owner@example.test")).toBe(true);
  });
  it("expires health events, job runs and alert history after 30 days", async () => {
    await recordOperationalIssue("accounts", "sync_failed");
    await observeJob("weekly-digest", async () => ({ failed: 0 }));
    await database.exec("UPDATE operational_events SET created_at = now() - interval '31 days'; UPDATE operational_alerts SET created_at = now() - interval '31 days'; UPDATE scheduled_job_runs SET started_at = now() - interval '31 days'");
    await cleanHealthRetention();
    expect((await healthSnapshot())?.issues).toEqual([]);
    expect((await healthSnapshot())?.alerts).toEqual([]);
    expect((await database.query("SELECT count(*)::int AS count FROM scheduled_job_runs")).rows).toEqual([{ count: 0 }]);
  });
});

describe("scheduled health timing", () => {
  it("does not report pre-installation missed jobs as failures", () => {
    const report = healthReport("2026-10-02T16:00:00Z", [], [], new Date("2026-10-02T20:00:00Z"));
    expect(report.jobs.map((job) => job.status)).toEqual(["waiting", "waiting"]);
  });
  it("waits 90 minutes before declaring a run overdue", () => {
    expect(healthReport("2026-10-01T12:00:00Z", [], [], new Date("2026-10-02T15:00:00Z")).jobs.map((job) => job.status)).toEqual(["waiting", "waiting"]);
    expect(healthReport("2026-10-01T12:00:00Z", [], [], new Date("2026-10-02T17:00:00Z")).jobs.map((job) => job.status)).toEqual(["late", "late"]);
  });
  it("distinguishes completed and stalled scheduled runs", () => {
    const report = healthReport("2026-10-01T12:00:00Z", [], [
      { job: "deadline-reminders", started_at: "2026-10-02T14:00:00Z", finished_at: "2026-10-02T14:01:00Z", status: "success", failed: 0 },
      { job: "weekly-digest", started_at: "2026-10-02T15:00:00Z", finished_at: null, status: "running", failed: 0 },
    ], new Date("2026-10-02T17:00:00Z"));
    expect(report.jobs.map((job) => job.status)).toEqual(["healthy", "failed"]);
  });
});
