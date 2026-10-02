import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { accountEvent, accountStatements, type AccountEvent } from "@/lib/accounts/events";

const database = new PGlite();
const time = 1_800_000_000_000;
function payload(overrides: Record<string, unknown> = {}, data: Record<string, unknown> = {}) {
  return { type: "user.created", timestamp: time, data: {
    id: "user_a", created_at: time - 1000, updated_at: time,
    primary_email_address_id: "primary",
    email_addresses: [{ id: "secondary", email_address: "secondary@example.test" }, { id: "primary", email_address: "primary@example.test" }],
    first_name: "First", last_name: "Student", ...data,
  }, ...overrides };
}
async function execute(event: AccountEvent) {
  return database.transaction(async (tx) => {
    let rows: unknown[] = [];
    for (const statement of accountStatements(event)) rows = (await tx.query(statement.query, statement.params)).rows;
    return rows;
  });
}
beforeAll(async () => {
  await database.exec(`CREATE TABLE users (id text PRIMARY KEY, email text UNIQUE NOT NULL, first_name text, last_name text, updated_at timestamp DEFAULT now());
    CREATE TABLE applications (id serial PRIMARY KEY, user_id text REFERENCES users(id) ON DELETE CASCADE, notes text);
    CREATE TABLE activity_log (id serial PRIMARY KEY, user_id text NOT NULL, metadata jsonb);`);
  await database.exec(await readFile(new URL("../scripts/migrations/2026-10-02-account-health.sql", import.meta.url), "utf8"));
}, 20_000);
beforeEach(async () => database.exec("TRUNCATE account_sync_state, users, applications, activity_log CASCADE"));
afterAll(() => database.close());

describe("Clerk account synchronization", () => {
  it("uses the explicit primary email and stores only hashed replay bookkeeping", async () => {
    const event = accountEvent(payload())!;
    expect(event.email).toBe("primary@example.test");
    expect(event.key).not.toContain(event.id);
    expect(await execute(event)).toEqual([{ inserted: true }]);
    const state = (await database.query("SELECT * FROM account_sync_state")).rows[0];
    expect(Object.keys(state as object).sort()).toEqual(["account_key", "deleted", "event_at", "version"]);
  });
  it("does not repeat creation side effects on duplicate delivery", async () => {
    const event = accountEvent(payload())!;
    expect(await execute(event)).toEqual([{ inserted: true }]);
    expect(await execute(event)).toEqual([]);
    expect((await database.query("SELECT count(*)::int AS count FROM users")).rows).toEqual([{ count: 1 }]);
  });
  it("preserves a newer primary email when updates arrive out of order", async () => {
    await execute(accountEvent(payload())!);
    await execute(accountEvent(payload({ type: "user.updated", timestamp: time + 200 }, { updated_at: time + 100,
      email_addresses: [{ id: "primary", email_address: "new@example.test" }], first_name: "New" }))!);
    await execute(accountEvent(payload({ type: "user.updated", timestamp: time + 300 }))!);
    expect((await database.query("SELECT email, first_name FROM users")).rows).toEqual([{ email: "new@example.test", first_name: "New" }]);
  });
  it("rolls back email collisions without deleting another student's saved work", async () => {
    await execute(accountEvent(payload())!);
    await database.query("INSERT INTO applications (user_id, notes) VALUES ('user_a', 'Keep my essay notes')");
    await expect(execute(accountEvent(payload({}, { id: "user_b" }))!)).rejects.toThrow();
    expect((await database.query("SELECT notes FROM applications")).rows).toEqual([{ notes: "Keep my essay notes" }]);
    expect((await database.query("SELECT count(*)::int AS count FROM account_sync_state")).rows).toEqual([{ count: 1 }]);
  });
  it("cleans account data and activity when deleted and never revives a deleted identity", async () => {
    await execute(accountEvent(payload())!);
    await database.exec("INSERT INTO applications (user_id, notes) VALUES ('user_a', 'Private'); INSERT INTO activity_log (user_id, metadata) VALUES ('user_a', '{}')");
    const deletion = accountEvent({ type: "user.deleted", timestamp: time + 100, data: { id: "user_a" } })!;
    await execute(deletion);
    await execute(deletion);
    expect(await execute(accountEvent(payload({ timestamp: time + 400 }, { updated_at: time + 300 }))!)).toEqual([]);
    for (const table of ["users", "applications", "activity_log"]) {
      expect((await database.query(`SELECT count(*)::int AS count FROM ${table}`)).rows).toEqual([{ count: 0 }]);
    }
  });
  it("handles deletion arriving before creation", async () => {
    await execute(accountEvent({ type: "user.deleted", timestamp: time + 100, data: { id: "user_a" } })!);
    expect(await execute(accountEvent(payload())!)).toEqual([]);
  });
  it("keeps normal user updates from retriggering welcome mail", async () => {
    await execute(accountEvent(payload())!);
    expect(await execute(accountEvent(payload({ type: "user.updated", timestamp: time + 10 }, { updated_at: time + 10 }))!)).toEqual([{ inserted: false }]);
  });
  it("never falls back to a secondary address when the primary is missing", () => {
    expect(() => accountEvent(payload({}, { primary_email_address_id: "missing" }))).toThrow("primary");
  });
  it("rejects missing identity or invalid event timestamps before writing", () => {
    expect(() => accountEvent(payload({ timestamp: "today" }))).toThrow();
    expect(() => accountEvent(payload({}, { id: "" }))).toThrow();
    expect(accountEvent({ type: "session.created" })).toBeNull();
  });
  it("allows the same email for a new account after the old account was deleted", async () => {
    await execute(accountEvent(payload())!);
    await execute(accountEvent({ type: "user.deleted", timestamp: time + 10, data: { id: "user_a" } })!);
    expect(await execute(accountEvent(payload({}, { id: "user_b" }))!)).toEqual([{ inserted: true }]);
  });
  it("can rerun the additive migration without losing account state", async () => {
    await execute(accountEvent(payload())!);
    await database.exec(await readFile(new URL("../scripts/migrations/2026-10-02-account-health.sql", import.meta.url), "utf8"));
    expect(await execute(accountEvent(payload())!)).toEqual([]);
  });
});
