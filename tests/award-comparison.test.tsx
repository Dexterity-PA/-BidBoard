// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AwardComparisonProvider, AwardComparisonTray, CompareAwardButton } from "@/components/merit/AwardComparison";
import { COMPARISON_STORAGE_KEY, officialComparisonSource, parseComparisonIds } from "@/lib/merit/comparison";
import type { MeritListing } from "@/lib/merit/catalog";
import CatalogBrowser from "@/components/merit/CatalogBrowser";

const listings: MeritListing[] = ["Alpha", "Beta", "Gamma", "Delta"].map((name, index) => ({
  id: name, slug: name.toLowerCase(), name: `${name} Award`, provider: `${name} Foundation`,
  type: "scholarship", status: "live", value: index === 0 ? "$5,000 per year for four years" : "$1,000 one-time",
  deadline: index === 0 ? "Apply by November 15, 2026; nomination may be earlier" : "Next cycle has not been announced",
  deadlineDate: index === 0 ? "2026-11-15" : null,
  apply: "Submit an application and two recommendations.", eligibility: "High school seniors in Oregon.",
  notes: "", tags: ["separate-application", "recommendations"], sources: index === 0 ? ["https://example.org/alpha"] : [],
}));

function Comparison({ records = listings }: { records?: MeritListing[] }) {
  return <AwardComparisonProvider listings={records}>
    {records.map((listing) => <CompareAwardButton key={listing.id} listing={listing} />)}
    <AwardComparisonTray />
  </AwardComparisonProvider>;
}

beforeEach(() => {
  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    clear: () => storage.clear(),
  } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("award comparison", () => {
  it("enforces three selections and allows a replacement after removing one", async () => {
    const user = userEvent.setup();
    render(<Comparison />);
    for (const name of ["Alpha", "Beta", "Gamma"]) await user.click(screen.getByRole("button", { name: `Add ${name} Award to comparison` }));
    expect((screen.getByRole("button", { name: /Add Delta Award.*limit reached/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("3 of 3 selected. Remove an award to add another.")).toBeTruthy();
    const tray = screen.getByRole("list", { name: "Selected awards" });
    await user.click(within(tray).getByRole("button", { name: "Remove Beta Award from comparison" }));
    await user.click(screen.getByRole("button", { name: "Add Delta Award to comparison" }));
    expect(JSON.parse(window.localStorage.getItem(COMPARISON_STORAGE_KEY)!)).toEqual(["Alpha", "Gamma", "Delta"]);
  });

  it("shows the original award period, unknown dates, requirements and official sources", async () => {
    const user = userEvent.setup();
    render(<Comparison />);
    await user.click(screen.getByRole("button", { name: "Add Alpha Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "Add Beta Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "View comparison" }));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Your award comparison" }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("$5,000 per year for four years")).toBeTruthy();
    expect(within(table).getByText("Nov 15, 2026").getAttribute("datetime")).toBe("2026-11-15");
    expect(within(table).getByText("Exact date not confirmed")).toBeTruthy();
    expect(within(table).getAllByText("Recommendations")).toHaveLength(2);
    expect(within(table).getAllByText("A separate scholarship application")).toHaveLength(2);
    expect(within(table).getByRole("link", { name: /Visit provider for Alpha Award/ }).getAttribute("href")).toBe("https://example.org/alpha");
    expect(within(table).getByText("Official link not listed")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Close comparison" }));
    expect(screen.queryByRole("table")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "View comparison" }));
  });

  it("restores valid IDs only and keeps comparison usable when browser storage fails", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(["Alpha", "removed-award", "Alpha", 7, "Gamma"]));
    const firstRender = render(<Comparison />);
    expect(screen.getByText("2 of 3 selected.")).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(COMPARISON_STORAGE_KEY)!)).toEqual(["Alpha", "Gamma"]);
    firstRender.unmount();
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error("Unavailable"); });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("Unavailable"); });
    render(<Comparison />);
    await user.click(screen.getByRole("button", { name: "Add Beta Award to comparison" }));
    expect(screen.getByText("1 of 3 selected.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByText("Choose up to 3 awards to compare side by side.")).toBeTruthy();
  });

  it.each(["tray", "listing", "storage"] as const)("stays closed after the last selection is removed by %s", async (method) => {
    const user = userEvent.setup();
    render(<Comparison />);
    await user.click(screen.getByRole("button", { name: "Add Alpha Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "View comparison" }));
    if (method === "tray") {
      await user.click(within(screen.getByRole("list", { name: "Selected awards" })).getByRole("button", { name: "Remove Alpha Award from comparison" }));
    } else if (method === "listing") {
      const button = screen.getAllByRole("button", { name: "Remove Alpha Award from comparison" }).find((item) => item.hasAttribute("aria-pressed"))!;
      await user.click(button);
    } else {
      act(() => { window.dispatchEvent(new StorageEvent("storage", { key: COMPARISON_STORAGE_KEY, newValue: "[]" })); });
      expect(document.activeElement).toBe(screen.getByRole("group", { name: "Comparison selections" }));
    }
    expect(screen.queryByRole("table")).toBeNull();
    const addButton = screen.getByRole("button", { name: "Add Beta Award to comparison" });
    await user.click(addButton);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: "View comparison" }).getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(addButton);
  });

  it("does not lose selected awards when the visible catalog rows change", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AwardComparisonProvider listings={listings}>
      <CompareAwardButton listing={listings[0]} /><AwardComparisonTray />
    </AwardComparisonProvider>);
    await user.click(screen.getByRole("button", { name: "Add Alpha Award to comparison" }));
    rerender(<AwardComparisonProvider listings={listings}>
      <CompareAwardButton listing={listings[1]} /><AwardComparisonTray />
    </AwardComparisonProvider>);
    expect(within(screen.getByRole("list", { name: "Selected awards" })).getByText("Alpha Award")).toBeTruthy();
  });

  it("retains in-memory selections across catalog updates when storage is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error("Unavailable"); });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("Unavailable"); });
    const { rerender } = render(<Comparison />);
    await user.click(screen.getByRole("button", { name: "Add Alpha Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "Add Beta Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "View comparison" }));

    rerender(<Comparison records={listings.map((listing) => ({ ...listing }))} />);
    expect(screen.getByText("2 of 3 selected.")).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();

    // Retired catalog records are removed without losing the remaining selection.
    rerender(<Comparison records={listings.slice(1)} />);
    expect(screen.getByText("1 of 3 selected.")).toBeTruthy();
    expect(within(screen.getByRole("table")).queryByRole("link", { name: "Alpha Award" })).toBeNull();
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Beta Award" })).toBeTruthy();
  });

  it("ignores comparison preferences written to another storage area", async () => {
    const user = userEvent.setup();
    render(<Comparison />);
    await user.click(screen.getByRole("button", { name: "Add Alpha Award to comparison" }));
    const event = new StorageEvent("storage", { key: COMPARISON_STORAGE_KEY, newValue: '["Beta"]' });
    Object.defineProperty(event, "storageArea", { value: { ...window.localStorage } });
    act(() => { window.dispatchEvent(event); });
    const selected = screen.getByRole("list", { name: "Selected awards" });
    expect(within(selected).getByText("Alpha Award")).toBeTruthy();
    expect(within(selected).queryByText("Beta Award")).toBeNull();
  });
});

