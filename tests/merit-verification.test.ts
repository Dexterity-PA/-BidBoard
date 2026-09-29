import { describe, expect, it } from "vitest";
import { getVerification, LISTINGS, validateVerificationLedger, verificationState } from "@/lib/merit/catalog";
import ledger from "@/data/merit/verification.json";
import sitemap from "@/app/sitemap";
import { buildRows } from "@/scripts/seed-merit.mjs";

const record = { id: "TEST1", sources: ["https://provider.edu/awards/example/"] };
const evidence = {
  checkedAt: "2026-09-29", sourceUrls: ["https://provider.edu/awards/example/"],
  notes: "The official page confirms the current deadline; award amounts were not checked.",
};

describe("per-listing verification evidence", () => {
  it("accepts dated evidence only for a known listing and its cited source", () => {
    expect(validateVerificationLedger({ TEST1: evidence }, [record], "2026-09-29")).toEqual({ TEST1: evidence });
    expect(validateVerificationLedger({ TEST1: { ...evidence, sourceUrls: ["https://provider.edu/awards/example#deadline"] } }, [record], "2026-09-29").TEST1.checkedAt).toBe("2026-09-29");
  });

  it("keeps an empty evidence ledger valid without inventing check dates", () => {
    expect(validateVerificationLedger({}, [record])).toEqual({});
    expect(verificationState(null)).toBe("unknown");
    expect(verificationState(undefined)).toBe("unknown");
  });

  it("rejects unknown IDs and malformed ledgers", () => {
    expect(() => validateVerificationLedger({ UNKNOWN: evidence }, [record])).toThrow("Unknown verification listing ID");
    expect(() => validateVerificationLedger([evidence], [record])).toThrow("keyed by listing ID");
    expect(() => validateVerificationLedger({ TEST1: null }, [record])).toThrow("Invalid verification entry");
  });

  it.each(["2026-02-30", "2025-02-29", "September 29, 2026", "2026-09-29T00:00:00Z", "2026-9-29", null])("rejects invalid calendar dates: %s", (checkedAt) => {
    expect(() => validateVerificationLedger({ TEST1: { ...evidence, checkedAt } }, [record])).toThrow("Invalid verification date");
  });

  it("rejects evidence dated after the validation cutoff", () => {
    expect(() => validateVerificationLedger({ TEST1: evidence }, [record], "2026-09-28")).toThrow("Invalid verification date");
  });

  it.each([
    [], ["https://provider.edu/different-award"], ["https://other.edu/awards/example"],
    ["javascript:alert(1)"], ["https://person:password@provider.edu/awards/example/"],
    ["https://provider.edu/awards/example/", "https://provider.edu/awards/example/#duplicate"],
  ].map((sourceUrls) => ({ sourceUrls })))("rejects missing, unrelated or duplicated source evidence: %j", ({ sourceUrls }) => {
    expect(() => validateVerificationLedger({ TEST1: { ...evidence, sourceUrls } }, [record])).toThrow();
  });

  it("requires a note describing the scope of the source check", () => {
    expect(() => validateVerificationLedger({ TEST1: { ...evidence, notes: " " } }, [record])).toThrow("evidence is missing");
  });

  it("marks 90-day-old checks stale without changing a program's classification", () => {
    expect(verificationState("2026-07-01", "2026-09-28")).toBe("current");
    expect(verificationState("2026-07-01", "2026-09-29")).toBe("stale");
    expect(verificationState("2026-09-29", "2026-09-29")).toBe("current");
  });

  it("validates the committed evidence against real catalog IDs, sources and today's UTC date", () => {
    expect(() => validateVerificationLedger(ledger, LISTINGS, new Date().toISOString().slice(0, 10))).not.toThrow();
  });

  it("keeps unknown check dates out of the sitemap and database seed", () => {
    const rows = buildRows();
    const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
    const sitemapRows = sitemap();
    let unknown = 0;
    for (const listing of LISTINGS) {
      const evidence = getVerification(listing);
      const row = rowsBySlug.get(listing.slug)!;
      const page = sitemapRows.find((entry) => entry.url.endsWith(`/scholarships/${listing.slug}`))!;
      expect(row.is_verified).toBe(listing.status === "live");
      if (evidence) {
        expect(row.last_verified).toBe(`${evidence.checkedAt}T00:00:00Z`);
        expect(page.lastModified).toBe(`${evidence.checkedAt}T00:00:00Z`);
      } else {
        unknown++;
        expect(row.last_verified).toBeNull();
        expect(page).not.toHaveProperty("lastModified");
      }
    }
    expect(unknown).toBeGreaterThan(0);
    expect(rows).toHaveLength(LISTINGS.length);
  });
});
