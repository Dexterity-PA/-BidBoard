import { describe, expect, it } from "vitest";
import { createDeadlineCalendar, deadlineExportState, escapeCalendarText, isCalendarDate, type DeadlineCalendarInput } from "@/lib/merit/calendar";

const input: DeadlineCalendarInput = {
  id: "S100", name: "Scholarship", provider: "Foundation", deadlineDate: "2028-02-29", deadlineConfirmed: true,
  deadlineDescription: "February 29, 2028 at noon; verify timezone", officialUrl: "https://foundation.example/apply",
  eligibilityUrl: "https://meritously.com/scholarships/scholarship#eligibility", eligibility: "High school seniors",
};
const now = new Date("2027-12-31T23:00:00Z");
const unfold = (value: string) => value.replace(/\r\n /g, "");

describe("deadline calendar export", () => {
  it.each([
    ["2028-02-29", "20280301"], ["2027-12-31", "20280101"], ["2027-03-14", "20270315"], ["2027-11-07", "20271108"],
  ])("uses timezone-free, end-exclusive all-day dates for %s", (date, end) => {
    const calendar = createDeadlineCalendar({ ...input, deadlineDate: date }, "2027-01-01", now);
    expect(calendar).toContain(`DTSTART;VALUE=DATE:${date.replace(/-/g, "")}\r\n`);
    expect(calendar).toContain(`DTEND;VALUE=DATE:${end}\r\n`);
    expect(calendar).not.toContain("TZID");
    expect(calendar).toContain("DTSTAMP:20271231T230000Z");
  });

  it("rejects nonexistent and ambiguous dates without guessing another cycle", () => {
    for (const date of ["2027-02-29", "2028-02-30", "2028-13-01", "02/29/2028", "2028-2-29", "0000-01-01", "9999-12-31"]) {
      expect(isCalendarDate(date)).toBe(false);
      expect(deadlineExportState({ ...input, deadlineDate: date }, "2027-01-01")).toBe("unavailable");
    }
    expect(deadlineExportState({ ...input, deadlineDate: null }, "2027-01-01")).toBe("unavailable");
    expect(() => createDeadlineCalendar({ ...input, deadlineDate: null }, "2027-01-01", now)).toThrow();
  });

  it("allows today, blocks past and unconfirmed dates, and validates the comparison date", () => {
    expect(deadlineExportState(input, "2028-02-29")).toBe("ready");
    expect(deadlineExportState(input, "2028-03-01")).toBe("past");
    expect(deadlineExportState({ ...input, deadlineConfirmed: false }, "2028-02-29")).toBe("unconfirmed");
    expect(() => createDeadlineCalendar(input, "2028-03-01", now)).toThrow();
    expect(() => deadlineExportState(input, "2028-02-30")).toThrow();
  });

  it("rejects creation timestamps that cannot be represented in an ICS date-time", () => {
    for (const timestamp of [new Date(NaN), new Date("0000-01-01T00:00:00Z"), new Date("+010000-01-01T00:00:00Z")]) {
      expect(() => createDeadlineCalendar(input, "2027-01-01", timestamp)).toThrow(/creation time/);
    }
  });

  it("escapes text and prevents injected ICS properties", () => {
    expect(escapeCalendarText("a\\b,c;d\r\ne\rf\ng")).toBe("a\\\\b\\,c\\;d\\ne\\nf\\ng");
    const calendar = createDeadlineCalendar({ ...input, name: "Award\r\nBEGIN:VEVENT;test,\\", eligibility: "Senior\nATTENDEE:intruder" }, "2027-01-01", now);
    expect(calendar.match(/\r\nBEGIN:VEVENT\r\n/g)).toHaveLength(1);
    expect(calendar).not.toContain("\r\nATTENDEE:");
    expect(unfold(calendar)).toContain("SUMMARY:Award\\nBEGIN:VEVENT\\;test\\,\\\\");
    expect(calendar).not.toContain("BEGIN:VALARM");
  });

  it("includes source, eligibility and exact original deadline wording, with a stable UID", () => {
    const calendar = unfold(createDeadlineCalendar(input, "2027-01-01", now));
    expect(calendar).toContain("URL:https://foundation.example/apply");
    expect(calendar).toContain(input.eligibilityUrl);
    expect(calendar).toContain(escapeCalendarText(input.deadlineDescription));
    expect(calendar).toContain("does not update automatically");
    const revised = unfold(createDeadlineCalendar({ ...input, deadlineDate: "2028-03-02", name: "Renamed award" }, "2027-01-01", now));
    expect(calendar.match(/UID:.*/)?.[0]).toBe(revised.match(/UID:.*/)?.[0]);
  });

  it("folds Unicode lines to at most 75 UTF-8 bytes and preserves the text", () => {
    const name = "学🎓é".repeat(80);
    const calendar = createDeadlineCalendar({ ...input, name }, "2027-01-01", now);
    for (const line of calendar.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(unfold(calendar)).toContain(`SUMMARY:${name} — application deadline`);
    expect(calendar.endsWith("\r\n")).toBe(true);
    expect(calendar.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it.each(["javascript:alert(1)", "https://example.com/\r\nBEGIN:VEVENT", "https://user:password@example.com", "not-a-url"])("rejects unsafe or invalid source URLs: %s", (url) => {
    expect(deadlineExportState({ ...input, officialUrl: url }, "2027-01-01")).toBe("unavailable");
    expect(deadlineExportState({ ...input, eligibilityUrl: url }, "2027-01-01")).toBe("unavailable");
  });
});
