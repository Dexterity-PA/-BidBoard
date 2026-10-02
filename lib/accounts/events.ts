import { createHash } from "node:crypto";

export type AccountEvent = {
  id: string;
  key: string;
  version: number;
  timestamp: number;
  deleted: boolean;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: number | null;
};

function millis(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new Error("Invalid account timestamp");
  return value;
}

/** Called only after verifying the webhook signature, or with a server-fetched Clerk user. */
export function accountEvent(event: unknown): AccountEvent | null {
  if (!event || typeof event !== "object") throw new Error("Invalid account event");
  const input = event as Record<string, unknown>;
  if (!["user.created", "user.updated", "user.deleted"].includes(String(input.type))) return null;
  const data = input.data as Record<string, unknown> | undefined;
  if (!data || typeof data.id !== "string" || !/^user_[A-Za-z0-9_]{1,100}$/.test(data.id))
    throw new Error("Invalid account identity");
  const timestamp = millis(input.timestamp);
  const deleted = input.type === "user.deleted";
  const base = {
    id: data.id,
    key: createHash("sha256").update(`meritously-account:${data.id}`).digest("hex"),
    version: deleted ? timestamp : millis(data.updated_at),
    timestamp,
    deleted,
    createdAt: deleted ? null : millis(data.created_at),
  };
  if (deleted) return { ...base, email: null, firstName: null, lastName: null };
  if (!Array.isArray(data.email_addresses)) throw new Error("Missing account email");
  const primary = data.email_addresses.find((email) => email?.id === data.primary_email_address_id);
  if (!primary || typeof primary.email_address !== "string" ||
      primary.email_address.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primary.email_address))
    throw new Error("Missing primary account email");
  const name = (value: unknown) => typeof value === "string" ? value.slice(0, 256) : null;
  return { ...base, email: primary.email_address.trim().toLowerCase(), firstName: name(data.first_name), lastName: name(data.last_name) };
}

export function accountStatements(event: AccountEvent): { query: string; params: unknown[] }[] {
  // Neon executes this array in one transaction. The lock serializes delivery and local recovery for this account.
  const lock = { query: "SELECT pg_advisory_xact_lock(hashtext('meritously-account'), hashtext($1))", params: [event.key] };
  if (event.deleted) return [lock, {
    query: `INSERT INTO account_sync_state (account_key, version, event_at, deleted)
      VALUES ($1, $2, $3, true) ON CONFLICT (account_key) DO UPDATE
      SET deleted = true, version = GREATEST(account_sync_state.version, EXCLUDED.version),
          event_at = GREATEST(account_sync_state.event_at, EXCLUDED.event_at)`,
    params: [event.key, event.version, event.timestamp],
  }, { query: "DELETE FROM activity_log WHERE user_id = $1", params: [event.id] },
  { query: "DELETE FROM users WHERE id = $1 RETURNING id", params: [event.id] }];
  return [lock, {
    query: `WITH accepted AS (
      INSERT INTO account_sync_state (account_key, version, event_at, deleted)
      VALUES ($1, $2, $3, false)
      ON CONFLICT (account_key) DO UPDATE SET version = EXCLUDED.version, event_at = EXCLUDED.event_at
      WHERE NOT account_sync_state.deleted AND
        (EXCLUDED.version, EXCLUDED.event_at) > (account_sync_state.version, account_sync_state.event_at)
      RETURNING account_key
    ), previous AS (SELECT id FROM users WHERE id = $4)
    INSERT INTO users (id, email, first_name, last_name)
      SELECT $4, $5, $6, $7 FROM accepted
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email,
      first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = now()
    RETURNING NOT EXISTS (SELECT 1 FROM previous) AS inserted`,
    params: [event.key, event.version, event.timestamp, event.id, event.email, event.firstName, event.lastName],
  }];
}
