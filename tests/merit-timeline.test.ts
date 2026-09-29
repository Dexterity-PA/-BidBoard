import { describe, expect, it } from "vitest";
import { datedSteps, hasUpcomingListedDate, LISTINGS } from "@/lib/merit/catalog";

const dates = (deadline: string) => datedSteps({ ...LISTINGS[0], deadline }).map((step) => step.iso);

describe("published scholarship timeline dates", () => {
  it("does not infer a later deadline's year from an earlier published date", () => {
    expect(dates("Nomination October 15, 2026; application November 1 (cycle year not published)")).toEqual(["2026-10-15", null]);
  });

  it("does not infer an earlier deadline's year by counting backwards", () => {
    expect(dates("Nomination December 1; application January 15, 2027")).toEqual([null, "2027-01-15"]);
  });

  it("keeps explicitly published years with or without a comma", () => {
    expect(dates("Nomination December 1 2026; application January 15,2027")).toEqual(["2026-12-01", "2027-01-15"]);
  });

  it("does not turn an invalid date into a calendar event", () => {
    expect(dates("Application February 30, 2027; interview March 10, 2027")).toEqual([null, "2027-03-10"]);
  });

  it("retains later routes after the earliest listed deadline has passed", () => {
    const record = { ...LISTINGS[0], deadlineDate: "2026-10-15" };
    expect(hasUpcomingListedDate({ ...record, deadline: "Georgia October 15, 2026; other applicants November 2, 2026" }, "2026-10-20")).toBe(true);
    expect(hasUpcomingListedDate({ ...record, deadline: "Early November 1, 2026 or regular January 4, 2027" }, "2026-11-20")).toBe(true);
    expect(hasUpcomingListedDate({ ...record, deadline: "Application October 15, 2026" }, "2026-10-20")).toBe(false);
    expect(hasUpcomingListedDate({ ...record, deadline: "Application October 15; next-cycle dates not published" }, "2026-10-20")).toBe(false);
    expect(hasUpcomingListedDate({ ...record, deadline: "Submission window November 1-10, 2026" }, "2026-11-05")).toBe(true);
  });
});
