// Applies only the documented Forty Acres correction. Never runs a full seed.
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { buildRows, SOURCE } from "./seed-merit.mjs";

export function deadlineCorrections() {
  const rows = buildRows().filter((row) => row.slug.startsWith("c079-"));
  if (rows.length !== 1 || rows[0].deadline !== "2026-12-01" || !rows[0].last_verified) {
    throw new Error("Reviewed Forty Acres correction does not match the current catalog");
  }
  return [{ source: SOURCE, slug: rows[0].slug, previousDeadline: "2026-10-15", deadline: "2026-12-01" }];
}

/**
 * The caller owns the transaction. A saved row is eligible only when every
 * available signal says it is still the initial automatic deadline copy.
 * All deadline edits in the app change updated_at; even unrelated edits are
 * conservatively preserved because legacy rows have no deadline provenance.
 * @param {(query: string, parameters: string[]) => Promise<unknown>} execute
 */
export async function syncMeritCorrections(execute) {
  for (const correction of deadlineCorrections()) {
    await execute(`
      WITH targets AS MATERIALIZED (
        SELECT id FROM scholarships
        WHERE source = $1 AND slug = $2 AND deadline IN ($3::date, $4::date)
        FOR UPDATE
      ), fixed_applications AS (
        UPDATE applications AS a SET deadline = $4::date, updated_at = now()
        FROM targets AS t
        WHERE a.scholarship_id = t.id AND a.deadline = $3::date
          AND a.created_at = a.updated_at AND a.status = 'saved'
          AND a.applied_at IS NULL AND a.award_amount IS NULL
          AND COALESCE(a.notes, '') = '' AND COALESCE(a.checklist, '{}'::jsonb) = '{}'::jsonb
          AND COALESCE(cardinality(a.essay_draft_ids), 0) = 0 AND a.reminder_sent = false
        RETURNING a.id
      ), fixed_scholarships AS (
        UPDATE scholarships AS s SET deadline = $4::date, updated_at = now()
        FROM targets AS t WHERE s.id = t.id AND s.deadline = $3::date
        RETURNING s.id
      )
      SELECT (SELECT count(*) FROM fixed_scholarships)::int AS scholarships,
        (SELECT count(*) FROM fixed_applications)::int AS applications
    `, [correction.source, correction.slug, correction.previousDeadline, correction.deadline]);
  }
}

async function main() {
  if (process.env.VERCEL_ENV !== "production" || !process.env.DATABASE_URL?.trim()) {
    console.log("[merit correction] Skipped outside configured Vercel production.");
    return;
  }
  let sql;
  try {
    // Validate the local evidence and exact scope before opening a connection.
    deadlineCorrections();
    sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
    await sql.begin(async (tx) => {
      await tx`SET LOCAL search_path TO public`;
      await tx`SET LOCAL lock_timeout = '30s'`;
      await tx`SET LOCAL statement_timeout = '90s'`;
      await tx`SELECT pg_advisory_xact_lock(hashtext('meritously'), hashtext('c079-deadline-2026-09-29'))`;
      await syncMeritCorrections((query, parameters) => tx.unsafe(query, parameters));
    });
    console.log("[merit correction] Reviewed Forty Acres deadline sync completed.");
  } catch {
    console.error("[merit correction] Failed. Check catalog evidence, database availability and schema permissions.");
    process.exitCode = 1;
  } finally {
    if (sql) await sql.end({ timeout: 5 }).catch(() => { process.exitCode = 1; });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
