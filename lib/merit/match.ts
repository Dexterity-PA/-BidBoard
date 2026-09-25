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
};

const FIELD_OF_MAJOR: Record<string, Field[]> = {
  business: ["business"],
  engineering: ["engineering"],
  math: ["math"],
  "computer-science": ["computer-science"],
};

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
  if (states.length && p.state && !states.includes(p.state)) {
    no.push(`Only for ${states.join(" or ")} students`);
  }

  // Citizenship.
  if (p.citizenship) {
    if (r.tags.includes("international-only") && p.citizenship !== "international") {
      no.push("Only for international students");
    } else if (r.citizenship === "citizen" && p.citizenship !== "citizen") {
      no.push("U.S. citizens only");
    } else if (p.citizenship === "international") {
      if (r.citizenship === "citizen-or-pr") no.push("U.S. citizens or permanent residents only");
      else if (r.tags.includes("no-international")) no.push("International applicants excluded");
      else if (r.citizenship !== "any") check.push("Whether international students can apply");
    }
  }

  // GPA minimum (profile GPA is unweighted, so any stated minimum is comparable).
  if (p.gpa !== null && typeof r.minGpa === "number" && p.gpa < r.minGpa) {
    no.push(`Minimum ${r.minGpa.toFixed(2).replace(/0$/, "")} GPA`);
  }

  // Intended field.
  const majors = r.tags.filter((t) => t.startsWith("major:")).map((t) => t.slice(6));
  if (majors.length) {
    const ok = majors.some((m) => (FIELD_OF_MAJOR[m] ?? []).includes(p.field));
    if (!ok) {
      if (p.field === "undecided") check.push(`Intended major: ${majors.join(", ").replace("-", " ")}`);
      else no.push(`Limited to ${majors.join(", ").replace("-", " ")} majors`);
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
