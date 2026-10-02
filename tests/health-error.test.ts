import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mock = vi.hoisted(() => ({ record: vi.fn(), limit: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/health/server", () => ({ recordOperationalIssue: mock.record }));
vi.mock("@/lib/analytics/server", () => ({
  allowAnalyticsRequest: mock.limit,
  trackingDeclined: (headers: Headers, optout: string) => headers.get("dnt") === "1" || headers.get("sec-gpc") === "1" || optout === "1",
}));
import { POST } from "@/app/api/health/error/route";
function request(body: unknown = { component: "app" }, headers: Record<string, string> = {}) {
  return new NextRequest("https://meritously.com/api/health/error", { method: "POST", headers: {
    origin: "https://meritously.com", "sec-fetch-site": "same-origin", "content-type": "application/json", ...headers,
  }, body: JSON.stringify(body) });
}
beforeEach(() => { vi.resetAllMocks(); mock.limit.mockResolvedValue(true); });
afterEach(() => vi.unstubAllEnvs());
it("rejects cross-origin reports before writes", async () => {
  expect((await POST(request(undefined, { origin: "https://external.test" }))).status).toBe(403);
  expect(mock.record).not.toHaveBeenCalled();
});
it.each<Record<string, string>>([{ dnt: "1" }, { "sec-gpc": "1" }, { cookie: "m_analytics_off=1" }])("honors privacy settings before rate limit or storage", async (headers) => {
  expect((await POST(request(undefined, headers))).status).toBe(204);
  expect(mock.record).not.toHaveBeenCalled(); expect(mock.limit).not.toHaveBeenCalled();
});
it("accepts only a coarse failure category and rejects personal or oversized payloads", async () => {
  expect((await POST(request({ component: "app", email: "private@example.test" }))).status).toBe(400);
  expect((await POST(request({ component: "x".repeat(1000) }))).status).toBe(400);
  expect((await POST(request({ component: "root" }))).status).toBe(204);
  expect(mock.record).toHaveBeenCalledExactlyOnceWith("root", "render_failed");
});
it("limits reporting without storing any submitted address in the issue", async () => {
  mock.limit.mockResolvedValue(false);
  expect((await POST(request())) .status).toBe(429);
  expect(mock.limit).toHaveBeenCalledWith("unknown", expect.any(Date), 5, "page-errors");
  expect(mock.record).not.toHaveBeenCalled();
});
