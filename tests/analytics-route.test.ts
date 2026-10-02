import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), currentUser: vi.fn(), enabled: vi.fn(), allowed: vi.fn(), page: vi.fn(), conversion: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { execute: vi.fn() } }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth, currentUser: mocks.currentUser }));
vi.mock("@/lib/analytics/server", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/analytics/server")>(),
  analyticsEnabled: mocks.enabled, allowAnalyticsRequest: mocks.allowed,
  recordPageView: mocks.page, recordConversion: mocks.conversion,
}));

import { DELETE, POST } from "@/app/api/analytics/visit/route";
import { ANALYTICS_COOKIE } from "@/lib/analytics/shared";

const origin = "https://meritously.com";
const now = new Date("2026-09-28T18:00:00Z");
const attribution = {
  browser: "11111111-1111-4111-8111-111111111111",
  session: "22222222-2222-4222-8222-222222222222",
  source: "school", campaign: "fall-2026", referrer: "google.com",
};
const body = { ...attribution, path: "/scholarships" };

function request(value: unknown = body, headers: Record<string, string | undefined> = {}) {
  const requestHeaders = new Headers({ origin, "content-type": "application/json" });
  for (const [name, value] of Object.entries(headers)) if (value !== undefined) requestHeaders.set(name, value);
  return new NextRequest(`${origin}/api/analytics/visit`, {
    method: "POST",
    headers: requestHeaders,
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(now);
  mocks.enabled.mockReturnValue(true);
  mocks.allowed.mockResolvedValue(true);
  mocks.auth.mockResolvedValue({ userId: null });
  mocks.page.mockResolvedValue(undefined);
  mocks.conversion.mockResolvedValue(undefined);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("public analytics endpoint boundaries", () => {
  it.each([
    { origin: "https://other.example" },
    { origin: "null" },
    { "sec-fetch-site": "cross-site" },
  ])("rejects cross-origin measurement before persistence: %j", async (headers) => {
    expect((await POST(request(body, headers))).status).toBe(403);
    expect(mocks.allowed).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });

  it.each([
    { dnt: "1" },
    { "sec-gpc": "1" },
    { cookie: "m_analytics_off=1" },
    { "user-agent": "Googlebot" },
  ])("skips opted-out or automated traffic: %j", async (headers) => {
    const response = await POST(request(body, headers));
    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mocks.allowed).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });

  it("stays inert when analytics is disabled", async () => {
    mocks.enabled.mockReturnValue(false);
    expect((await POST(request())).status).toBe(204);
    expect(mocks.allowed).not.toHaveBeenCalled();
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it.each([
    { value: "{", headers: {} },
    { value: body, headers: { "content-type": "text/plain" } },
    { value: { ...body, path: "/newsletter/confirm?token=private-code" }, headers: {} },
    { value: { ...body, path: "/scholarships?email=private@example.test" }, headers: {} },
    { value: { ...body, browser: "private@example.test" }, headers: {} },
    { value: { ...body, padding: "x".repeat(2048) }, headers: {} },
    { value: body, headers: { "content-length": "4096" } },
  ])("does not persist invalid or oversized input: %j", async ({ value, headers }) => {
    const response = await POST(request(value, headers));
    expect([204, 400]).toContain(response.status);
    expect(mocks.allowed).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });

  it("forwards only sanitized attribution and public aggregate paths", async () => {
    const response = await POST(request({
      ...body, path: "/scholarships/example-award", source: "private@example.test", campaign: "token_private",
      referrer: "https://google.com/search?token=private-code&email=private@example.test",
      email: "private@example.test", token: "private-code", ip: "192.0.2.10", kind: "signup",
    }, { "x-vercel-forwarded-for": "192.0.2.1, 192.0.2.2", "x-forwarded-for": "192.0.2.3" }));
    expect(response.status).toBe(204);
    expect(mocks.allowed).toHaveBeenCalledWith("192.0.2.1");
    expect(mocks.page).toHaveBeenCalledExactlyOnceWith({
      ...attribution, source: null, campaign: null,
    }, "/scholarships/[award]");
    expect(mocks.conversion).not.toHaveBeenCalled();
    const cookie = response.cookies.get(ANALYTICS_COOKIE);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(decodeURIComponent(cookie!.value)).not.toContain("private");
    expect(decodeURIComponent(cookie!.value)).not.toContain("192.0.2");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("stops before event writes when the transient network quota is full", async () => {
    mocks.allowed.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(429);
    expect(mocks.page).not.toHaveBeenCalled();
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("does not expose persistence errors or set attribution after a failure", async () => {
    mocks.allowed.mockRejectedValue(new Error("private connection secret"));
    const response = await POST(request());
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mocks.page).not.toHaveBeenCalled();
  });

  it("derives signup conversion identity and creation time from Clerk", async () => {
    mocks.auth.mockResolvedValue({ userId: "authenticated-user" });
    const createdAt = now.getTime() - 60_000;
    mocks.currentUser.mockResolvedValue({ id: "authenticated-user", createdAt });
    await POST(request({ ...body, userId: "forged-user", createdAt: 0, kind: "newsletter" }));
    expect(mocks.conversion).toHaveBeenCalledExactlyOnceWith("signup", "authenticated-user", {
      attribution, createdAt: new Date(createdAt),
    });
  });

  it.each([
    { id: "different-user", createdAt: now.getTime() - 60_000 },
    { id: "authenticated-user", createdAt: now.getTime() - 25 * 60 * 60_000 },
    { id: "authenticated-user", createdAt: now.getTime() + 60_000 },
    { id: "authenticated-user", createdAt: "unknown" },
    null,
  ])("does not infer a recent signup from invalid Clerk state: %j", async (user) => {
    mocks.auth.mockResolvedValue({ userId: "authenticated-user" });
    mocks.currentUser.mockResolvedValue(user);
    expect((await POST(request())).status).toBe(204);
    expect(mocks.conversion).not.toHaveBeenCalled();
  });

  it("only clears attribution on a same-origin opt-out request", async () => {
    const denied = await DELETE(new NextRequest(`${origin}/api/analytics/visit`, {
      method: "DELETE", headers: { origin: "https://other.example" },
    }));
    expect(denied.status).toBe(403);
    const response = await DELETE(new NextRequest(`${origin}/api/analytics/visit`, {
      method: "DELETE", headers: { origin },
    }));
    expect(response.status).toBe(204);
    const expires = response.cookies.get(ANALYTICS_COOKIE)?.expires;
    expect(expires instanceof Date ? expires.getTime() : expires).toBe(0);
    expect(mocks.allowed).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });
});
