import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (process.env.VERCEL_ENV !== "production") {
  console.log("[analytics migration] Skipped outside Vercel production.");
} else {
  let sql;
  try {
    if (!process.env.DATABASE_URL) throw new Error("Missing database configuration");
    if (process.env.ANALYTICS_ENABLED === "true" && (!process.env.ANALYTICS_SECRET || !process.env.ANALYTICS_ADMIN_EMAIL)) {
      throw new Error("Missing analytics configuration");
    }
    const migration = await readFile(new URL("./migrations/2026-09-28-analytics.sql", import.meta.url), "utf8");
    sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
    await sql.begin(async (tx) => {
      await tx`SET LOCAL search_path TO public`;
      await tx`SET LOCAL lock_timeout = '30s'`;
      await tx`SET LOCAL statement_timeout = '90s'`;
      await tx`SELECT pg_advisory_xact_lock(hashtext('meritously'), hashtext('analytics-2026-09-28'))`;
      await tx.unsafe(migration);
      const rows = await tx`SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name IN ('analytics_events', 'analytics_rate_limits')`;
      const expected = {
        analytics_events: { id: ['text', 'NO'], kind: ['text', 'NO'], browser_hash: ['text', 'YES'], session_hash: ['text', 'YES'], path: ['text', 'YES'], source: ['text', 'YES'], campaign: ['text', 'YES'], referrer: ['text', 'YES'], created_at: ['timestamp with time zone', 'NO'] },
        analytics_rate_limits: { key: ['text', 'NO'], count: ['integer', 'NO'], expires_at: ['timestamp with time zone', 'NO'] },
      };
      for (const [table, columns] of Object.entries(expected)) {
        for (const [column, [type, nullable]] of Object.entries(columns)) {
          if (!rows.some((row) => row.table_name === table && row.column_name === column && row.data_type === type && row.is_nullable === nullable)) throw new Error('Analytics schema mismatch');
        }
      }
      const keys = await tx`SELECT t.relname AS name, a.attname AS column_name FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
        WHERE n.nspname = 'public' AND t.relname IN ('analytics_events', 'analytics_rate_limits')
          AND i.indisprimary AND i.indisvalid AND i.indimmediate AND i.indnatts = 1`;
      if (!keys.some((row) => row.name === 'analytics_events' && row.column_name === 'id') ||
          !keys.some((row) => row.name === 'analytics_rate_limits' && row.column_name === 'key')) throw new Error('Analytics primary key mismatch');
    });
    console.log("[analytics migration] Production schema applied and verified.");
  } catch {
    console.error("[analytics migration] Failed. Check required settings, database permissions and schema compatibility.");
    process.exitCode = 1;
  } finally {
    if (sql) await sql.end({ timeout: 5 }).catch(() => { process.exitCode = 1; });
  }
}
