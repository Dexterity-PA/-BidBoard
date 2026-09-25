import colleges1 from "@/data/merit/colleges-1.json";
import colleges2 from "@/data/merit/colleges-2.json";
import outside1 from "@/data/merit/outside-1.json";
import outside2 from "@/data/merit/outside-2.json";
import colleges3 from "@/data/merit/colleges-3.json";
import states from "@/data/merit/states.json";
import outside3 from "@/data/merit/outside-3.json";
import colleges4 from "@/data/merit/colleges-4.json";
import outside4 from "@/data/merit/outside-4.json";
import regional from "@/data/merit/regional.json";
import colleges5 from "@/data/merit/colleges-5.json";
import outside5 from "@/data/merit/outside-5.json";
import regional2 from "@/data/merit/regional-2.json";

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
  /** Minimum high-school GPA when the official terms state one. */
  minGpa?: number | null;
  /** "uw" when the minimum is stated as unweighted, "any" otherwise. */
  gpaScale?: "uw" | "any" | null;
  /** Who can apply by status: citizens only, citizens or permanent residents, anyone, or unstated. */
  citizenship?: "citizen" | "citizen-or-pr" | "any" | null;
};

export type MeritListing = MeritRecord & { slug: string };

/** Date the research behind every listing was last checked. */
export const LAST_CHECKED = "2026-09-24";

const ALL = [
  ...colleges1,
  ...colleges2,
  ...outside1,
  ...outside2,
  ...colleges3,
  ...states,
  ...outside3,
  ...colleges4,
  ...outside4,
  ...regional,
  ...colleges5,
  ...outside5,
  ...regional2,
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
  if (/full[- ](cost|ride)|comprehensive college costs/.test(v)) return "Full cost";
  if (/tuition, (mandatory )?fees?,? (room|housing)|tuition,( on-campus)? housing|tuition, room|tuition and required fees.*housing|tuition, fees, room|tuition, books, room/.test(v))
    return "Tuition + housing";
  if (/full tuition|up to full tuition|four years of tuition/.test(v)) return "Full tuition";
  return null;
}

/* ---------- timeline + requirements ---------- */

export type TimelineStep = { label: string; date: string; iso: string | null };

const MONTH_RE =
  "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_RE = new RegExp(`${MONTH_RE}\\s+(\\d{1,2})(-\\d{1,2})?(?:,\\s*(\\d{4}))?`, "i");
