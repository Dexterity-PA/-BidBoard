import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Webhook } from "svix";
const mock = vi.hoisted(() => ({ headers: vi.fn(), sync: vi.fn(), after: vi.fn(), welcome: vi.fn(), conversion: vi.fn(), issue: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: mock.headers }));
vi.mock("next/server", () => ({ after: mock.after }));
vi.mock("@/lib/accounts/sync", () => ({ syncAccount: mock.sync }));
vi.mock("@/lib/email/send/welcome", () => ({ sendWelcomeEmail: mock.welcome }));
vi.mock("@/lib/analytics/server", () => ({ recordConversion: mock.conversion }));
vi.mock("@/lib/health/server", () => ({ recordOperationalIssue: mock.issue }));
import { POST } from "@/app/api/auth/webhook/route";
const secret = `whsec_${Buffer.from("synthetic-webhook-signing-secret").toString("base64")}`;
function payload(type = "user.created") {
  const now = Date.now();
  return { type, timestamp: now, data: { id: "user_test", updated_at: now, created_at: now,
    primary_email_address_id: "primary", email_addresses: [{ id: "secondary", email_address: "wrong@example.test" }, { id: "primary", email_address: "primary@example.test" }], first_name: "Student" } };
}
function signedRequest(body: unknown) {
  const text = JSON.stringify(body), date = new Date(), id = "msg_test";
  const signature = new Webhook(secret).sign(id, date, text);
  mock.headers.mockResolvedValue(new Headers({ "svix-id": id, "svix-timestamp": String(Math.floor(date.getTime() / 1000)), "svix-signature": signature }));
  return new Request("https://meritously.com/api/auth/webhook", { method: "POST", body: text });
}
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("CLERK_WEBHOOK_SECRET", secret); mock.sync.mockResolvedValue({ applied: true, inserted: true }); });
afterEach(() => vi.unstubAllEnvs());
it("validates real signatures before syncing and sends only to the explicit primary email", async () => {
  expect((await POST(signedRequest(payload()))).status).toBe(200);
  expect(mock.sync.mock.calls[0][0].email).toBe("primary@example.test");
  expect(mock.welcome).not.toHaveBeenCalled();
  await mock.after.mock.calls[0][0]();
  expect(mock.welcome).toHaveBeenCalledWith({ userId: "user_test", email: "primary@example.test", firstName: "Student" });
});
it("rejects signed payload tampering without writes or mail", async () => {
  signedRequest(payload());
  const altered = new Request("https://meritously.com/api/auth/webhook", { method: "POST", body: JSON.stringify({ ...payload(), data: { id: "user_attacker" } }) });
  expect((await POST(altered)).status).toBe(400);
  expect(mock.sync).not.toHaveBeenCalled(); expect(mock.after).not.toHaveBeenCalled();
});
it("returns a retryable failure without leaking database details or sending welcome email", async () => {
  mock.sync.mockRejectedValue(new Error("private database credentials"));
  const response = await POST(signedRequest(payload()));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("credentials");
  expect(mock.issue).toHaveBeenCalledWith("accounts", "sync_failed");
  expect(mock.after).not.toHaveBeenCalled(); expect(mock.conversion).not.toHaveBeenCalled();
});
it("does not repeat mail or conversions on duplicate or stale delivery", async () => {
  mock.sync.mockResolvedValue({ applied: false, inserted: false });
  expect((await POST(signedRequest(payload()))).status).toBe(200);
  expect(mock.after).not.toHaveBeenCalled(); expect(mock.conversion).not.toHaveBeenCalled();
});
it("accepts signed account deletion with no email requirement or creation side effects", async () => {
  mock.sync.mockResolvedValue({ applied: true, inserted: false });
  expect((await POST(signedRequest({ type: "user.deleted", timestamp: Date.now(), data: { id: "user_test" } }))).status).toBe(200);
  expect(mock.sync.mock.calls[0][0].deleted).toBe(true);
  expect(mock.after).not.toHaveBeenCalled(); expect(mock.conversion).not.toHaveBeenCalled();
});
