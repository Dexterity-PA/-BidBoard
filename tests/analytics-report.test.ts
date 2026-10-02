import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { execute: vi.fn() } }));
import {
  analyticsReportQuery,
  type AnalyticsReport,
} from "@/lib/analytics/report";
const database = new PGlite();
const now = new Date("2026-10-02T12:00:00Z");
let counter = 0;
beforeAll(async () => {
  await database.exec(
    await readFile(
      new URL(
        "../scripts/migrations/2026-09-28-analytics.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await database.exec(
    await readFile(
      new URL(
        "../scripts/migrations/2026-10-02-analytics-dimensions.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
}, 20_000);
afterAll(() => database.close());
beforeEach(async () => {
  await database.exec("TRUNCATE analytics_events");
  counter = 0;
});
async function event({
  kind = "page_view",
  browser = "a",
  session = "a1",
  path = "/",
  at = "2026-10-02T10:00:00Z",
  source = null,
  referrer = null,
  country = null,
  region = null,
  device = null,
}: {
  kind?: string;
  browser?: string | null;
  session?: string | null;
  path?: string | null;
  at?: string;
  source?: string | null;
  referrer?: string | null;
  country?: string | null;
  region?: string | null;
  device?: string | null;
} = {}) {
  await database.query(
    "INSERT INTO analytics_events(id,kind,browser_hash,session_hash,path,created_at,source,referrer,country,region,device) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
    [
      String(++counter),
      kind,
      browser,
      session,
      path,
      at,
      source,
      referrer,
      country,
      region,
      device,
    ],
  );
}
async function report(days: 7 | 30 | 90 = 7, internal = false) {
  const { query } = analyticsReportQuery(days, internal, now);
  const built = new PgDialect().sqlToQuery(query);
  const result = await database.query<{ report: AnalyticsReport }>(
    built.sql,
    built.params,
  );
  return result.rows[0].report;
}
describe("analytics reports against real Postgres", () => {
  it("zero-fills empty dates and hours without inventing history", async () => {
    const r = await report();
    expect(r.totals).toBeNull();
    expect(r.daily).toHaveLength(7);
    expect(r.hourly).toHaveLength(24);
    expect(r.daily.every((d) => d.visits === 0)).toBe(true);
    expect(r.comparable).toBe(false);
  });
  it("counts sessions and browsers separately and reconciles chart totals", async () => {
    await event();
    await event({ path: "/scholarships" });
    await event({ session: "a2", at: "2026-10-01T10:00:00Z" });
    await event({ browser: "b", session: "b1", at: "2026-09-30T10:00:00Z" });
    const r = await report();
    expect(r.totals).toMatchObject({
      page_views: 4,
      visits: 3,
      browsers: 2,
      new_browsers: 2,
      returning_browsers: 1,
      multi_page_visits: 1,
    });
    expect(r.daily.reduce((n, d) => n + d.visits, 0)).toBe(3);
    expect(r.daily.reduce((n, d) => n + d.page_views, 0)).toBe(4);
    expect(r.daily.reduce((n, d) => n + d.new_browsers, 0)).toBe(2);
  });
  it("excludes the entire internal session including unlabeled conversions", async () => {
    await event({ source: "internal-check" });
    await event({ kind: "save", path: null, source: null });
    await event({ browser: "b", session: "b1" });
    expect((await report()).totals).toMatchObject({ visits: 1, saves: 0 });
    expect((await report()).quality.internal_visits).toBe(1);
    expect((await report(7, true)).totals).toMatchObject({
      visits: 2,
      saves: 1,
      converted_visits: 1,
    });
  });
  it("keeps unknown geography explicit and counts one region per visit", async () => {
    await event({ country: "US", region: "AZ", device: "Mobile" });
    await event({
      country: "US",
      region: "AZ",
      device: "Mobile",
      path: "/scholarships",
    });
    await event({ browser: "b", session: "b1" });
    const r = await report();
    expect(r.countries).toContainEqual({
      country: "US",
      region: null,
      visits: 1,
    });
    expect(r.regions).toContainEqual({
      country: "US",
      region: "AZ",
      visits: 1,
    });
    expect(r.countries).toContainEqual({
      country: null,
      region: null,
      visits: 1,
    });
    expect(r.totals.geo_visits).toBe(1);
    expect(r.devices).toContainEqual({ label: "Unknown", visits: 1 });
  });
  it("only shows comparisons when the complete prior interval has retained evidence", async () => {
    await event({ at: "2026-09-19T00:00:00Z" });
    await event({ session: "a2", at: "2026-09-23T10:00:00Z" });
    await event({ session: "a3" });
    const r = await report();
    expect(r.comparable).toBe(true);
    expect(r.previous.visits).toBe(2);
    expect(r.totals.returning_browsers).toBe(1);
    expect(r.totals.new_browsers).toBe(0);
    expect((await report(90)).comparable).toBe(false);
  });
  it("keeps unattributed outcomes out of the visit conversion rate", async () => {
    await event();
    await event({ kind: "signup", path: null });
    await event({ kind: "save", path: null });
    await event({
      kind: "newsletter",
      session: null,
      browser: null,
      path: null,
    });
    const r = await report();
    expect(r.totals).toMatchObject({
      visits: 1,
      signups: 1,
      saves: 1,
      newsletter: 1,
      converted_visits: 1,
    });
    expect(r.sources).toContainEqual({
      source: "Unattributed",
      campaign: "",
      visits: 0,
      signups: 0,
      saves: 0,
      newsletter: 1,
    });
  });
  it("assigns a cross-midnight session to one day while keeping views on their dates", async () => {
    await event({ at: "2026-10-01T23:55:00Z" });
    await event({ path: "/scholarships", at: "2026-10-02T00:05:00Z" });
    const r = await report();
    expect(r.totals.visits).toBe(1);
    expect(r.daily.find((d) => d.date === "2026-10-01")?.visits).toBe(1);
    expect(r.daily.find((d) => d.date === "2026-10-02")?.visits).toBe(0);
    expect(r.daily.find((d) => d.date === "2026-10-02")?.page_views).toBe(1);
  });
  it("keeps session geography stable when historical metadata is missing", async () => {
    await event({ at: "2026-10-02T09:00:00Z" });
    await event({ path: "/scholarships", country: "US", region: "AZ" });
    const r = await report();
    expect(r.totals.geo_visits).toBe(0);
    expect(r.countries).toEqual([{ country: null, region: null, visits: 1 }]);
  });
  it("applies the dimension migration repeatedly without changing old records", async () => {
    await event();
    const migration = await readFile(
      new URL(
        "../scripts/migrations/2026-10-02-analytics-dimensions.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await database.exec(migration);
    await database.exec(migration);
    expect((await report()).totals.visits).toBe(1);
    expect((await report()).countries[0].country).toBeNull();
  });
  it("flags security referrals without declaring them bots", async () => {
    await event({ referrer: "security-us.m.mimecastprotect.com" });
    expect((await report()).quality.scanner_referrals).toBe(1);
    expect((await report()).totals.visits).toBe(1);
  });
});
