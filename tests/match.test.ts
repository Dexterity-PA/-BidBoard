import { describe, expect, it } from "vitest";
import { LISTINGS, type MeritRecord } from "../lib/merit/catalog";
import { EMPTY_PROFILE, matchListing, type Profile } from "../lib/merit/match";

function listing(id: string): MeritRecord {
  const record = LISTINGS.find((item) => item.id === id);
  if (!record) throw new Error(`Missing catalog fixture ${id}`);
  return record;
}

function profile(overrides: Partial<Profile> = {}): Profile {
  return { ...EMPTY_PROFILE, state: "AZ", citizenship: "citizen", gpa: 4, ...overrides };
}

describe("conservative merit matching", () => {
  it.each([
    ["C530", "arts", "art"],
    ["C533", "sciences", "chemistry"],
  ] as const)("keeps %s visible for a related broad field", (id, field, requiredMajor) => {
    const result = matchListing(listing(id), profile({ field }));
    expect(result.verdict).toBe("check");
    expect(result.reasons).toContain(`Confirm your intended major meets the ${requiredMajor} requirement`);
  });

  it("does not equate a broad arts choice with a confirmed music major", () => {
    const result = matchListing(listing("C511"), profile({ field: "arts" }));
    expect(result.verdict).toBe("check");
    expect(result.reasons.some((reason) => reason.includes("music"))).toBe(true);
  });

  it("keeps specialist and unmapped major requirements visible", () => {
    const record = { ...listing("C533"), tags: ["major:future-interdisciplinary-program"] };
    expect(matchListing(record, profile({ field: "business" }))).toEqual({
      verdict: "check",
      reasons: ["Intended major: future interdisciplinary program (confirm the eligible programs)"],
    });
    expect(matchListing(listing("P621"), profile({ field: "business" })).verdict).toBe("check");
  });

  it("still excludes a field outside a fully understood major restriction", () => {
    const result = matchListing(listing("C043"), profile({ field: "arts" }));
    expect(result.verdict).toBe("no");
    expect(result.reasons.some((reason) => reason.startsWith("Limited to "))).toBe(true);
  });

  it("does not exclude Stevenson applicants using an incomparable GPA", () => {
    const result = matchListing(listing("C027"), profile({ gpa: 3.6 }));
    expect(result).toEqual({
      verdict: "check",
      reasons: ["Minimum 3.7 GPA: confirm the required GPA scale"],
    });
  });

  it.each([undefined, null, "any"] as const)("does not exclude when the GPA scale is %s", (gpaScale) => {
    const record = { ...listing("C058"), gpaScale };
    expect(matchListing(record, profile({ gpa: 3.7 })).verdict).toBe("check");
  });

  it("still excludes GPA below an explicitly unweighted minimum", () => {
    expect(matchListing(listing("C058"), profile({ gpa: 3.7 }))).toEqual({
      verdict: "no",
      reasons: ["Minimum 3.8 unweighted GPA"],
    });
    expect(matchListing(listing("C058"), profile({ gpa: 3.8 })).verdict).toBe("match");
  });

  it("shows unanswered residency, citizenship and GPA requirements", () => {
    const result = matchListing(listing("C100"), { ...EMPTY_PROFILE, field: "sciences" });
    expect(result.verdict).toBe("check");
    expect(result.reasons).toEqual(expect.arrayContaining([
      "Residency in AZ (your state is not provided)",
      "U.S. citizenship (your status is not provided)",
      "Minimum 3.75 GPA (your GPA is not provided)",
    ]));
  });

  it("warns about required scores even when GPA is high enough", () => {
    const result = matchListing(listing("C035"), profile());
    expect(result.verdict).toBe("check");
    expect(result.reasons).toContain("Required SAT, ACT or other qualifying test scores");
  });

  it("retains definite residency and citizenship exclusions", () => {
    expect(matchListing(listing("C100"), profile({ state: "CA" })).verdict).toBe("no");
    expect(matchListing(listing("C100"), profile({ citizenship: "pr" })).verdict).toBe("no");
  });

  it("does not call explicitly international-eligible records uncertain", () => {
    const record = { ...listing("C058"), tags: ["international-eligible"], citizenship: null };
    expect(matchListing(record, profile({ citizenship: "international" })).verdict).toBe("match");
  });
});
