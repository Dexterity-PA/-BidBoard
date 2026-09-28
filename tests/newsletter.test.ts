import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";

const mock = vi.hoisted(() => ({
  send: vi.fn(), batchSend: vi.fn(),
  claimCooldown: vi.fn(), releaseCooldown: vi.fn(), reservePendingSubscription: vi.fn(),
  confirmSubscription: vi.fn(), unsubscribe: vi.fn(), reserveDigestBatch: vi.fn(),
  claimRetryBatch: vi.fn(), confirmedBatchRecipients: vi.fn(), saveBatchPayload: vi.fn(), finishBatch: vi.fn(), hasUnclaimedRecipients: vi.fn(),
}));
vi.mock("@/lib/email/client", () => ({ FROM_EMAIL: "newsletter@example.com", getResend: () => ({ emails: { send: mock.send }, batch: { send: mock.batchSend } }) }));
vi.mock("@/lib/newsletter/repository", () => ({
  claimCooldown: mock.claimCooldown, releaseCooldown: mock.releaseCooldown,
  reservePendingSubscription: mock.reservePendingSubscription,
  confirmSubscription: mock.confirmSubscription, unsubscribe: mock.unsubscribe,
  reserveDigestBatch: mock.reserveDigestBatch, claimRetryBatch: mock.claimRetryBatch,
  confirmedBatchRecipients: mock.confirmedBatchRecipients, saveBatchPayload: mock.saveBatchPayload,
  finishBatch: mock.finishBatch, hasUnclaimedRecipients: mock.hasUnclaimedRecipients,
}));

import { confirmNewsletter, NewsletterInputError, requestNewsletterSubscription, unsubscribeNewsletter } from "@/lib/newsletter/service";
import { buildDigestContent, digestWeek, runNewsletterDigest } from "@/lib/newsletter/digest";
import { confirmationToken, cooldownKey, hashConfirmationToken, normalizeNewsletterEmail, subscriberIdFromUnsubscribeToken, unsubscribeToken } from "@/lib/newsletter/tokens";
import { POST as subscribeRoute } from "@/app/api/newsletter/subscribe/route";
import { POST as confirmRoute } from "@/app/api/newsletter/confirm/route";
import { POST as unsubscribeRoute } from "@/app/api/newsletter/unsubscribe/route";
import { GET as cronRoute } from "@/app/api/cron/weekly-digest/route";
import { LISTINGS } from "@/lib/merit/catalog";
import type { NewsletterBatch } from "@/db/newsletter-schema";
import type { NewsletterMessage, NewsletterRecipient } from "@/lib/newsletter/types";

const now = new Date("2026-09-28T15:00:00.000Z");
const subscriberId = "77777777-7777-4777-8777-777777777777";
const input = { email: " Student@Example.com ", consent: true, ip: "192.0.2.1" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEWSLETTER_SECRET", "newsletter-test-secret-only");
  vi.stubEnv("CRON_SECRET", "cron-test-secret-only");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.bidboard.app");
  mock.send.mockResolvedValue({ data: { id: "provider-message-id" }, error: null });
  mock.claimCooldown.mockResolvedValue(true);
  mock.reservePendingSubscription.mockResolvedValue({ id: subscriberId, email: "student@example.com", status: "pending" });
  mock.confirmSubscription.mockResolvedValue(true);
  mock.unsubscribe.mockResolvedValue(true);
  mock.batchSend.mockImplementation(async (payload) => ({ data: { data: payload.map((_: unknown, index: number) => ({ id: `provider-${index}` })) }, error: null }));
  mock.reserveDigestBatch.mockResolvedValue(null).mockResolvedValueOnce(batch());
  mock.claimRetryBatch.mockResolvedValue(null);
  mock.confirmedBatchRecipients.mockResolvedValue([{ id: subscriberId, email: "student@example.com" }]);
  mock.saveBatchPayload.mockImplementation(async (claimed, payload) => ({ ...claimed, payload }));
  mock.finishBatch.mockResolvedValue(undefined);
  mock.hasUnclaimedRecipients.mockResolvedValue(false);
});

