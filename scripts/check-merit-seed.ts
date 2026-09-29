// Fails if scripts/seed-merit.mjs and lib/merit/catalog.ts disagree on
// slugs, coverage labels or dollar parsing. Run: npx tsx scripts/check-merit-seed.ts
import { LISTINGS, coverageHint, getVerification, isFullyVerified, maxDollars } from "../lib/merit/catalog";
import { buildRows } from "./seed-merit.mjs";

const rows = buildRows() as Array<{ slug: string; amount_type: string | null; amount_max: number | null; last_verified: string | null; is_verified: boolean }>;
const bySlug = new Map(rows.map((r) => [r.slug, r]));
let bad = 0;
for (const l of LISTINGS) {
  const r = bySlug.get(l.slug);
  const cover = coverageHint(l);
  const cents = !cover && maxDollars(l) > 0 ? Math.round(maxDollars(l) * 100) : null;
  const evidence = getVerification(l);
  const checkedAt = isFullyVerified(evidence) ? evidence?.checkedAt : null;
  if (!r || r.amount_type !== cover || r.amount_max !== cents ||
      r.last_verified !== (checkedAt ? `${checkedAt}T00:00:00Z` : null) || r.is_verified !== isFullyVerified(evidence)) {
    bad++;
    console.error("mismatch", l.id, l.slug);
  }
}
if (rows.length !== LISTINGS.length) { bad++; console.error("count", rows.length, LISTINGS.length); }
if (new Set(rows.map((r) => r.slug)).size !== rows.length) { bad++; console.error("duplicate slugs"); }
console.log(bad ? `${bad} problems` : `OK: ${rows.length} rows match the catalog`);
process.exit(bad ? 1 : 0);
