import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeadlineItem } from "@/components/merit/DeadlineList";

const mocks = vi.hoisted(() => ({ applications: vi.fn(), capture: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId: "test-user" }) }));
vi.mock("@/app/actions/tracker", () => ({ getApplications: mocks.applications }));
vi.mock("@/components/merit/DeadlineList", () => ({ default: ({ items }: { items: DeadlineItem[] }) => { mocks.capture(items); return null; } }));
vi.mock("@/lib/merit/catalog", () => ({
  LISTINGS: [{ slug: "active-award", deadlineDate: "2027-01-15" }, { slug: "single-award", deadlineDate: "2027-01-15" }, { slug: "unknown-award", deadlineDate: null }],
  datedSteps: (listing: { slug: string; deadlineDate: string | null }) => listing.deadlineDate && listing.slug !== "single-award" ? [{ iso: listing.deadlineDate, label: "Official application deadline" }] : [],
}));

import DeadlinesPage from "@/app/deadlines/page";

const row = {
  id: 1, status: "saved", scholarshipIsActive: true, scholarshipSource: "merit-ledger",
  scholarshipSlug: "active-award", scholarshipName: "Active award", scholarshipProvider: "Provider",
  scholarshipId: 10, deadline: "2027-01-15",
};

beforeEach(() => vi.resetAllMocks());

async function itemsFor(rows: object[]): Promise<DeadlineItem[]> {
  mocks.applications.mockResolvedValue(rows);
  renderToStaticMarkup(await DeadlinesPage());
  return mocks.capture.mock.calls[0][0];
}

describe("saved scholarship calendar", () => {
  it("keeps a single official date visible with no saved target or a different custom target", async () => {
    const items = await itemsFor([{ ...row, scholarshipSlug: "single-award", deadline: null }]);
    expect(items.map(({ iso, label }) => ({ iso, label }))).toEqual([
      { iso: "2027-01-15", label: "Catalog deadline" },
    ]);
    mocks.capture.mockClear();
    const custom = await itemsFor([{ ...row, scholarshipSlug: "single-award", deadline: "2027-01-10" }]);
    expect(custom.map(({ iso, label }) => ({ iso, label }))).toEqual([
      { iso: "2027-01-10", label: "Saved target" },
      { iso: "2027-01-15", label: "Catalog deadline" },
    ]);
  });

  it("shows an edited target alongside official dates without duplicating an unchanged target", async () => {
    expect(await itemsFor([row])).toHaveLength(1);
    mocks.capture.mockClear();
    const items = await itemsFor([{ ...row, deadline: "2027-01-10" }]);
    expect(items.map(({ iso, label }) => ({ iso, label }))).toEqual([
      { iso: "2027-01-10", label: "Saved target" },
      { iso: "2027-01-15", label: "Official application deadline" },
    ]);
  });

  it("labels a retained target when the official deadline becomes unknown", async () => {
    const [item] = await itemsFor([{ ...row, scholarshipSlug: "unknown-award" }]);
    expect(item.label).toBe("Saved target");
    expect(item.iso).toBe(row.deadline);
  });

  it("leaves retired, missing catalog, and finished awards out while keeping other active awards", async () => {
    const items = await itemsFor([
      { ...row, scholarshipIsActive: false },
      { ...row, id: 2, scholarshipSlug: "retired-award" },
      { ...row, id: 3, status: "submitted" },
      { ...row, id: 4, scholarshipSource: "other", scholarshipId: 14, scholarshipName: "Other active award" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: "Other active award", label: "Deadline", href: "/scholarship/14" });
  });
});
