import { describe, expect, it } from "vitest";
import { coverageFromValue, maxDollarsFromValue } from "@/lib/merit/award-value.mjs";

describe("award summaries", () => {
  it("does not advertise an aggregate prize pool as one student's award", () => {
    expect(maxDollarsFromValue("$100,000 prize pool; winning teams receive $12,000, $8,000 or $4,500.")).toBe(0);
    expect(maxDollarsFromValue("Winning teams receive $12,000, $8,000 or $4,500.")).toBe(12000);
  });

  it("keeps partial and variable coverage distinct from fixed full coverage", () => {
    expect(coverageFromValue("Awards range from $4,000 per year to full cost of attendance.")).toBe("Up to full cost");
    expect(coverageFromValue("Full tuition or half tuition, depending on the named award.")).toBe("Up to full tuition");
    expect(coverageFromValue("Full tuition for four years.")).toBe("Full tuition");
    expect(coverageFromValue("$20,000, not a full ride.")).toBeNull();
  });

  it("preserves the units used for individual dollar amounts", () => {
    expect(maxDollarsFromValue("Up to $25k over four years.")).toBe(25000);
    expect(maxDollarsFromValue("$1.5 million for the winning team.")).toBe(1500000);
    expect(maxDollarsFromValue("Amount not published.")).toBe(0);
  });

  it("does not turn permitted cash-award expenses into full coverage", () => {
    expect(coverageFromValue("$1,000 first-place award; usable for undergraduate/graduate tuition, room and board, fees or other educational expenses.")).toBeNull();
    expect(coverageFromValue("One-time awards include $2,500 for tuition, room or board and $1,000 toward tuition, books, room or board.")).toBeNull();
    expect(coverageFromValue("Up to $10,000 per academic year for tuition, mandatory fees, room and board, for 4 years.")).toBeNull();
  });

  it("recognizes explicit tuition coverage without resurrecting an unconfirmed award", () => {
    expect(coverageFromValue("Five full-tuition awards for four years, plus a $2,000 project stipend.")).toBe("Full tuition");
    expect(coverageFromValue("Scholarship equal to 100% of annual tuition, renewable for eight semesters, plus $6,000 in enrichment funds.")).toBe("Full tuition");
    expect(coverageFromValue("Presidential: half tuition annually for four years. Current Trustee full-tuition offering is not established.")).toBeNull();
  });

  it("does not present a listed minimum as the maximum award", () => {
    expect(maxDollarsFromValue("A minimum award of $2,500 annually, with additional need-based aid and up to $1,000 in research funding.")).toBe(0);
    expect(maxDollarsFromValue("Early Decision admits receive at least $25,000 annually.")).toBe(0);
    expect(maxDollarsFromValue("Awards of $2,000+ annually.")).toBe(0);
    expect(maxDollarsFromValue("Finalist awards: $25,000 minimum; the top ten receive $40,000-$250,000.")).toBe(250000);
  });

  it("recognizes covered tuition before highlighting smaller supplemental grants", () => {
    expect(coverageFromValue("Tuition and covered fees, standard double-occupancy housing, and meals for eight semesters. Includes enrichment funding up to $5,000.")).toBe("Up to tuition + housing");
    expect(coverageFromValue("Funding valued up to the full estimated cost of attendance for four years, plus $20,000 in enrichment funding.")).toBe("Up to full cost");
    expect(coverageFromValue("Value of tuition for up to five years; four years of housing; $4,000 per year supplemental scholarship.")).toBe("Up to full tuition");
  });
});
