// @vitest-environment jsdom
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ verification: vi.fn(), listing: vi.fn() }));
vi.mock("@/lib/merit/catalog", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/merit/catalog")>(),
  getVerification: mocks.verification, getDetailListing: mocks.listing,
}));
vi.mock("@/app/actions/merit", () => ({ isMeritSaved: async () => false }));
vi.mock("@/components/merit/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/components/merit/SaveMeritButton", () => ({ default: () => null }));
vi.mock("@/components/merit/MatchNote", () => ({ default: () => null }));
vi.mock("@clerk/nextjs", () => ({ SignedIn: () => null, SignedOut: ({ children }: { children: ReactNode }) => children }));

import ListingPage from "@/app/scholarships/[slug]/page";
import { LISTINGS } from "@/lib/merit/catalog";

const listing = LISTINGS.find((item) => item.id === "P025")!;
const evidence = {
  checkedAt: "2026-10-18", sourceUrls: listing.sources, outcome: "partial",
  checks: { deadline: "supported" }, notes: "Deadline checked; other details remain unconfirmed.",
};
async function renderPage() {
  return render(await ListingPage({ params: Promise.resolve({ slug: listing.slug }) }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-18T12:00:00Z"));
  mocks.listing.mockReturnValue({ ...listing, deadlineDate: "2026-11-12" });
  mocks.verification.mockReturnValue(evidence);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("scholarship planning integration", () => {
  it("offers a calendar download for a current individually confirmed deadline and places its guide before related awards", async () => {
    const { container } = await renderPage();
    expect((screen.getByRole("button", { name: "Add deadline to calendar" }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByRole("heading", { name: "Application guide" })).toBeTruthy();
    const guide = container.querySelector('[aria-labelledby="application-guide-P025"]')!;
    const related = container.querySelector('[aria-labelledby="related-title"]')!;
    expect(guide.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("#eligibility")?.textContent).toContain(listing.eligibility);
  });

  it.each([
    ["stale", { ...evidence, checkedAt: "2026-07-01" }],
    ["unconfirmed", { ...evidence, checks: { deadline: "unconfirmed" } }],
    ["not applicable", { ...evidence, checks: { deadline: "not_applicable" } }],
    ["unavailable", { ...evidence, outcome: "unavailable" }],
    ["retired evidence", { ...evidence, outcome: "retired" }],
    ["legacy review without field confirmation", { ...evidence, checks: undefined }],
    ["missing review", null],
  ])("does not enable the calendar affordance for %s", async (_label, verification) => {
    mocks.verification.mockReturnValue(verification);
    await renderPage();
    expect((screen.getByRole("button", { name: "Add deadline to calendar" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("blocks past and absent deadlines even when a review supports the deadline field", async () => {
    mocks.listing.mockReturnValue({ ...listing, deadlineDate: "2026-10-17" });
    const result = await renderPage();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/This deadline has passed/)).toBeTruthy();
    result.unmount();
    mocks.listing.mockReturnValue({ ...listing, deadlineDate: null });
    await renderPage();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/No confirmed deadline/)).toBeTruthy();
  });

  it("omits preparation and calendar actions entirely for retired listings", async () => {
    mocks.listing.mockReturnValue({ ...listing, status: "excluded" });
    await renderPage();
    expect(screen.queryByRole("button", { name: "Add deadline to calendar" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Application guide" })).toBeNull();
  });
});
