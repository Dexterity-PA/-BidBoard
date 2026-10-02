import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { analyticsPath, campaignLabel, cleanAttribution, parseAttributionCookie, referringHostname } from "@/lib/analytics/shared";

const mock = vi.hoisted(() => ({ execute: vi.fn(), cookies: vi.fn(), headers: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { execute: mock.execute } }));
vi.mock("next/headers", () => ({ cookies: mock.cookies, headers: mock.headers }));

import { allowAnalyticsRequest, analyticsHash, cleanAnalyticsRetention, recordConversion, recordPageView } from "@/lib/analytics/server";

const attribution = {
  browser: "11111111-1111-4111-8111-111111111111", session: "22222222-2222-4222-8222-222222222222",
  source: null, campaign: null, referrer: null,
};
const dialect = new PgDialect();
const query = (index = 0) => dialect.sqlToQuery(mock.execute.mock.calls[index][0]);

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ANALYTICS_ENABLED", "true");
  vi.stubEnv("ANALYTICS_SECRET", "synthetic-analytics-test-secret");
  mock.execute.mockResolvedValue({ rows: [{ key: "claimed" }] });
  mock.cookies.mockResolvedValue({ get: (name: string) => name === "m_analytics" ? { value: encodeURIComponent(JSON.stringify(attribution)) } : undefined });
  mock.headers.mockResolvedValue(new Headers());
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("analytics data minimization", () => {
  it.each(["/settings", "/tracker", "/essays/private", "/newsletter/confirm", "/sign-in", "/admin/analytics", "/?token=secret", "/scholarships/test?email=a@b.com"])("does not measure sensitive or query-bearing path %s", (path) => {
    expect(analyticsPath(path)).toBeNull();
  });
  it("groups award detail paths without retaining slugs", () => {
    expect(analyticsPath("/scholarships/example-award")).toBe("/scholarships/[award]");
    expect(analyticsPath("/scholarships")).toBe("/scholarships");
  });
  it.each(["a@example.com", "https://example.com/a", "secret-code", "a".repeat(64), "hello world", "a".repeat(49)])("rejects unsafe source labels: %s", (value) => {
    expect(campaignLabel(value)).toBeNull();
  });
  it("keeps only bounded campaign labels and referring hostname", () => {
    expect(campaignLabel("School-Fall_2026")).toBe("school-fall_2026");
    expect(referringHostname("https://www.google.com/search?q=private&token=secret")).toBe("www.google.com");
    expect(referringHostname("https://meritously.com/scholarships?token=secret")).toBeNull();
    expect(referringHostname("https://www.bidboard.app/scholarships?token=secret")).toBeNull();
    expect(referringHostname("https://192.0.2.1/private")).toBeNull();
    expect(referringHostname("https://name:secret@example.com/")).toBeNull();
    expect(cleanAttribution({ ...attribution, email: "student@example.com", ip: "192.0.2.1", token: "secret", source: "School" })).toEqual({ ...attribution, source: "school" });
  });
  it("rejects malformed IDs and cookies without retaining other fields", () => {
    expect(cleanAttribution({ ...attribution, browser: "student@example.com" })).toBeNull();
    expect(parseAttributionCookie("malformed%")).toBeNull();
    expect(parseAttributionCookie("x".repeat(1201))).toBeNull();
    expect(parseAttributionCookie(encodeURIComponent(JSON.stringify(attribution)))).toEqual(attribution);
  });
});

describe("durable analytics writes", () => {
  it("hashes identifiers with separate purposes and deduplicates the same view on reload", async () => {
    await recordPageView(attribution, "/scholarships");
    await recordPageView(attribution, "/scholarships");
    expect(query().params.slice(0, 4)).toEqual(query(1).params.slice(0, 4));
    expect(query().sql).toContain("ON CONFLICT (id) DO UPDATE");
    expect(query().params).not.toContain(attribution.browser);
    expect(query().params).not.toContain(attribution.session);
    expect(analyticsHash("browser", "same")).not.toBe(analyticsHash("session", "same"));
  });
  it("freezes the entire captured source, including direct, when a conversion is retried", async () => {
    await recordConversion("signup", "synthetic-clerk-id", { attribution });
    await recordConversion("signup", "synthetic-clerk-id", { attribution: { ...attribution, source: "later-campaign", campaign: "fall" } });
    expect(query().params[0]).toBe(query(1).params[0]);
    for (const column of ["session_hash", "source", "campaign", "referrer"]) {
      expect(query().sql).toContain(`${column} = CASE WHEN analytics_events.browser_hash IS NULL THEN EXCLUDED.${column} ELSE analytics_events.${column} END`);
    }
    expect(query().params).not.toContain("synthetic-clerk-id");
    expect(query().sql).not.toContain("created_at =");
  });
  it("records opted-out operational totals without a browser or source", async () => {
    mock.headers.mockResolvedValue(new Headers({ dnt: "1" }));
    await recordConversion("save", "synthetic-user:12");
    expect(query().params.slice(2, 8)).toEqual([null, null, null, null, null, null]);
  });
  it("never propagates analytics database failures to the product", async () => {
    mock.execute.mockRejectedValue(new Error("sensitive database information"));
    await expect(recordConversion("save", "user:12")).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith("[analytics] Measurement unavailable.");
  });
  it("bounds latency while a measurement database request is stalled", async () => {
    vi.useFakeTimers();
    mock.execute.mockImplementation(() => new Promise(() => {}));
    const writing = recordConversion("save", "user:12", { attribution: null });
    await vi.advanceTimersByTimeAsync(1500);
    await expect(writing).resolves.toBeUndefined();
  });
  it("enforces a durable network rate limit without persisting raw addresses", async () => {
    expect(await allowAnalyticsRequest("192.0.2.55", new Date("2026-09-28T10:00:00Z"))).toBe(true);
    expect(query().sql).toContain("WHERE analytics_rate_limits.count < 120 RETURNING key");
    expect(query().params).not.toContain("192.0.2.55");
    mock.execute.mockResolvedValue({ rows: [] });
    expect(await allowAnalyticsRequest("192.0.2.55")).toBe(false);
  });
  it("continues retention cleanup when measurement and secrets are disabled", async () => {
    vi.stubEnv("ANALYTICS_ENABLED", "false");
    vi.stubEnv("ANALYTICS_SECRET", "");
    vi.stubEnv("CRON_SECRET", "");
    await recordConversion("save", "user:12");
    expect(mock.execute).not.toHaveBeenCalled();
    await cleanAnalyticsRetention();
    expect(mock.execute).toHaveBeenCalledTimes(2);
    expect(query().sql).toContain("interval '90 days'");
    expect(query(1).sql).toContain("expires_at < now()");
  });
});
