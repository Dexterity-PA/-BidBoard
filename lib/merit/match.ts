import type { MeritRecord } from "./catalog";

export type Citizenship = "citizen" | "pr" | "international";
export type Field =
  | "undecided"
  | "business"
  | "engineering"
  | "computer-science"
  | "math"
  | "sciences"
  | "humanities"
  | "arts";

export type Profile = {
  state: string; // two-letter code, "" if not given
  citizenship: Citizenship | "";
  gpa: number | null; // unweighted, 4.0 scale
  field: Field;
};

export const EMPTY_PROFILE: Profile = { state: "", citizenship: "", gpa: null, field: "undecided" };

export const FIELD_LABEL: Record<Field, string> = {
  undecided: "Undecided",
  business: "Business or economics",
  engineering: "Engineering",
  "computer-science": "Computer science",
  math: "Mathematics",
  sciences: "Sciences",
  humanities: "Humanities or social sciences",
  arts: "Arts",
};

export const CITIZENSHIP_LABEL: Record<Citizenship, string> = {
  citizen: "U.S. citizen",
  pr: "U.S. permanent resident",
  international: "International student",
};

export const STATES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
  ["XX", "Outside the U.S."],
];

/** Requirements a profile can't answer, shown as "check" notes rather than filtered. */
const CHECK_TAGS: Record<string, string> = {
  membership: "Membership in the sponsoring organization",
  "family-membership": "A family member in the sponsoring organization",
  disability: "A documented disability",
  "religious-affiliation": "A religious affiliation",
  "womens-college": "The college's admission policy (women's college)",
  "license-required": "A license",
  athletics: "Playing a sport",
  "region-restricted": "Living in specific counties or cities",
  "acceptance-required": "A college acceptance before applying",
  "age-18": "Being 18 or older",
  "college-restricted": "Enrollment at an eligible college or program",
  "score-threshold": "Required SAT, ACT or other qualifying test scores",
  "psat-route": "The required PSAT or National Merit status",
};

const FIELD_OF_MAJOR: Record<string, Field[]> = {
  accounting: ["business"],
  "actuarial-science": ["math", "business"],
  aerospace: ["engineering", "sciences"],
  agriculture: ["sciences", "engineering", "business"],
  "american-studies": ["humanities", "arts"],
  art: ["arts"],
  arts: ["arts", "humanities"],
  aviation: ["engineering", "sciences", "business"],
  "aviation-maintenance": ["engineering"],
  "biomedical-engineering": ["engineering", "sciences"],
  business: ["business"],
  chemistry: ["sciences"],
  classics: ["humanities"],
  construction: ["engineering", "business"],
  "construction-trades": ["engineering"],
  cybersecurity: ["computer-science", "engineering"],
  education: ["humanities", "sciences", "math", "arts"],
  engineering: ["engineering"],
  english: ["humanities", "arts"],
  "film and media arts": ["arts", "humanities"],
  "health-sciences": ["sciences"],
  history: ["humanities"],
  "international-relations": ["humanities"],
  journalism: ["humanities", "arts", "business"],
  math: ["math"],
  mathematics: ["math"],
  music: ["arts"],
  "natural-resources": ["sciences", "engineering"],
  "nuclear-engineering": ["engineering", "sciences", "math"],
  stem: ["sciences", "engineering", "computer-science", "math"],
  transportation: ["engineering", "sciences", "business"],
  "water-resources": ["sciences", "engineering"],
  "computer-science": ["computer-science"],
};

// Only these broad restrictions can be compared directly with the form's fields.
// Specialist tags may permit related degrees, minors or career interests, so a
// different broad field alone is not enough evidence to rule an applicant out.
const COMPARABLE_MAJORS = new Set(["business", "engineering", "computer-science", "math", "mathematics"]);

export type MatchResult = {
  verdict: "match" | "check" | "no";
  /** Why a listing doesn't fit, or what to confirm. */
  reasons: string[];
};

