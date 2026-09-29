import { describe, expect, it } from "vitest";
import { auditedSyncRows, auditSyncParameters, canonicalRecordHash } from "@/scripts/sync-catalog-audit.mjs";
import postgres from "postgres";
import type { MeritRecord } from "@/lib/merit/catalog";

const record: MeritRecord = {
  id: "C901", slug: "c901-original-stable-name", provider: "Example University", name: "Renamed award",
  type: "college-program", status: "live", value: "$10,000 per year", deadline: "December 1, 2026",
  deadlineDate: "2026-12-01", apply: "Apply for admission.", eligibility: "Incoming students.", notes: "",
  tags: [], sources: ["https://example.edu/award"], minGpa: null, gpaScale: null, citizenship: null,
};
const checked = {
  checkedAt: "2026-09-29", sourceUrls: record.sources, notes: "Official terms checked.", outcome: "verified",
  checks: { identity: "supported", value: "supported", deadline: "supported", application: "supported", eligibility: "supported" }, unresolved: [] as string[],
};
const manifest = { baseCommit: "base", records: [{ id: "C901", previousDeadline: "2026-10-15" }] };
function makeArchive(item: MeritRecord = record, evidence = checked) {
  return { baseCommit: "base", totalReviewed: 1, summary: { pending: 0, validReviews: 1 }, records: { C901: {
    outcome: evidence.outcome, reviewedAt: evidence.checkedAt, publicNote: evidence.notes,
    checks: Object.fromEntries(Object.entries(evidence.checks).map(([field, status]) => [field, { status, sourceUrls: evidence.sourceUrls }])),
    unresolved: evidence.unresolved, finalRecordHash: canonicalRecordHash(item),
  } } };
}
const archive = makeArchive();

describe("completed catalog audit publication", () => {
  it("sends a JSON array through the production driver's JSONB serializer", async () => {
    const sql = postgres("postgresql://audit:unused@127.0.0.1:1/audit");
    try {
      const rows = auditedSyncRows([record], { C901: checked }, manifest, archive);
      const [payload, source] = auditSyncParameters(sql, rows) as [{ type: number; value: unknown }, string];
      expect(source).toBe("merit-ledger");
      expect(payload.type).toBe(3802);
      const wireValue = sql.options.serializers[payload.type](payload.value);
      expect(JSON.parse(wireValue)).toEqual(rows);
    } finally {
      await sql.end();
    }
  });

  it("keeps saved URLs stable after official name corrections and carries the old date separately", () => {
    const [row] = auditedSyncRows([record], { C901: checked }, manifest, archive);
    expect(row.slug).toBe("c901-original-stable-name");
    expect(row.name).toBe("Renamed award");
    expect(row.previous_deadline).toBe("2026-10-15");
    expect(row.deadline).toBe("2026-12-01");
    expect(row.is_verified).toBe(true);
  });

  it("rejects missing reviews, duplicate targets, and evidence/archive disagreement", () => {
    expect(() => auditedSyncRows([record], { C901: checked }, manifest, { ...archive, summary: { pending: 1, validReviews: 0 } })).toThrow("incomplete");
    expect(() => auditedSyncRows([record, { ...record, id: "C902", slug: "c902-missing" }], { C901: checked }, manifest, archive)).toThrow("active catalog");
    expect(() => auditedSyncRows([record], { C901: checked }, { ...manifest, records: [...manifest.records, ...manifest.records] }, { ...archive, totalReviewed: 2, summary: { pending: 0, validReviews: 2 }, records: { C901: {}, C902: {} } })).toThrow("targets");
    expect(() => auditedSyncRows([record], { C901: checked }, manifest, { ...archive, records: { C901: { outcome: "partial" } } })).toThrow("Invalid audited");
    expect(() => auditedSyncRows([record, { ...record, slug: "c901-duplicate" }], { C901: checked }, manifest, archive)).toThrow("IDs must be unique");
    expect(() => auditedSyncRows([{ ...record, deadlineDate: "2027-02-01" }], { C901: checked }, manifest, archive)).toThrow("differs from the reviewed evidence");
  });

  it("withholds unconfirmed award amounts from database filters without erasing the qualification", () => {
    const partial = { ...checked, outcome: "partial", checks: { ...checked.checks, value: "unconfirmed" }, unresolved: ["The next-cycle amount is unpublished."] };
    const qualified = { ...record, value: "Previously $10,000; current amount unconfirmed." };
    const [row] = auditedSyncRows([qualified], { C901: partial }, manifest, makeArchive(qualified, partial));
    expect(row.is_verified).toBe(false);
    expect(row.last_verified).toBeNull();
    expect(row.amount_max).toBeNull();
    expect(row.amount_type).toBeNull();
    expect(row.description).toContain("current amount unconfirmed");
  });

  it("retains a retired record for safe updates while marking it inactive", () => {
    const retired = { ...record, status: "excluded" as const };
    const evidence = { ...checked, outcome: "retired" };
    const [row] = auditedSyncRows([retired], { C901: evidence }, manifest, makeArchive(retired, evidence));
    expect(row.is_active).toBe(false);
    expect(row.is_verified).toBe(false);
  });

  it("rejects changed field checks, dates, citations and limitations despite matching outcomes", () => {
    const sourceRecord = { ...record, sources: [...record.sources, "https://example.edu/rules"] };
    const partial = { ...checked, outcome: "partial", checks: { ...checked.checks, value: "unconfirmed" }, unresolved: ["Current award amount is unpublished."] };
    const archived = makeArchive(sourceRecord, partial);
    const altered = [
      { ...partial, checks: { ...partial.checks, value: "supported", deadline: "unconfirmed" } },
      { ...partial, checkedAt: "2026-09-28" },
      { ...partial, sourceUrls: ["https://example.edu/rules"] },
      { ...partial, unresolved: ["A different limitation."] },
      { ...partial, notes: "A different public review note." },
    ];
    for (const evidence of altered) {
      expect(() => auditedSyncRows([sourceRecord], { C901: evidence }, manifest, archived)).toThrow("Compact verification differs");
    }
  });
});
