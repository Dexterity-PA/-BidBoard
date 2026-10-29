import { describe, expect, it } from "vitest";
import { LISTINGS } from "@/lib/merit/catalog";
import { deadlineLabel, deadlineOrder, expiredBeforeDate, listedDeadlineState } from "@/lib/merit/deadline-status";
import { listingDescription } from "@/lib/merit/seo";

const listing = { ...LISTINGS[0], deadlineDate: "2026-10-15", deadline: "October 15, 2026" };
describe("date-only scholarship deadlines", () => {
  it("does not mark a date expired until it has ended in every timezone", () => {
    expect(expiredBeforeDate(new Date("2026-10-16T11:59:59Z"))).toBe("2026-10-15");
    expect(expiredBeforeDate(new Date("2026-10-16T12:00:00Z"))).toBe("2026-10-16");
    expect(listedDeadlineState(listing, "2026-10-15")).toBe("listed");
    expect(deadlineLabel(listing, "2026-10-16")).toBe("Past listed deadline");
  });
  it("distinguishes an earlier milestone from a later stage without implying applications are open", () => {
    const multiStage = { ...listing, deadline: "Apply October 15, 2026; finalists submit November 2, 2026." };
    expect(listedDeadlineState(multiStage, "2026-10-29")).toBe("later-stage");
    expect(deadlineLabel(multiStage, "2026-10-29")).toBe("Earlier application milestone");
    expect(listedDeadlineState(multiStage, "2026-11-03")).toBe("past");
  });
  it("ranks upcoming stages ahead of unknown and expired cycles", () => {
    expect(deadlineOrder({ ...listing, deadlineDate: "2026-11-01" }, "2026-10-29")).toBe(0);
    expect(deadlineOrder({ ...listing, deadlineDate: null }, "2026-10-29")).toBe(1);
    expect(deadlineOrder(listing, "2026-10-29")).toBe(2);
  });
  it("keeps the date and eligibility visible when award terms are long", () => {
    const description = listingDescription({ ...listing, name: "Example award", value: "An award with detailed annual and renewal terms. ".repeat(20), eligibility: "Arizona high school seniors" });
    expect(description).toContain("2026-10-15");
    expect(description).toContain("Arizona high school seniors");
    expect(description.length).toBeLessThanOrEqual(300);
  });
});