export function hasProfile(p: Profile) {
  return Boolean(p.state || p.citizenship || p.gpa !== null || p.field !== "undecided");
}

/**
 * Conservative eligibility check. A listing is only ruled out when its
 * official terms clearly exclude the student; anything the profile can't
 * answer becomes a "check" note instead.
 */
export function matchListing(r: MeritRecord, p: Profile): MatchResult {
  const no: string[] = [];
  const check: string[] = [];

  // State residency (state tags mean the award is limited to residents).
  const states = r.tags.filter((t) => t.startsWith("state:")).map((t) => t.slice(6));
  if (states.length) {
    if (!p.state) check.push(`Residency in ${states.join(" or ")} (your state is not provided)`);
    else if (!states.includes(p.state)) no.push(`Only for ${states.join(" or ")} students`);
  }

  // Citizenship.
  const citizenship = r.citizenship ?? (r.tags.includes("us-citizen-only") ? "citizen" : null);
  if (!p.citizenship) {
    if (r.tags.includes("international-only")) check.push("International student status");
    else if (citizenship === "citizen") check.push("U.S. citizenship (your status is not provided)");
    else if (citizenship === "citizen-or-pr") check.push("U.S. citizenship or permanent residency (your status is not provided)");
    else if (r.tags.includes("no-international")) check.push("Citizenship or residency requirements (international applicants excluded)");
  } else {
    if (r.tags.includes("international-only") && p.citizenship !== "international") {
      no.push("Only for international students");
    } else if (citizenship === "citizen" && p.citizenship !== "citizen") {
      no.push("U.S. citizens only");
    } else if (p.citizenship === "international") {
      if (citizenship === "citizen-or-pr") no.push("U.S. citizens or permanent residents only");
      else if (r.tags.includes("no-international")) no.push("International applicants excluded");
      else if (citizenship !== "any" && !r.tags.includes("international-eligible") && !r.tags.includes("international-only")) {
        check.push("Whether international students can apply");
      }
    }
  }

  // A weighted, either-scale or unspecified minimum cannot exclude someone
  // using the unweighted GPA collected by this form.
  if (typeof r.minGpa === "number") {
    const minimum = r.minGpa.toFixed(2).replace(/0$/, "");
    if (p.gpa === null) {
      check.push(`Minimum ${minimum} GPA (your GPA is not provided)`);
    } else if (r.gpaScale !== "uw") {
      check.push(`Minimum ${minimum} GPA: confirm the required GPA scale`);
    } else if (p.gpa < r.minGpa) {
      no.push(`Minimum ${minimum} unweighted GPA`);
    }
  }

  // Intended field.
  const majors = r.tags.filter((t) => t.startsWith("major:")).map((t) => t.slice(6).toLowerCase());
  if (majors.length) {
    const majorLabel = majors.join(", ").replace(/-/g, " ");
    const related = majors.some((m) => (FIELD_OF_MAJOR[m] ?? []).includes(p.field));
    const comparable = majors.every((m) => COMPARABLE_MAJORS.has(m));
    if (p.field !== "undecided" && !related && comparable) {
      no.push(`Limited to ${majorLabel} majors`);
    } else {
      check.push(related
        ? `Confirm your intended major meets the ${majorLabel} requirement`
        : `Intended major: ${majorLabel} (confirm the eligible programs)`);
    }
  }

  for (const [tag, label] of Object.entries(CHECK_TAGS)) {
    if (r.tags.includes(tag)) check.push(label);
  }

  if (no.length) return { verdict: "no", reasons: no };
  if (check.length) return { verdict: "check", reasons: check };
  return { verdict: "match", reasons: [] };
}

/* ---------- storage (per browser) ---------- */

const KEY = "meritously.profile.v1";

export function loadProfile(): Profile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Profile>;
    return { ...EMPTY_PROFILE, ...p };
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: matching still works for this visit */
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
