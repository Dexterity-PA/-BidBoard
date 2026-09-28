import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import postgres from "postgres";

const TABLES = ["newsletter_subscribers", "newsletter_cooldowns", "newsletter_batches", "newsletter_deliveries"];
const TEXT = "text";
const TIME = "timestamp with time zone";
const COLUMNS = {
  newsletter_subscribers: {
    id: [TEXT, true], email: [TEXT, true], status: [TEXT, true],
    confirmation_token_hash: [TEXT, false], confirmation_expires_at: [TIME, false],
    consented_at: [TIME, true], confirmed_at: [TIME, false], unsubscribed_at: [TIME, false],
    created_at: [TIME, true], updated_at: [TIME, true],
  },
  newsletter_cooldowns: { key: [TEXT, true], blocked_until: [TIME, true] },
  newsletter_batches: {
    id: [TEXT, true], week: [TEXT, true], status: [TEXT, true], content: ["jsonb", true],
    recipients: ["jsonb", true], payload: ["jsonb", false], attempt_id: [TEXT, true],
    first_attempt_at: [TIME, true], claimed_at: [TIME, true], sent_at: [TIME, false],
    provider_ids: ["jsonb", false], error: [TEXT, false],
  },
  newsletter_deliveries: { subscriber_id: [TEXT, true], week: [TEXT, true], batch_id: [TEXT, true] },
};
const SUBSCRIBER_DEFAULTS = {
  status: "'pending'::text",
  created_at: "now()",
  updated_at: "now()",
};

class MigrationCheckError extends Error {}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new MigrationCheckError(`Missing required setting: ${name}`);
  return value;
}

function productionSettings() {
  const databaseUrl = required("DATABASE_URL");
  const cronSecret = required("CRON_SECRET");
  required("RESEND_API_KEY");
  if (!(process.env.NEWSLETTER_SECRET?.trim() || cronSecret)) {
    throw new MigrationCheckError("A newsletter signing secret is required");
  }
  let database;
  let app;
  try { database = new URL(databaseUrl); }
  catch { throw new MigrationCheckError("DATABASE_URL must be a valid PostgreSQL URL"); }
  if (!["postgres:", "postgresql:"].includes(database.protocol) || !database.hostname || database.pathname.length < 2) {
    throw new MigrationCheckError("DATABASE_URL must identify a PostgreSQL database");
  }
  try { app = new URL(required("NEXT_PUBLIC_APP_URL")); }
  catch (error) {
    if (error instanceof MigrationCheckError) throw error;
    throw new MigrationCheckError("NEXT_PUBLIC_APP_URL must be a valid public HTTPS URL");
  }
  const host = app.hostname.toLowerCase().replace(/\.$/, "");
  if (app.protocol !== "https:" || app.username || app.password || !host.includes(".") ||
      isIP(host.replace(/^\[|\]$/g, "")) || /(?:^|\.)(localhost|local|internal|test|invalid|example)$/.test(host)) {
    throw new MigrationCheckError("NEXT_PUBLIC_APP_URL must use HTTPS with a non-local public hostname");
  }
  return databaseUrl;
}