function batch(recipients: NewsletterRecipient[] = [{ id: subscriberId, email: "student@example.com" }]): NewsletterBatch {
  return {
    id: randomUUID(), week: "2026-09-28", status: "sending", content: buildDigestContent(now),
    recipients, payload: null, attemptId: randomUUID(), firstAttemptAt: now, claimedAt: now,
    sentAt: null, providerIds: null, error: null,
  };
}

function preparedMessage(recipient: NewsletterRecipient): NewsletterMessage {
  return { from: "newsletter@example.com", to: recipient.email, subject: "Stored subject", html: "<p>Stored content</p>", text: "Stored content", headers: {} };
}

describe("newsletter double opt-in", () => {
  it("normalizes email and requires a separate explicit consent", async () => {
    expect(normalizeNewsletterEmail(input.email)).toBe("student@example.com");
    expect(normalizeNewsletterEmail("user@example.com\nBcc: victim@example.com")).toBeNull();
    await expect(requestNewsletterSubscription({ ...input, consent: false }, now)).rejects.toBeInstanceOf(NewsletterInputError);
    await expect(requestNewsletterSubscription({ ...input, consent: "true" }, now)).rejects.toBeInstanceOf(NewsletterInputError);
    expect(mock.reservePendingSubscription).not.toHaveBeenCalled();
    expect(mock.send).not.toHaveBeenCalled();
  });

  it("saves a hash and 24-hour expiry, and only sends a confirmation", async () => {
    await requestNewsletterSubscription(input, now);
    const [email, storedHash, expiry] = mock.reservePendingSubscription.mock.calls[0];
    expect(email).toBe("student@example.com");
    expect(expiry).toEqual(new Date("2026-09-29T15:00:00.000Z"));
    const message = mock.send.mock.calls[0][0];
    const token = /newsletter\/confirm\?token=([a-f0-9]{64})/.exec(message.text)?.[1];
    expect(token).toBeTruthy();
    expect(storedHash).toBe(hashConfirmationToken(token!));
    expect(storedHash).not.toBe(token);
    expect(message.subject).toBe("Confirm your Meritously weekly digest");
    expect(mock.confirmSubscription).not.toHaveBeenCalled();
  });

  it("does not email a confirmed subscriber again", async () => {
    mock.reservePendingSubscription.mockResolvedValue(null);
    await requestNewsletterSubscription(input, now);
    expect(mock.send).not.toHaveBeenCalled();
  });

  it("honors durable IP and normalized-email cooldowns", async () => {
    mock.claimCooldown.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await requestNewsletterSubscription(input, now);
    expect(mock.claimCooldown).toHaveBeenNthCalledWith(1, cooldownKey("ip", `${input.ip}\0${0}`), new Date(now.getTime() + 60_000), now);
    expect(mock.claimCooldown).toHaveBeenNthCalledWith(2, cooldownKey("email", "student@example.com"), new Date(now.getTime() + 900_000), now);
    expect(mock.send).not.toHaveBeenCalled();
    expect(mock.reservePendingSubscription).not.toHaveBeenCalled();
  });

  it.each([
    { data: null, error: { message: "Provider rejected" } },
    { data: null, error: null },
    { data: { id: "" }, error: null },
  ])("surfaces provider failure and releases cooldowns (%j)", async (response) => {
    mock.send.mockResolvedValue(response);
    await expect(requestNewsletterSubscription(input, now)).rejects.toThrow();
    expect(mock.releaseCooldown).toHaveBeenCalledTimes(2);
    expect(mock.confirmSubscription).not.toHaveBeenCalled();
  });

  it("rejects malformed confirmation tokens and delegates valid-token expiry checks", async () => {
    expect(await confirmNewsletter("bad", now)).toBe(false);
    expect(mock.confirmSubscription).not.toHaveBeenCalled();
    const token = confirmationToken();
    mock.confirmSubscription.mockResolvedValue(false);
    expect(await confirmNewsletter(token, now)).toBe(false);
    expect(mock.confirmSubscription).toHaveBeenCalledWith(hashConfirmationToken(token), now);
  });

  it("uses separate authenticated unsubscribe tokens and rejects tampering", async () => {
    const token = unsubscribeToken(subscriberId);
    expect(subscriberIdFromUnsubscribeToken(token)).toBe(subscriberId);
    expect(subscriberIdFromUnsubscribeToken(`${subscriberId}.${"0".repeat(64)}`)).toBeNull();
    expect(subscriberIdFromUnsubscribeToken(confirmationToken())).toBeNull();
    expect(await unsubscribeNewsletter(token, now)).toBe(true);
    expect(mock.unsubscribe).toHaveBeenCalledWith(subscriberId, now);
    expect(cooldownKey("email", subscriberId)).not.toBe(token.split(".")[1]);
  });
});

