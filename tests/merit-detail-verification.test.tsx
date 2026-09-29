import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verification: vi.fn() }));
vi.mock("@/lib/merit/catalog", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/merit/catalog")>(), getVerification: mocks.verification,
}));
vi.mock("@/app/actions/merit", () => ({ isMeritSaved: async () => false }));
vi.mock("@/components/merit/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/merit/SaveMeritButton", () => ({ default: () => null }));
vi.mock("@/components/merit/MatchNote", () => ({ default: () => null }));
vi.mock("@clerk/nextjs", () => ({ SignedIn: () => null, SignedOut: ({ children }: { children: ReactNode }) => children }));

import ListingPage from "@/app/scholarships/[slug]/page";
import { LISTINGS } from "@/lib/merit/catalog";

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-29T00:00:00Z"));
});
afterEach(() => vi.useRealTimers());

async function renderPage() {
  return renderToStaticMarkup(await ListingPage({ params: Promise.resolve({ slug: LISTINGS[0].slug }) }));
}

describe("scholarship verification copy", () => {
  it("labels inaccessible official information as an attempt and shows what remains unknown", async () => {
    mocks.verification.mockReturnValue({ checkedAt: "2026-09-29", sourceUrls: [], outcome: "unavailable", notes: "The official page could not be read.", unresolved: ["The 2027 deadline remains unconfirmed."] });
    const html = await renderPage();
    expect(html).toContain("Official information unavailable");
    expect(html).toContain("Review attempted Sep 29, 2026.");
    expect(html).toContain("The 2027 deadline remains unconfirmed.");
    expect(html).not.toContain("Last checked");
  });

  it("clearly identifies an unknown individual date without repeating the old blanket date", async () => {
    mocks.verification.mockReturnValue(null);
    const html = await renderPage();
    expect(html).toContain("An individual check date has not been recorded for this listing.");
    expect(html).not.toContain("Sep 24, 2026");
    expect(html).not.toContain("Last checked");
  });

  it("shows the actual check date and the limited scope of a partial check", async () => {
    mocks.verification.mockReturnValue({ checkedAt: "2026-09-29", sourceUrls: LISTINGS[0].sources, notes: "Deadline confirmed; renewal requirements still need checking." });
    const html = await renderPage();
    expect(html).toContain("Last checked Sep 29, 2026.");
    expect(html).toContain("Deadline confirmed; renewal requirements still need checking.");
    expect(html).not.toContain("at least 90 days ago");
  });

  it("warns about a stale check beside the apply action", async () => {
    mocks.verification.mockReturnValue({ checkedAt: "2026-07-01", sourceUrls: LISTINGS[0].sources, notes: "Official award terms checked." });
    const html = await renderPage();
    expect(html).toContain("Last checked Jul 1, 2026.");
    expect(html).toContain("This listing was checked at least 90 days ago.");
    expect(html.indexOf("at least 90 days ago")).toBeLessThan(html.indexOf("Open official page"));
  });
});
