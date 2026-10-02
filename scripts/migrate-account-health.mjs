import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (process.env.VERCEL_ENV !== "production") {
  console.log("[account-health migration] Skipped outside Vercel production.");
} else {
  let connection;
  try {
    if (!process.env.DATABASE_URL) throw new Error("Missing database configuration");
    const migration = await readFile(new URL("./migrations/2026-10-02-account-health.sql", import.meta.url), "utf8");
    connection = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
    await connection.begin(async (tx) => {
      await tx`SET LOCAL search_path TO public`;
      await tx`SET LOCAL lock_timeout = '30s'`;
      await tx`SET LOCAL statement_timeout = '90s'`;
      await tx`SELECT pg_advisory_xact_lock(hashtext('meritously'), hashtext('account-health-2026-10-02'))`;
      await tx.unsafe(migration);
      const expected = {
        account_sync_state: { account_key: ["text", "NO"], version: ["bigint", "NO"], event_at: ["bigint", "NO"], deleted: ["boolean", "NO"] },
        operational_alerts: { key: ["text", "NO"], component: ["text", "NO"], code: ["text", "NO"], status: ["text", "NO"], created_at: ["timestamp with time zone", "NO"] },
        operational_events: { id: ["uuid", "NO"], component: ["text", "NO"], code: ["text", "NO"], created_at: ["timestamp with time zone", "NO"] },
        scheduled_job_runs: { id: ["uuid", "NO"], job: ["text", "NO"], started_at: ["timestamp with time zone", "NO"], finished_at: ["timestamp with time zone", "YES"], status: ["text", "NO"], failed: ["integer", "NO"] },
        health_monitor_config: { id: ["integer", "NO"], started_at: ["timestamp with time zone", "NO"] },
      };
      const columns = await tx`SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ANY(${Object.keys(expected)}::text[])`;
      for (const [table, fields] of Object.entries(expected)) {
        for (const [name, [type, nullable]] of Object.entries(fields)) {
          if (!columns.some((row) => row.table_name === table && row.column_name === name && row.data_type === type && row.is_nullable === nullable)) throw new Error("Schema mismatch");
        }
      }
      const keys = await tx`SELECT t.relname AS name, a.attname AS column_name FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
        WHERE n.nspname = 'public' AND t.relname = ANY(${Object.keys(expected)}::text[])
          AND i.indisprimary AND i.indisvalid AND i.indnatts = 1`;
      for (const table of Object.keys(expected)) {
        if (!keys.some((row) => row.name === table && row.column_name === (table === "account_sync_state" ? "account_key" : table === "operational_alerts" ? "key" : "id"))) throw new Error("Primary key mismatch");
      }
    });
    console.log("[account-health migration] Production schema applied and verified.");
  } catch {
    console.error("[account-health migration] Failed. Check database permissions and schema compatibility.");
    process.exitCode = 1;
  } finally { if (connection) await connection.end({ timeout: 5 }).catch(() => { process.exitCode = 1; }); }
}