describe("confirmed-only weekly delivery", () => {
  it("selects upcoming active source-linked awards and stable UTC weeks", () => {
    const base = LISTINGS[0];
    const listings = [
      { ...base, id: "valid", status: "live" as const, deadlineDate: "2026-09-30", sources: ["https://official.example/award"] },
      { ...base, id: "closed", status: "live" as const, deadlineDate: "2026-09-01" },
      { ...base, id: "watch", status: "watchlist" as const, deadlineDate: "2026-09-30" },
      { ...base, id: "unsourced", status: "live" as const, deadlineDate: "2026-09-30", sources: [] },
      { ...base, id: "future", status: "live" as const, deadlineDate: "2026-12-01" },
    ];
    expect(buildDigestContent(now, listings).awards.map((award) => award.id)).toEqual(["valid"]);
    expect(digestWeek(new Date("2026-10-04T23:59:59Z"))).toBe("2026-09-28");
    expect(digestWeek(new Date("2026-10-05T00:00:00Z"))).toBe("2026-10-05");
  });

  it("rechecks opt-out after claiming, before sending", async () => {
    mock.confirmedBatchRecipients.mockResolvedValue([]);
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result).toMatchObject({ sent: 0, skipped: 1 });
    expect(mock.batchSend).not.toHaveBeenCalled();
    expect(mock.finishBatch.mock.calls[0][1].status).toBe("skipped");
  });

  it("does not send without acquiring a durable batch claim", async () => {
    mock.reserveDigestBatch.mockReset().mockResolvedValue(null);
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result.sent).toBe(0);
    expect(mock.batchSend).not.toHaveBeenCalled();
  });

  it("reuses exact stored messages and a stable batch idempotency key", async () => {
    const claimed = batch();
    claimed.payload = claimed.recipients.map(preparedMessage);
    mock.reserveDigestBatch.mockReset().mockResolvedValueOnce(claimed).mockResolvedValue(null);
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result.sent).toBe(1);
    expect(mock.saveBatchPayload).not.toHaveBeenCalled();
    expect(mock.batchSend.mock.calls[0]).toEqual([claimed.payload, { idempotencyKey: `newsletter-batch/${claimed.id}` }]);
    expect(mock.finishBatch.mock.calls[0][1]).toEqual({ status: "sent", providerIds: ["provider-0"] });
  });

  it.each([
    { data: null, error: { message: "Rejected" } },
    { data: { data: [] }, error: null },
    { data: { data: [{ id: "" }] }, error: null },
  ])("never records an incomplete or rejected batch as sent (%j)", async (response) => {
    mock.batchSend.mockResolvedValue(response);
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result).toMatchObject({ sent: 0, failed: 1 });
    expect(mock.batchSend).toHaveBeenCalledTimes(2);
    expect(mock.finishBatch.mock.calls.every((call) => call[1].status !== "sent")).toBe(true);
  });

  it("rechecks opt-outs before the immediate retry", async () => {
    mock.batchSend.mockResolvedValueOnce({ data: null, error: { message: "Transient error" } });
    mock.confirmedBatchRecipients.mockResolvedValueOnce([{ id: subscriberId, email: "student@example.com" }]).mockResolvedValueOnce([]);
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result).toMatchObject({ sent: 0, skipped: 1 });
    expect(mock.batchSend).toHaveBeenCalledTimes(1);
  });

  it("recovers a transient failure immediately with the identical batch", async () => {
    mock.batchSend.mockResolvedValueOnce({ data: null, error: { message: "Transient error" } });
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result.sent).toBe(1);
    expect(mock.batchSend.mock.calls[0]).toEqual(mock.batchSend.mock.calls[1]);
  });

  it("supports 10,000 recipients through 100 bounded provider batches", async () => {
    const batches = Array.from({ length: 100 }, (_, group) => {
      const recipients = Array.from({ length: 100 }, (_, index) => ({ id: randomUUID(), email: `student-${group}-${index}@example.com` }));
      const claimed = batch(recipients);
      claimed.payload = recipients.map(preparedMessage);
      return claimed;
    });
    const recipients = new Map(batches.flatMap((claimed) => claimed.recipients.map((recipient) => [recipient.id, recipient] as const)));
    let cursor = 0;
    mock.reserveDigestBatch.mockReset().mockImplementation(async () => batches[cursor++] ?? null);
    mock.confirmedBatchRecipients.mockImplementation(async (ids: string[]) => ids.map((id) => recipients.get(id)));
    const result = await runNewsletterDigest(now, { pause: async () => {} });
    expect(result).toMatchObject({ sent: 10_000, batches: 100, backlog: false });
    expect(mock.batchSend).toHaveBeenCalledTimes(100);
    expect(mock.batchSend.mock.calls.every((call) => call[0].length === 100)).toBe(true);
  });

  it("reports work left when its bounded batch cap is reached", async () => {
    mock.hasUnclaimedRecipients.mockResolvedValue(true);
    const result = await runNewsletterDigest(now, { pause: async () => {}, maxBatches: 1 });
    expect(result).toMatchObject({ sent: 1, batches: 1, backlog: true });
  });
});

