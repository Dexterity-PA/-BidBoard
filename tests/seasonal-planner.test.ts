import { describe, expect, it } from "vitest";
import { GET } from "@/app/for-counselors/seasonal-planner.csv/route";
import { PLANNING_AWARDS, PLANNER_CHECKED_AT, planningDeadlineStatus, seasonalPlannerCsv } from "@/lib/merit/seasonal-planner";

describe("dated counselor planner", () => {
  it("does not label passed or closing-day deadlines as upcoming", () => {
    expect(planningDeadlineStatus("2026-11-12", "2026-11-11")).toContain("Upcoming");
    expect(planningDeadlineStatus("2026-11-12", "2026-11-12")).toContain("confirm closing time");
    expect(planningDeadlineStatus("2026-11-12", "2026-11-13")).toContain("Date passed");
    const csv = seasonalPlannerCsv("2027-01-08");
    expect(csv).not.toContain("Upcoming");
    expect(csv.match(/Date passed/g)).toHaveLength(PLANNING_AWARDS.length);
  });

  it("downloads the source-backed shortlist without student data or cacheable date labels", async () => {
    const response = GET();
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    const csv = await response.text();
    expect(csv.split("\r\n").filter(Boolean)).toHaveLength(PLANNING_AWARDS.length + 1);
    for (const award of PLANNING_AWARDS) {
      expect(csv).toContain(award.officialUrl);
      expect(csv).toContain(award.deadline);
    }
    expect(csv).toContain(PLANNER_CHECKED_AT);
    expect(csv).toContain('"My target date","My next step","My completion status"');
  });
});
