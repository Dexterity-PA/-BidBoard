// Publishes only catalog-owned rows covered by the completed, committed audit.
// Existing saved notes, statuses, and edited application deadlines are preserved.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import postgres from "postgres";
import { buildRowsFromRecords, SOURCE } from "./seed-merit.mjs";

const FILES = ["colleges-1", "colleges-2", "outside-1", "outside-2", "colleges-3", "states", "outside-3", "colleges-4", "outside-4", "regional", "colleges-5", "outside-5", "regional-2", "outside-6", "regional-3"];

export function canonicalRecordHash(record) {
  const canonical = (value) => Array.isArray(value) ? value.map(canonical) :
    value !== null && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
  return createHash("sha256").update(JSON.stringify(canonical(record))).digest("hex");
}

export function auditedSyncRows(records, ledger, manifest, archive) {
  const targets = manifest?.records;
  if (!Array.isArray(targets) || targets.length !== archive?.totalReviewed ||
      !targets.length || manifest.baseCommit !== archive.baseCommit ||
      archive.summary?.pending !== 0 || archive.summary?.validReviews !== targets.length ||
      Object.keys(archive.records ?? {}).length !== targets.length) throw new Error("Audit coverage is incomplete");
  const ids = new Set(targets.map((target) => target.id));
  if (ids.size !== targets.length || records.some((record) => record.status !== "excluded" && !ids.has(record.id))) throw new Error("Audit targets do not cover the active catalog");
  const byId = new Map(records.map((record) => [record.id, record]));
  if (byId.size !== records.length) throw new Error("Catalog IDs must be unique");
  const rows = buildRowsFromRecords(records, ledger, { includeExcluded: true });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  if (bySlug.size !== rows.length) throw new Error("Catalog routes must be unique");
  return targets.map((target) => {
    const record = byId.get(target.id);
    const evidence = ledger[target.id];
    if ((target.isNew !== undefined && typeof target.isNew !== "boolean") ||
        (target.isNew === true && (target.previousDeadline !== null || record?.status === "excluded"))) {
      throw new Error("Invalid new catalog target");
    }
    if (!record || !evidence?.outcome || archive.records[target.id]?.outcome !== evidence.outcome ||
        (target.previousDeadline !== null && !/^\d{4}-\d{2}-\d{2}$/.test(target.previousDeadline))) throw new Error("Invalid audited correction target");
    if (archive.records[target.id].finalRecordHash !== canonicalRecordHash(record)) throw new Error("Catalog record differs from the reviewed evidence");
    const reviewed = archive.records[target.id];
    const expectedEvidence = {
      checkedAt: reviewed.reviewedAt,
      sourceUrls: [...new Set(Object.values(reviewed.checks ?? {}).flatMap((check) => check.sourceUrls ?? []))],
      notes: typeof reviewed.publicNote === "string" ? reviewed.publicNote.trim() : null,
      outcome: reviewed.outcome,
      checks: Object.fromEntries(Object.entries(reviewed.checks ?? {}).map(([field, check]) => [field, check.status])),
      unresolved: reviewed.unresolved,
    };
    if (canonicalRecordHash(evidence) !== canonicalRecordHash(expectedEvidence)) throw new Error("Compact verification differs from the source-review archive");
    const row = rows.find((candidate) => candidate.slug.startsWith(target.id.toLowerCase() + "-"));
    if (!row || row.source !== SOURCE) throw new Error("Audit target has no unique catalog row");
    return { ...row, previous_deadline: target.previousDeadline, is_new: target.isNew === true };
  });
}

export async function loadAuditedSyncRows() {
  const load = async (file) => JSON.parse(await readFile(new URL(`../data/merit/${file}.json`, import.meta.url), "utf8"));
  const [files, ledger, manifest, archive] = await Promise.all([
    Promise.all(FILES.map(load)), load("verification"), load("audit-sync-2026-10-01-round4"), load("audit-2026-10-01-round4"),
  ]);
  return auditedSyncRows(files.flat(), ledger, manifest, archive);
}

export function auditSyncParameters(sql, rows) {
  // Let postgres.js serialize the array once. A pre-stringified value is
  // serialized again when the server describes the parameter as JSONB.
  return [sql.json(rows), SOURCE];
}