describe("public API contracts", () => {
  function json(path: string, body: unknown) {
    return new Request(`https://www.bidboard.app${path}`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.1" }, body: JSON.stringify(body) });
  }

  it("gives existing confirmed and new requests the same generic response", async () => {
    const first = await subscribeRoute(json("/api/newsletter/subscribe", input));
    mock.reservePendingSubscription.mockResolvedValue(null);
    const existing = await subscribeRoute(json("/api/newsletter/subscribe", input));
    expect(first.status).toBe(202);
    expect(await first.json()).toEqual(await existing.json());
  });

  it("returns 503 when the provider fails, without exposing subscriber state", async () => {
    mock.send.mockResolvedValue({ data: null, error: { message: "Private provider error" } });
    const response = await subscribeRoute(json("/api/newsletter/subscribe", input));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("Private provider error");
  });

  it("accepts confirmation forms and signed one-click unsubscribe POSTs", async () => {
    const confirmation = await confirmRoute(new Request("https://www.bidboard.app/api/newsletter/confirm", { method: "POST", body: new URLSearchParams({ token: confirmationToken() }) }));
    expect(await confirmation.json()).toEqual({ ok: true, status: "confirmed" });
    const response = await unsubscribeRoute(new Request(`https://www.bidboard.app/api/newsletter/unsubscribe?token=${unsubscribeToken(subscriberId)}`, { method: "POST", body: "List-Unsubscribe=One-Click" }));
    expect(await response.json()).toEqual({ ok: true, status: "unsubscribed" });
  });

  it("rejects unauthenticated cron requests before querying recipients", async () => {
    const response = await cronRoute(new Request("https://www.bidboard.app/api/cron/weekly-digest"));
    expect(response.status).toBe(401);
    expect(mock.reserveDigestBatch).not.toHaveBeenCalled();
  });
});
