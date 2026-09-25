import colleges1 from "@/data/merit/colleges-1.json";
import colleges2 from "@/data/merit/colleges-2.json";
import outside1 from "@/data/merit/outside-1.json";
import outside2 from "@/data/merit/outside-2.json";

export type MeritType = "college-program" | "scholarship" | "competition";
export type MeritStatus =
  | "live"
  | "watchlist"
  | "mixed-need"
  | "directory"
  | "excluded";

export type MeritRecord = {
  id: string;
  provider: string;
  name: string;
  type: MeritType;
  status: MeritStatus;
  value: string;
  deadline: string;
  deadlineDate: string | null;
  apply: string;
  eligibility: string;
  notes: string;
  tags: string[];
  sources: string[];
};

export type MeritListing = MeritRecord & { slug: string };

/** Date the research behind every listing was last checked. */
export const LAST_CHECKED = "2026-09-24";

const ALL = [
  ...colleges1,
  ...colleges2,
  ...outside1,
  ...outside2,
] as MeritRecord[];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

function withSlug(r: MeritRecord): MeritListing {
  return { ...r, slug: `${r.id.toLowerCase()}-${slugify(r.provider + " " + r.name)}` };
}

/** Everything a student can see: excluded records never leave this module. */
export const LISTINGS: MeritListing[] = ALL.filter(
  (r) => r.status !== "excluded",
).map(withSlug);

export function getListing(slug: string): MeritListing | undefined {
  return LISTINGS.find((l) => l.slug === slug);
}

export const TYPE_LABEL: Record<MeritType, string> = {
  "college-program": "College program",
  scholarship: "Scholarship",
  competition: "Competition",
};

export const STATUS_LABEL: Record<Exclude<MeritStatus, "excluded">, string> = {
  live: "Verified",
  watchlist: "Unconfirmed",
  "mixed-need": "Merit + need",
  directory: "Directory",
};

/** Human labels for the tags that are useful to show or filter on. */
export const TAG_LABEL: Record<string, string> = {
  "automatic-consideration": "Automatic consideration",
  "separate-application": "Separate application",
  "honors-application": "Honors application",
  nomination: "Nomination",
  "self-nomination": "Self-nomination allowed",
  "invitation-only": "By invitation",
  interview: "Interview",
  "finalist-round": "Finalist round",
  "early-deadline": "Before Early Action",
  "pr-eligible": "Permanent residents eligible",
  "us-citizen-only": "U.S. citizens only",
  "international-eligible": "International students eligible",
  "test-optional": "Test optional",
  "score-threshold": "Score minimum",
  stamps: "Stamps Scholars",
  research: "Research",
  stem: "STEM",
  math: "Math",
  essay: "Essay",
  "short-essay": "Short essay",
  writing: "Writing",
  arts: "Arts",
  film: "Film",
  video: "Video",
  speech: "Speech",
  service: "Service",
  entrepreneurship: "Entrepreneurship",
  civics: "Civics",
  history: "History",
  membership: "Membership required",
  "local-route": "Enter through a local chapter",
  "acceptance-required": "College acceptance required",
  "no-ai": "No AI assistance allowed",
  "need-considered": "Need considered",
  "need-required": "Need required",
  "womens-college": "Women's college",
  team: "Team entry",
};

export function stateTags(r: MeritRecord): string[] {
  return r.tags.filter((t) => t.startsWith("state:")).map((t) => t.slice(6));
}

export function majorTags(r: MeritRecord): string[] {
  return r.tags.filter((t) => t.startsWith("major:")).map((t) => t.slice(6));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 1, 2026" from an ISO date without timezone drift. */
export function formatISODate(iso: string, withYear = true) {
  const [y, m, d] = iso.split("-").map(Number);
  return withYear ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${d}`;
}

export function monthDay(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return { month: MONTHS[m - 1].toUpperCase(), day: String(d).padStart(2, "0") };
}

/** Whole days from `today` (YYYY-MM-DD) to `iso`. Negative means past. */
export function daysUntil(iso: string, today: string) {
  const [ty, tm, td] = today.split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000);
}

/** Today's date in the student's calendar as YYYY-MM-DD. */
export function localToday() {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

/** Largest dollar figure mentioned in the award text, or 0. */
export function maxDollars(r: MeritRecord): number {
  const nums = [...r.value.matchAll(/\$\s?([\d,]+(?:\.\d+)?)\s*(k|million)?/gi)].map((m) => {
    const n = parseFloat(m[1].replace(/,/g, ""));
    const unit = (m[2] || "").toLowerCase();
    return unit === "k" ? n * 1_000 : unit === "million" ? n * 1_000_000 : n;
  });
  return nums.length ? Math.max(...nums) : 0;
}

/**
 * Rough award size for filtering: 4 full tuition or more, 3 is $20,000+,
 * 2 is $5,000+, 1 is smaller or unknown.
 */
export function awardTier(r: MeritRecord): number {
  if (coverageHint(r)) return 4;
  const d = maxDollars(r);
  if (d >= 20_000) return 3;
  if (d >= 5_000) return 2;
  return 1;
}

/** A short, honest "full ride"-style label derived from the award text. */
export function coverageHint(r: MeritRecord): string | null {
  const v = r.value.toLowerCase();
  if (/full (cost|ride)|comprehensive college costs/.test(v)) return "Full cost";
  if (/tuition, (mandatory )?fees?,? (room|housing)|tuition,( on-campus)? housing|tuition, room|tuition and required fees.*housing|tuition, fees, room|tuition, books, room/.test(v))
    return "Tuition + housing";
  if (/full tuition|up to full tuition|four years of tuition/.test(v)) return "Full tuition";
  return null;
}
