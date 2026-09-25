// Upserts the merit catalog (data/merit/*.json) into the scholarships table so
// the tracker, deadlines and reminders can reference merit awards.
//
//   node scripts/seed-merit.mjs            # dry run: prints what would change
//   node scripts/seed-merit.mjs --apply    # writes to DATABASE_URL
//
// Rows are matched on slug. Existing scholarships and user data are untouched.
// The slug, coverage and dollar helpers mirror lib/merit/catalog.ts; the
// check in scripts/check-merit-seed.ts fails if the two ever disagree.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["colleges-1", "colleges-2", "outside-1", "outside-2", "colleges-3", "states", "outside-3"];
export const LAST_CHECKED = "2026-09-24";
export const SOURCE = "merit-ledger";

export function slugify(s) {
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

export function coverageHint(value) {
  const v = value.toLowerCase();
  if (/full[- ](cost|ride)|comprehensive college costs/.test(v)) return "Full cost";
  if (/tuition, (mandatory )?fees?,? (room|housing)|tuition,( on-campus)? housing|tuition, room|tuition and required fees.*housing|tuition, fees, room|tuition, books, room/.test(v))
    return "Tuition + housing";
  if (/full tuition|up to full tuition|four years of tuition/.test(v)) return "Full tuition";
  return null;
}

export function maxDollars(value) {
  const nums = [...value.matchAll(/\$\s?([\d,]+(?:\.\d+)?)\s*(k|million)?/gi)].map((m) => {
    const n = parseFloat(m[1].replace(/,/g, ""));
    const unit = (m[2] || "").toLowerCase();
    return unit === "k" ? n * 1_000 : unit === "million" ? n * 1_000_000 : n;
  });
  return nums.length ? Math.max(...nums) : 0;
}

export function buildRows() {
  const records = FILES.flatMap((f) =>
    JSON.parse(readFileSync(join(ROOT, "data/merit", `${f}.json`), "utf8")),
  ).filter((r) => r.status !== "excluded");

  return records.map((r) => {
    const cover = coverageHint(r.value);
    const dollars = maxDollars(r.value);
    const states = r.tags.filter((t) => t.startsWith("state:")).map((t) => t.slice(6));
    return {
      slug: `${r.id.toLowerCase()}-${slugify(r.provider + " " + r.name)}`,
      name: r.name,
      provider: r.provider,
      provider_url: r.sources[0] ?? null,
      description: r.value,
      amount_min: null,
      amount_max: !cover && dollars > 0 ? Math.round(dollars * 100) : null, // cents
      amount_type: cover,
      deadline: r.deadlineDate,
      application_url: r.sources[0] ?? null,
      eligible_states: states.length ? states : null,
      requires_essay: r.tags.some((t) => t === "essay" || t === "short-essay"),
      source: SOURCE,
      source_url: r.sources[0] ?? null,
      is_verified: r.status === "live",
      last_verified: `${LAST_CHECKED}T00:00:00Z`,
      is_active: true,
      category: r.type,
    };
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = buildRows();

  let url = process.env.DATABASE_URL;
  if (!url && existsSync(join(ROOT, ".env.local"))) {
    const line = readFileSync(join(ROOT, ".env.local"), "utf8")
      .split("\n")
      .find((l) => l.startsWith("DATABASE_URL="));
    url = line?.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
  }
  if (!url) throw new Error("DATABASE_URL not set");

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);

  const existing = await sql`SELECT slug FROM scholarships WHERE slug = ANY(${rows.map((r) => r.slug)})`;
  const have = new Set(existing.map((e) => e.slug));
  console.log(`${rows.length} merit rows: ${rows.length - have.size} new, ${have.size} to update`);
  if (!apply) {
    console.log("Dry run. Re-run with --apply to write.");
    return;
  }

  for (const r of rows) {
    await sql`
      INSERT INTO scholarships (
        slug, name, provider, provider_url, description, amount_min, amount_max, amount_type,
        deadline, application_url, eligible_states, requires_essay, source, source_url,
        is_verified, last_verified, is_active, category, updated_at
      ) VALUES (
        ${r.slug}, ${r.name}, ${r.provider}, ${r.provider_url}, ${r.description}, ${r.amount_min},
        ${r.amount_max}, ${r.amount_type}, ${r.deadline}, ${r.application_url}, ${r.eligible_states},
        ${r.requires_essay}, ${r.source}, ${r.source_url}, ${r.is_verified}, ${r.last_verified},
        ${r.is_active}, ${r.category}, now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, provider = EXCLUDED.provider, provider_url = EXCLUDED.provider_url,
        description = EXCLUDED.description, amount_min = EXCLUDED.amount_min,
        amount_max = EXCLUDED.amount_max, amount_type = EXCLUDED.amount_type,
        deadline = EXCLUDED.deadline, application_url = EXCLUDED.application_url,
        eligible_states = EXCLUDED.eligible_states, requires_essay = EXCLUDED.requires_essay,
        source = EXCLUDED.source, source_url = EXCLUDED.source_url,
        is_verified = EXCLUDED.is_verified, last_verified = EXCLUDED.last_verified,
        is_active = EXCLUDED.is_active, category = EXCLUDED.category, updated_at = now()
    `;
  }
  // Listings that left the catalog (split or removed) stay in the table so
  // tracked rows keep working, but stop being active.
  const retired = await sql`
    UPDATE scholarships SET is_active = false, updated_at = now()
    WHERE source = ${SOURCE} AND is_active = true AND NOT (slug = ANY(${rows.map((r) => r.slug)}))
    RETURNING slug`;
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM scholarships WHERE source = ${SOURCE} AND is_active`;
  console.log(`Done. ${n} active merit rows; ${retired.length} retired.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
