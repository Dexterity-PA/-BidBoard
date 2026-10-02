import "server-only";
import { neon } from "@neondatabase/serverless";
import { accountStatements, type AccountEvent } from "./events";

export async function syncAccount(event: AccountEvent): Promise<{ applied: boolean; inserted: boolean }> {
  const connection = neon(process.env.DATABASE_URL!);
  const statements = accountStatements(event);
  const results = await connection.transaction(statements.map(({ query, params }) => connection(query, params)));
  const rows = results[results.length - 1] as { inserted?: boolean }[];
  return { applied: rows.length > 0, inserted: !event.deleted && rows[0]?.inserted === true };
}