function sameColumns(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

async function verifySchema(sql) {
  const tables = await sql`SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name = ANY(${TABLES}::text[])`;
  if (tables.length !== TABLES.length) throw new MigrationCheckError("Newsletter schema is missing a required table");
  const columns = await sql`SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ANY(${TABLES}::text[])`;
  for (const [table, expected] of Object.entries(COLUMNS)) {
    for (const [name, [type, notNull]] of Object.entries(expected)) {
      const actual = columns.find((column) => column.table_name === table && column.column_name === name);
      if (!actual || actual.data_type !== type || actual.is_nullable !== (notNull ? "NO" : "YES")) {
        throw new MigrationCheckError(`Newsletter schema mismatch: ${table}.${name}`);
      }
    }
  }
  for (const [name, expected] of Object.entries(SUBSCRIBER_DEFAULTS)) {
    const actual = columns.find((column) => column.table_name === "newsletter_subscribers" && column.column_name === name);
    if (actual?.column_default !== expected) {
      throw new MigrationCheckError(`Newsletter schema mismatch: newsletter_subscribers.${name} default`);
    }
  }

  const constraints = await sql`SELECT relation.relname AS table_name, constraint_row.contype,
      constraint_row.condeferrable, constraint_row.condeferred, constraint_row.confdeltype,
      referenced.relname AS referenced_table, referenced_namespace.nspname AS referenced_schema,
      ARRAY(SELECT attribute.attname::text FROM unnest(constraint_row.conkey) WITH ORDINALITY AS key(attnum, position)
        JOIN pg_attribute attribute ON attribute.attrelid = relation.oid AND attribute.attnum = key.attnum
        ORDER BY key.position) AS columns,
      ARRAY(SELECT attribute.attname::text FROM unnest(constraint_row.confkey) WITH ORDINALITY AS key(attnum, position)
        JOIN pg_attribute attribute ON attribute.attrelid = referenced.oid AND attribute.attnum = key.attnum
        ORDER BY key.position) AS referenced_columns
    FROM pg_constraint constraint_row
    JOIN pg_class relation ON relation.oid = constraint_row.conrelid
    JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
    LEFT JOIN pg_class referenced ON referenced.oid = constraint_row.confrelid
    LEFT JOIN pg_namespace referenced_namespace ON referenced_namespace.oid = referenced.relnamespace
    WHERE namespace.nspname = 'public' AND relation.relname = ANY(${TABLES}::text[])`;
  for (const [table, key] of [["newsletter_subscribers", "id"], ["newsletter_cooldowns", "key"], ["newsletter_batches", "id"]]) {
    if (!constraints.some((row) => row.table_name === table && row.contype === "p" && sameColumns(row.columns, [key]))) {
      throw new MigrationCheckError(`Newsletter schema is missing the primary key: ${table}`);
    }
  }
  const batchForeignKey = constraints.find((row) => row.table_name === "newsletter_deliveries" && row.contype === "f" &&
    sameColumns(row.columns, ["batch_id"]) && row.referenced_schema === "public" &&
    row.referenced_table === "newsletter_batches" && sameColumns(row.referenced_columns, ["id"]));
  if (!batchForeignKey?.condeferrable || !batchForeignKey.condeferred) {
    throw new MigrationCheckError("Newsletter delivery batch foreign key must be DEFERRABLE INITIALLY DEFERRED");
  }
  if (!constraints.some((row) => row.table_name === "newsletter_deliveries" && row.contype === "f" &&
      sameColumns(row.columns, ["subscriber_id"]) && row.referenced_schema === "public" &&
      row.referenced_table === "newsletter_subscribers" && sameColumns(row.referenced_columns, ["id"]) && row.confdeltype === "c")) {
    throw new MigrationCheckError("Newsletter delivery subscriber foreign key must cascade deletions");
  }

  const indexes = await sql`SELECT relation.relname AS table_name,
      ARRAY(SELECT attribute.attname::text FROM unnest(index_row.indkey::smallint[]) WITH ORDINALITY AS key(attnum, position)
        JOIN pg_attribute attribute ON attribute.attrelid = relation.oid AND attribute.attnum = key.attnum
        ORDER BY key.position) AS columns
    FROM pg_index index_row
    JOIN pg_class relation ON relation.oid = index_row.indrelid
    JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname = 'public' AND relation.relname = ANY(${TABLES}::text[])
      AND index_row.indisunique AND index_row.indisvalid AND index_row.indpred IS NULL AND index_row.indexprs IS NULL`;
  for (const [table, keys] of [["newsletter_subscribers", ["email"]], ["newsletter_subscribers", ["confirmation_token_hash"]],
    ["newsletter_deliveries", ["subscriber_id", "week"]]]) {
    if (!indexes.some((row) => row.table_name === table && sameColumns(row.columns, keys))) {
      throw new MigrationCheckError(`Newsletter schema is missing a required unique index: ${table}.${keys.join("+")}`);
    }
  }
}

async function main() {
  if (process.env.VERCEL_ENV !== "production") {
    console.log("[newsletter migration] Skipped outside Vercel production.");
    return;
  }
  let sql;
  try {
    // Validate every prerequisite before opening a connection or changing schema.
    const databaseUrl = productionSettings();
    const migration = (await readFile(new URL("./migrations/2026-09-28-newsletter.sql", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
    if ((migration.match(/^BEGIN;$/gm) ?? []).length !== 1 || (migration.match(/^COMMIT;$/gm) ?? []).length !== 1) {
      throw new MigrationCheckError("Newsletter migration must contain its reviewed transaction wrapper");
    }
    // The driver owns the transaction so schema verification can still roll back
    // all additions. Remove only the reviewed file's outer transaction commands.
    const statements = migration.replace(/^BEGIN;$/m, "").replace(/^COMMIT;$/m, "");
    sql = postgres(databaseUrl, { max: 1, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
    await sql.begin(async (transaction) => {
      await transaction`SET LOCAL search_path TO public`;
      await transaction`SET LOCAL lock_timeout = '30s'`;
      await transaction`SET LOCAL statement_timeout = '90s'`;
      await transaction`SELECT pg_advisory_xact_lock(hashtext('meritously'), hashtext('newsletter-2026-09-28'))`;
      await transaction.unsafe(statements);
      await verifySchema(transaction);
    });
    console.log("[newsletter migration] Production schema applied and verified.");
  } catch (error) {
    // Never print connection strings, query parameters, provider keys or stacks.
    const detail = error instanceof MigrationCheckError ? error.message : "Migration failed; inspect database availability and schema permissions.";
    const code = typeof error?.code === "string" && /^[A-Z0-9]{5}$/.test(error.code) ? ` (SQLSTATE ${error.code})` : "";
    console.error(`[newsletter migration] ${detail}${code}`);
    process.exitCode = 1;
  } finally {
    if (sql) {
      try { await sql.end({ timeout: 5 }); }
      catch {
        console.error("[newsletter migration] Could not close the database connection cleanly.");
        process.exitCode = 1;
      }
    }
  }
}

await main();
