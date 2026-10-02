import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), currentUser: vi.fn(), report: vi.fn(), notFound: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth, currentUser: mocks.currentUser }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/analytics/report", () => ({ analyticsReport: mocks.report }));
vi.mock("@/lib/analytics/server", () => ({ analyticsEnabled: () => true }));

import { isAnalyticsAdmin } from "@/lib/analytics/access";
import AnalyticsPage from "@/app/admin/analytics/page";

const ownerEmail = "owner@example.test";
const owner = { id: "owner-id", emailAddresses: [{ emailAddress: ownerEmail, verification: { status: "verified" } }] };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ANALYTICS_ADMIN_EMAIL", ownerEmail);
  mocks.auth.mockResolvedValue({ userId: "owner-id" });
  mocks.currentUser.mockResolvedValue(owner);
  mocks.notFound.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
  mocks.report.mockResolvedValue({ totals: {visits:0,browsers:0,page_views:0,new_browsers:0,returning_browsers:0,multi_page_visits:0,converted_visits:0,geo_visits:0,signups:0,saves:0,newsletter:0}, previous: {}, sources: [], daily: [], countries: [], regions: [], devices: [], browsers: [], operatingSystems: [], pages: [], landingPages: [], hourly: [], quality: {internal_visits:0,scanner_referrals:0,first_event:null,last_event:null,first_dimensions:null}, generatedAt:"2026-10-02T12:00:00Z", comparable:false });
});
afterEach(() => vi.unstubAllEnvs());

describe("owner analytics access", () => {
  it("accepts only a verified exact email match on the authenticated Clerk account", () => {
    expect(isAnalyticsAdmin(owner, ownerEmail, owner.id)).toBe(true);
    expect(isAnalyticsAdmin(owner, " OWNER@EXAMPLE.TEST ", owner.id)).toBe(true);
    expect(isAnalyticsAdmin({ ...owner, emailAddresses: [
      { emailAddress: "other@example.test", verification: { status: "verified" } },
      ...owner.emailAddresses,
    ] }, ownerEmail, owner.id)).toBe(true);
  });

  it.each([undefined, "", "   "])("denies an unconfigured owner: %j", (configured) => {
    expect(isAnalyticsAdmin(owner, configured, owner.id)).toBe(false);
  });

  it("denies absent or mismatched Clerk identities", () => {
    expect(isAnalyticsAdmin(null, ownerEmail, owner.id)).toBe(false);
    expect(isAnalyticsAdmin(owner, ownerEmail, null)).toBe(false);
    expect(isAnalyticsAdmin(owner, ownerEmail, "different-id")).toBe(false);
  });

  it.each([
    undefined, null, { status: "unverified" }, { status: "expired" }, { status: "failed" },
  ])("denies email addresses without current Clerk verification: %j", (verification) => {
    expect(isAnalyticsAdmin({ ...owner, emailAddresses: [{ emailAddress: ownerEmail, verification }] }, ownerEmail, owner.id)).toBe(false);
  });

  it.each([
    "owner+other@example.test", "o.wner@example.test", "owner@example.test.attacker.test",
    "another-owner@example.test", "owner@other.test",
  ])("does not treat similar email addresses as the configured owner: %s", (emailAddress) => {
    expect(isAnalyticsAdmin({ ...owner, emailAddresses: [{ emailAddress, verification: { status: "verified" } }] }, ownerEmail, owner.id)).toBe(false);
  });

  it("does not authorize an unverified match through a different verified address", () => {
    expect(isAnalyticsAdmin({ ...owner, emailAddresses: [
      { emailAddress: ownerEmail, verification: { status: "unverified" } },
      { emailAddress: "other@example.test", verification: { status: "verified" } },
    ] }, ownerEmail, owner.id)).toBe(false);
    expect(isAnalyticsAdmin({ id: owner.id }, ownerEmail, owner.id)).toBe(false);
  });

  it("stops anonymous requests before reading Clerk profile or analytics", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.currentUser).not.toHaveBeenCalled();
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it("loads the selected report for the verified owner", async () => {
    const page = await AnalyticsPage();
    expect(page).toBeTruthy();
    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(mocks.report).toHaveBeenCalledExactlyOnceWith(30, false);
  });

  it("stops unconfigured dashboards before reading analytics", async () => {
    vi.stubEnv("ANALYTICS_ADMIN_EMAIL", "");
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.currentUser).not.toHaveBeenCalled();
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { ...owner, id: "different-id" },
    { ...owner, emailAddresses: [{ emailAddress: ownerEmail, verification: { status: "unverified" } }] },
    { ...owner, emailAddresses: [{ emailAddress: "someone@example.test", verification: { status: "verified" } }] },
  ])("does not query analytics for an unauthorized Clerk profile: %j", async (user) => {
    mocks.currentUser.mockResolvedValue(user);
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.report).not.toHaveBeenCalled();
  });
});