describe("comparison in the catalog", () => {
  it("keeps comparison controls outside listing links and retains selections through search", async () => {
    const user = userEvent.setup();
    render(<CatalogBrowser listings={listings} initial={{}} />);
    const compare = screen.getByRole("button", { name: "Add Beta Award to comparison" });
    expect(compare.closest("a")).toBeNull();
    await user.click(compare);
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "Gamma");
    expect(screen.queryByRole("link", { name: /Beta Foundation Beta Award/ })).toBeNull();
    expect(within(screen.getByRole("list", { name: "Selected awards" })).getByText("Beta Award")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Add Gamma Award to comparison" }));
    await user.click(screen.getByRole("button", { name: "View comparison" }));
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Beta Award" })).toBeTruthy();
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Gamma Award" })).toBeTruthy();
  });
});

describe("comparison preference validation", () => {
  const valid = new Set(listings.map(({ id }) => id));
  it("recovers malformed data and bounds a saved selection", () => {
    for (const raw of [null, "broken", "{}", '"Alpha"', "null"]) expect(parseComparisonIds(raw, valid)).toEqual([]);
    expect(parseComparisonIds('["Delta","Alpha","Beta","Gamma"]', valid)).toEqual(["Delta", "Alpha", "Beta"]);
  });
  it("never links unsafe or malformed source URLs", () => {
    expect(officialComparisonSource(["javascript:alert(1)", "not a URL", "https://example.org"])).toBe("https://example.org");
    expect(officialComparisonSource(["data:text/html,test", "/relative"])).toBeNull();
  });
});
