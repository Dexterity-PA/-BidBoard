// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CatalogBrowser from "@/components/merit/CatalogBrowser";
import { getVerification, type MeritListing } from "@/lib/merit/catalog";

vi.mock("@/lib/merit/catalog", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/merit/catalog")>(),
  getVerification: vi.fn(),
}));
vi.mock("@/lib/merit/match", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/merit/match")>(),
  loadProfile: () => null,
}));

afterEach(cleanup);

describe("internal catalog source reviews", () => {
  it("keeps review states internal without public badges or filters", () => {
    const records: MeritListing[] = ["current", "partial", "stale", "unknown"].map((id) => ({
      id, slug: id, name: `${id} scholarship`, provider: "Example Foundation", type: "scholarship",
      status: id === "unknown" ? "watchlist" : "live", value: "$1,000", deadline: "Not published", deadlineDate: null,
      apply: "Apply online", eligibility: "High school students", notes: "", tags: [], sources: ["https://example.org"],
    }));
    vi.mocked(getVerification).mockImplementation(({ id }) => id === "unknown" ? null : ({
      outcome: id === "partial" ? "partial" : "verified",
      checkedAt: id === "stale" ? "2020-01-01" : new Date().toISOString().slice(0, 10),
      sourceUrls: ["https://example.org"], notes: "Source checked.",
    }));
    render(<CatalogBrowser listings={records} initial={{}} />);
    expect(screen.getByText("4 listings")).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: /Unconfirmed listings/ })).toBeNull();
    for (const id of ["current", "partial", "stale", "unknown"]) {
      expect(screen.getByRole("link", { name: new RegExp(`${id} scholarship`) })).toBeTruthy();
    }
    expect(screen.queryByText(/Fully verified|Partially verified|Not verified|Recheck needed/)).toBeNull();
    expect(screen.queryByText(/^(Listed|Unconfirmed)$/)).toBeNull();
    expect(records[3].status).toBe("watchlist");
    expect(getVerification(records[1])?.outcome).toBe("partial");
  });
});
