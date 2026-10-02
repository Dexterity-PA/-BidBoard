// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { readFile, writeFile } from "node:fs/promises";
const mocks = vi.hoisted(() => ({ report: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: "owner" }),
  currentUser: async () => ({
    id: "owner",
    emailAddresses: [
      {
        emailAddress: "owner@example.test",
        verification: { status: "verified" },
      },
    ],
  }),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("Not found");
  },
}));
vi.mock("@/lib/analytics/report", () => ({ analyticsReport: mocks.report }));
vi.mock("@/lib/health/server", () => ({ healthSnapshot: async () => null }));
vi.mock("@/lib/analytics/server", () => ({ analyticsEnabled: () => true }));
import AnalyticsPage from "@/app/admin/analytics/page";
import styles from "@/app/admin/analytics/page.module.css";
const visits = [4, 6, 20, 28, 35, 39, 53, 62],
  views = [5, 6, 23, 31, 40, 55, 61, 78],
  newBrowsers = [4, 6, 19, 26, 32, 30, 40, 48];
const totals = {
  visits: 247,
  page_views: 299,
  browsers: 230,
  new_browsers: 205,
  returning_browsers: 45,
  multi_page_visits: 35,
  converted_visits: 5,
  geo_visits: 175,
  signups: 6,
  saves: 12,
  newsletter: 3,
};
const daily = visits.map((value, i) => ({
  date: new Date(Date.UTC(2026, 8, 25 + i)).toISOString().slice(0, 10),
  visits: value,
  page_views: views[i],
  new_browsers: newBrowsers[i],
  signups: i === 7 ? 6 : 0,
  saves: i === 7 ? 12 : 0,
  newsletter: i === 7 ? 3 : 0,
}));
const report = {
  totals,
  previous: {
    ...totals,
    visits: 120,
    page_views: 150,
    browsers: 115,
    new_browsers: 110,
  },
  comparable: true,
  daily,
  quality: {
    internal_visits: 2,
    scanner_referrals: 1,
    first_event: "2026-09-01T00:00:00Z",
    last_event: "2026-10-02T12:00:00Z",
    first_dimensions: "2026-10-02T10:00:00Z",
  },
  generatedAt: "2026-10-02T12:00:00Z",
  countries: [
    { country: "US", region: null, visits: 150 },
    { country: "CA", region: null, visits: 25 },
    { country: null, region: null, visits: 72 },
  ],
  regions: [
    { country: "US", region: "AZ", visits: 85 },
    { country: "US", region: "CA", visits: 40 },
    { country: "US", region: "NY", visits: 25 },
    { country: "CA", region: "ON", visits: 25 },
    { country: null, region: null, visits: 72 },
  ],
  sources: [
    {
      source: "Direct / unknown",
      campaign: "",
      visits: 120,
      signups: 2,
      saves: 4,
      newsletter: 1,
    },
    {
      source: "school-newsletter",
      campaign: "fall-2026",
      visits: 100,
      signups: 4,
      saves: 8,
      newsletter: 2,
    },
    {
      source: "www.google.com",
      campaign: "",
      visits: 27,
      signups: 0,
      saves: 0,
      newsletter: 0,
    },
  ],
  pages: [
    { path: "/", views: 210, visits: 210 },
    { path: "/scholarships", views: 67, visits: 67 },
    { path: "/scholarships/[award]", views: 22, visits: 22 },
  ],
  landingPages: [
    { label: "/", visits: 200 },
    { label: "/scholarships", visits: 42 },
    { label: "/scholarships/[award]", visits: 5 },
  ],
  devices: [
    { label: "Mobile", visits: 145 },
    { label: "Desktop", visits: 95 },
    { label: "Tablet", visits: 7 },
  ],
  browsers: [
    { label: "Safari", visits: 140 },
    { label: "Chrome", visits: 80 },
    { label: "Edge", visits: 20 },
    { label: "Firefox", visits: 7 },
  ],
  operatingSystems: [
    { label: "iOS", visits: 140 },
    { label: "Windows", visits: 75 },
    { label: "macOS", visits: 20 },
    { label: "Android", visits: 12 },
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    visits: [
      1, 0, 0, 0, 0, 0, 2, 4, 8, 18, 24, 28, 33, 39, 26, 22, 15, 10, 8, 4, 2, 1,
      1, 1,
    ][i],
  })),
};
afterEach(() => vi.unstubAllEnvs());
describe("analytics dashboard presentation", () => {
  it("hydrates the complete dashboard without replacing its server HTML", async () => {
    vi.stubEnv("ANALYTICS_ADMIN_EMAIL", "owner@example.test");
    mocks.report.mockResolvedValue(report);
    const element = await AnalyticsPage({ searchParams: Promise.resolve({ days: "7" }) });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(error) });
    });
    await act(async () => root.unmount());
    container.remove();
    expect(errors).toEqual([]);
  });
  it("renders chart controls, regional coverage and the selected private export", async () => {
    vi.stubEnv("ANALYTICS_ADMIN_EMAIL", "owner@example.test");
    mocks.report.mockResolvedValue(report);
    const html = renderToStaticMarkup(
      await AnalyticsPage({ searchParams: Promise.resolve({ days: "7" }) }),
    );
    expect(mocks.report).toHaveBeenCalledWith(7, false);
    expect(html).toContain("Browser growth");
    expect(html).toContain("Arizona, United States");
    expect(html).toContain("Export CSV");
    expect(html).toContain("2 internal test visits excluded");
    expect(html).toContain("chart date");
    expect(html).not.toContain("browser_hash");
    if (process.env.ANALYTICS_PREVIEW_PATH) {
      const css = (
        await readFile(
          new URL("../app/admin/analytics/page.module.css", import.meta.url),
          "utf8",
        )
      ).replace(/\.([A-Za-z][A-Za-z0-9]*)/g, (match, key) =>
        styles[key] ? `.${styles[key]}` : match,
      );
      await writeFile(
        process.env.ANALYTICS_PREVIEW_PATH,
        `<!doctype html><html><head><title>Analytics layout preview</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#f7faf8;font-family:Arial,sans-serif}*{box-sizing:border-box}${css}</style></head><body><p style="text-align:center;font-size:12px;color:#61736d">Layout preview with synthetic data</p>${html}</body></html>`,
      );
    }
  });
});
