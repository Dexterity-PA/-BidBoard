// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("catalog source verification filter", () => {
  it("hides incomplete, old and missing reviews even when a program is classified Listed", () => {
    const records: MeritListing[] = ["current", "partial", "stale", "unknown"].map((id) => ({
      id, slug: id, name: `${id} scholarship`, provider: "Example Foundation", type: "scholarship",
      status: "live", value: "$1,000", deadline: "Not published", deadlineDate: null,
      apply: "Apply online", eligibility: "High school students", notes: "", tags: [], sources: ["https://example.org"],
    }));
    vi.mocked(getVerification).mockImplementation(({ id }) => id === "unknown" ? null : ({
      outcome: id === "partial" ? "partial" : "verified",
      checkedAt: id === "stale" ? "2020-01-01" : new Date().toISOString().slice(0, 10),
      sourceUrls: ["https://example.org"], notes: "Source checked.",
    }));
    render(<CatalogBrowser listings={records} initial={{}} />);
    expect(screen.getByText("4 listings")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: /Unconfirmed listings/ }));
    expect(screen.getByRole("link", { name: /current scholarship/ })).toBeTruthy();
    for (const id of ["partial", "stale", "unknown"]) {
      expect(screen.queryByRole("link", { name: new RegExp(`${id} scholarship`) })).toBeNull();
    }
    expect(screen.getByText("1 listing")).toBeTruthy();
  });
});