const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function tidyLabel(s: string) {
  let t = s
    .replace(/,?\s*(\d{1,2}(:\d{2})?\s*(a\.m\.|p\.m\.)|noon|midnight)(\s+(Eastern|Central|Mountain|Pacific|MST|local time))?/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;:\s-]+|[,;:\s-]+$/g, "")
    .replace(/\s+(by|on|at)$/i, "")
    .trim();
  if (!t) return "Deadline";
  if (t.startsWith("(")) t = `Apply ${t}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Splits a deadline description into dated steps when it names more than one
 * date, e.g. "Nomination October 15, 2026; admission November 1". Returns an
 * empty list when there is one date or none, so pages show plain text instead.
 */
export function timelineSteps(r: MeritRecord): TimelineStep[] {
  const parts = r.deadline.split(/;\s*/).map((p) => p.trim()).filter(Boolean);
  const steps: TimelineStep[] = [];
  for (const part of parts) {
    const m = part.match(DATE_RE);
    if (!m) continue;
    const month = MONTH_INDEX[m[1].slice(0, 3).toLowerCase()];
    const day = Number(m[2]);
    const range = m[3] ?? "";
    const year = m[4] ?? null;
    const label = tidyLabel(part.replace(m[0], " "));
    const shown = `${MONTHS[month - 1]} ${day}${range}${year ? `, ${year}` : ""}`;
    const iso = year ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
    steps.push({ label, date: shown, iso });
  }
  return steps.length >= 2 ? steps : [];
}

const REQUIREMENT_TAGS: [string, string][] = [
  ["automatic-consideration", "No separate application: you are considered when you apply for admission"],
  ["checkbox-opt-in", "Opt in on your admission application"],
  ["separate-application", "A separate scholarship application"],
  ["honors-application", "An honors college application"],
  ["nomination", "A nomination from your school"],
  ["invitation-only", "An invitation to compete after admission review"],
  ["recommendations", "Recommendation letters"],
  ["essay", "An essay"],
  ["short-essay", "A short essay or statement"],
  ["video", "A video"],
  ["portfolio", "A portfolio"],
  ["research", "Original research"],
  ["speech", "A speech or recorded oration"],
  ["interview", "An interview"],
  ["finalist-round", "A finalist round or selection weekend"],
  ["membership", "Membership in the sponsoring organization"],
  ["local-route", "Entry through a local chapter or club"],
  ["acceptance-required", "A college acceptance"],
  ["fafsa-required", "The FAFSA (or CSS Profile)"],
  ["fee", "An application fee"],
];

/** Requirements named in the listing's own text that tags may not carry. */
const REQUIREMENT_TEXT: [RegExp, string][] = [
  [/recommendation|counselor (report|materials)|nominators|references/i, "recommendations"],
  [/\bessays?\b|personal statement|written responses|short responses/i, "essay"],
  [/interview/i, "interview"],
  [/\bvideo\b/i, "video"],
  [/r[ée]sum[ée]/i, "resume"],
  [/transcript/i, "transcript"],
  [/test scores|\bSAT\b|\bACT\b/i, "scores"],
];

const EXTRA_LABEL: Record<string, string> = {
  resume: "A resume or activities list",
  transcript: "Your transcript",
  scores: "Test scores (check whether they are optional)",
};

/** What a student should expect to prepare, from the listing's tags and its own wording. */
export function requirements(r: MeritRecord): string[] {
  const text = `${r.apply} ${r.deadline}`;
  const tags = new Set(r.tags);
  const extras: string[] = [];
  for (const [re, key] of REQUIREMENT_TEXT) {
    if (!re.test(text)) continue;
    if (key in EXTRA_LABEL) extras.push(EXTRA_LABEL[key]);
    else if (!(key === "essay" && tags.has("short-essay"))) tags.add(key);
  }
  const fromTags = REQUIREMENT_TAGS.filter(([t]) => tags.has(t)).map(([, label]) => label);
  return [...fromTags, ...extras];
}

/**
 * Fills in missing years on timeline steps by carrying the year forward from
 * the previous dated step, rolling over when the month goes backwards (a
 * listing's steps are written in order). Steps before any known year stay null.
 */
export function datedSteps(r: MeritRecord): TimelineStep[] {
  const steps = timelineSteps(r);
  let year: number | null = null;
  let lastMonth = 0;
  // Seed from the first step that states a year, working backwards.
  const firstKnown = steps.findIndex((s) => s.iso);
  if (firstKnown > 0) {
    let y = Number(steps[firstKnown].iso!.slice(0, 4));
    let m = Number(steps[firstKnown].iso!.slice(5, 7));
    for (let i = firstKnown - 1; i >= 0; i--) {
      const mi = MONTH_INDEX[steps[i].date.slice(0, 3).toLowerCase()];
      if (mi > m) y -= 1;
      m = mi;
      const d = Number(steps[i].date.split(" ")[1]);
      steps[i] = { ...steps[i], iso: `${y}-${String(mi).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
    }
  }
  return steps.map((s) => {
    const mi = MONTH_INDEX[s.date.slice(0, 3).toLowerCase()];
    if (s.iso) {
      year = Number(s.iso.slice(0, 4));
      lastMonth = mi;
      return s;
    }
    if (year === null) return s;
    if (mi < lastMonth) year += 1;
    lastMonth = mi;
    const d = Number(s.date.split(" ")[1].replace(/\D.*$/, ""));
    return { ...s, iso: `${year}-${String(mi).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
  });
}