// A single parameterized statement locks its exact scholarship targets and is
// safe to rerun. Only explicitly new audited listings may be inserted. A slug
// owned by another source fails coverage validation and rolls back the batch.
export const AUDIT_SYNC_SQL = `
  WITH desired AS MATERIALIZED (
    SELECT * FROM jsonb_to_recordset($1::jsonb) AS x(
      slug text, name text, provider text, provider_url text, description text,
      amount_min integer, amount_max integer, amount_type text, deadline date,
      application_url text, eligible_states text[], requires_essay boolean,
      source_url text, is_verified boolean, last_verified timestamp,
      is_active boolean, category text, previous_deadline date, is_new boolean
    )
  ), targets AS MATERIALIZED (
    SELECT s.id, d.* FROM scholarships s JOIN desired d ON s.slug = d.slug
    WHERE s.source = $2 FOR UPDATE OF s
  ), inserted_scholarships AS (
    INSERT INTO scholarships (
      slug, name, provider, provider_url, description, amount_min, amount_max, amount_type,
      deadline, application_url, eligible_states, requires_essay, source, source_url,
      is_verified, last_verified, is_active, category, updated_at
    )
    SELECT slug, name, provider, provider_url, description, amount_min, amount_max, amount_type,
      deadline, application_url, eligible_states, requires_essay, $2, source_url,
      is_verified, last_verified, is_active, category, now()
    FROM desired WHERE is_new = true
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
  ), fixed_applications AS (
    UPDATE applications a SET deadline = t.deadline, updated_at = now()
    FROM targets t
    WHERE a.scholarship_id = t.id
      AND a.deadline IS NOT DISTINCT FROM t.previous_deadline
      AND a.deadline IS DISTINCT FROM t.deadline
      AND a.created_at = a.updated_at AND a.status = 'saved'
      AND a.applied_at IS NULL AND a.award_amount IS NULL
      AND COALESCE(a.notes, '') = '' AND COALESCE(a.checklist, '{}'::jsonb) = '{}'::jsonb
      AND COALESCE(cardinality(a.essay_draft_ids), 0) = 0 AND a.reminder_sent = false
    RETURNING a.id
  ), fixed_scholarships AS (
    UPDATE scholarships s SET name=t.name, provider=t.provider, provider_url=t.provider_url,
      description=t.description, amount_min=t.amount_min, amount_max=t.amount_max, amount_type=t.amount_type,
      deadline=t.deadline, application_url=t.application_url, eligible_states=t.eligible_states,
      requires_essay=t.requires_essay, source_url=t.source_url, is_verified=t.is_verified,
      last_verified=t.last_verified, is_active=t.is_active, category=t.category, updated_at=now()
    FROM targets t WHERE s.id=t.id AND ROW(
      s.name,s.provider,s.provider_url,s.description,s.amount_min,s.amount_max,s.amount_type,
      s.deadline,s.application_url,s.eligible_states,s.requires_essay,s.source_url,s.is_verified,
      s.last_verified,s.is_active,s.category
    ) IS DISTINCT FROM ROW(
      t.name,t.provider,t.provider_url,t.description,t.amount_min,t.amount_max,t.amount_type,
      t.deadline,t.application_url,t.eligible_states,t.requires_essay,t.source_url,t.is_verified,
      t.last_verified,t.is_active,t.category
    ) RETURNING s.id
  )
  SELECT (SELECT count(*) FROM desired)::int AS reviewed,
    ((SELECT count(*) FROM targets) + (SELECT count(*) FROM inserted_scholarships))::int AS matched,
    (SELECT count(*) FROM inserted_scholarships)::int AS inserted,
    (SELECT count(*) FROM fixed_scholarships)::int AS scholarships,
    (SELECT count(*) FROM fixed_applications)::int AS applications
`;

async function main() {
  // Validate even on previews so incomplete evidence never reaches production.
  const rows = await loadAuditedSyncRows();
  if (process.env.VERCEL_ENV !== "production") {
    console.log(`[catalog audit] ${rows.length} reviewed records validated; database sync skipped outside production.`);
    return;
  }
  let sql;
  try {
    if (!process.env.DATABASE_URL?.trim()) throw new Error("Missing production database configuration");
    sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
    const [counts] = await sql.begin(async (tx) => {
      await tx`SET LOCAL search_path TO public`;
      await tx`SET LOCAL lock_timeout = '30s'`;
      await tx`SET LOCAL statement_timeout = '90s'`;
      await tx`SELECT pg_advisory_xact_lock(hashtext('meritously'), hashtext('catalog-audit-2026-09-29'))`;
      const result = await tx.unsafe(AUDIT_SYNC_SQL, auditSyncParameters(tx, rows));
      if (result[0]?.matched !== rows.length) {
        console.error(`[catalog audit] Matched ${result[0]?.matched ?? 0} of ${rows.length} reviewed records; refusing an incomplete synchronization.`);
        throw new Error("Incomplete catalog synchronization");
      }
      return result;
    });
    console.log(`[catalog audit] Reviewed=${counts.reviewed}; matched=${counts.matched}; new scholarships=${counts.inserted}; scholarship corrections=${counts.scholarships}; untouched saved deadlines corrected=${counts.applications}.`);
  } catch (error) {
    const code = typeof error?.code === "string" && /^[A-Z0-9_]{1,40}$/.test(error.code) ? error.code : "UNKNOWN";
    console.error(`[catalog audit] Failed (${code}). Check audit evidence, database availability and schema permissions.`);
    process.exitCode = 1;
  } finally {
    if (sql) await sql.end({ timeout: 5 }).catch(() => { process.exitCode = 1; });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(() => { console.error("[catalog audit] The complete source-review archive is missing or invalid."); process.exitCode = 1; });
}
