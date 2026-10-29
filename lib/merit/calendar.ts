/** A calendar export is a date marker, never a claim about an exact closing time. */
export type DeadlineCalendarInput = {
  id: string;
  name: string;
  provider: string;
  deadlineDate: string | null;
  deadlineConfirmed: boolean;
  deadlineDescription: string;
  officialUrl: string | null;
  eligibilityUrl: string;
  eligibility: string;
};

export type DeadlineExportState = "ready" | "unconfirmed" | "unavailable" | "past";

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || value > "9998-12-31") return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function safeWebUrl(value: string | null): string | null {
  if (!value || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function deadlineExportState(input: DeadlineCalendarInput, today: string): DeadlineExportState {
  if (!isCalendarDate(today)) throw new Error("A valid local date is required");
  if (!input.deadlineDate || !isCalendarDate(input.deadlineDate)) return "unavailable";
  if (!input.deadlineConfirmed) return "unconfirmed";
  if (input.deadlineDate < today) return "past";
  if (!input.id.trim() || !safeWebUrl(input.officialUrl) || !safeWebUrl(input.eligibilityUrl)) return "unavailable";
  return "ready";
}

export function escapeCalendarText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

/** RFC 5545 folds at 75 octets, without splitting a UTF-8 code point. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const pieces: string[] = [];
  let current = "";
  let length = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (length + size > 75) {
      pieces.push(current);
      current = " ";
      length = 1;
    }
    current += character;
    length += size;
  }
  pieces.push(current);
  return pieces.join("\r\n");
}

export function createDeadlineCalendar(input: DeadlineCalendarInput, today: string, now = new Date()): string {
  if (deadlineExportState(input, today) !== "ready") throw new Error("Only confirmed upcoming deadlines can be exported");
  if (!Number.isFinite(now.getTime()) || now.getUTCFullYear() < 1 || now.getUTCFullYear() > 9999) {
    throw new Error("A valid creation time with a four-digit year is required");
  }
  const start = input.deadlineDate!;
  const endDate = new Date(`${start}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10);
  const description = [
    `Provider: ${input.provider}`,
    `Published deadline: ${input.deadlineDescription}`,
    "All-day date marker only. Confirm the exact closing time, timezone, current deadline and eligibility with the provider. This file does not update automatically.",
    `Official source: ${safeWebUrl(input.officialUrl)}`,
    `Eligibility: ${input.eligibility}`,
    `Eligibility and application details: ${safeWebUrl(input.eligibilityUrl)}`,
  ].join("\n\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Meritously//Award deadlines//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:award-${encodeURIComponent(input.id)}@meritously.com`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART;VALUE=DATE:${start.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${end.replace(/-/g, "")}`,
    `SUMMARY:${escapeCalendarText(`${input.name} — application deadline`)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `URL:${safeWebUrl(input.officialUrl)}`,
    "TRANSP:TRANSPARENT", "END:VEVENT", "END:VCALENDAR",
  ].map(foldLine).join("\r\n") + "\r\n";
}
