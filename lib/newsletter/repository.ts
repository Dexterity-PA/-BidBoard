import { randomUUID } from "node:crypto";
import { and, eq, gt, inArray, isNull, lt, lte, ne, notInArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { newsletterBatches, newsletterCooldowns, newsletterDeliveries, newsletterSubscribers, type NewsletterBatch } from "@/db/newsletter-schema";
import type { NewsletterDigestContent, NewsletterMessage } from "./types";
import { recordConversion } from "@/lib/analytics/server";

export async function claimCooldown(key: string, blockedUntil: Date, now: Date) {
  const rows = await db.insert(newsletterCooldowns).values({ key, blockedUntil })
    .onConflictDoUpdate({ target: newsletterCooldowns.key, set: { blockedUntil }, setWhere: lte(newsletterCooldowns.blockedUntil, now) })
    .returning({ key: newsletterCooldowns.key });
  return rows.length === 1;
}

export async function releaseCooldown(key: string, blockedUntil: Date) {
  await db.delete(newsletterCooldowns).where(and(eq(newsletterCooldowns.key, key), eq(newsletterCooldowns.blockedUntil, blockedUntil)));
}

export async function reservePendingSubscription(email: string, tokenHash: string, expiresAt: Date, now: Date) {
  const values = {
    status: "pending" as const,
    confirmationTokenHash: tokenHash,
    confirmationExpiresAt: expiresAt,
    consentedAt: now,
    confirmedAt: null,
    unsubscribedAt: null,
    updatedAt: now,
  };
  const rows = await db.insert(newsletterSubscribers).values({ id: randomUUID(), email, ...values })
    .onConflictDoUpdate({ target: newsletterSubscribers.email, set: values, setWhere: ne(newsletterSubscribers.status, "confirmed") })
    .returning();
  return rows[0] ?? null;
}

export async function confirmSubscription(tokenHash: string, now: Date) {
  const rows = await db.update(newsletterSubscribers).set({
    status: "confirmed", confirmedAt: now, updatedAt: now,
    confirmationTokenHash: null, confirmationExpiresAt: null,
  }).where(and(eq(newsletterSubscribers.confirmationTokenHash, tokenHash), eq(newsletterSubscribers.status, "pending"), gt(newsletterSubscribers.confirmationExpiresAt, now)))
    .returning({ id: newsletterSubscribers.id });
  if (rows[0]) await recordConversion("newsletter", rows[0].id);
  return rows.length === 1;
}

export async function unsubscribe(subscriberId: string, now: Date) {
  const rows = await db.update(newsletterSubscribers).set({
    status: "unsubscribed", unsubscribedAt: now, updatedAt: now,
    confirmationTokenHash: null, confirmationExpiresAt: null,
  }).where(eq(newsletterSubscribers.id, subscriberId)).returning({ id: newsletterSubscribers.id });
  return rows.length === 1;
}

// New subscriber/week claims and their exact batch audience are committed in
// one statement. The unique membership index also protects overlapping crons.
export async function reserveDigestBatch(content: NewsletterDigestContent, now: Date) {
  const batchId = randomUUID();
  const attemptId = randomUUID();
  const result = await db.execute(sql`
    WITH candidates AS MATERIALIZED (
      SELECT s.id, s.email FROM newsletter_subscribers s
      WHERE s.status = 'confirmed' AND NOT EXISTS (
        SELECT 1 FROM newsletter_deliveries d
        WHERE d.subscriber_id = s.id AND d.week = ${content.week}
      )
      ORDER BY s.id LIMIT 100 FOR UPDATE OF s SKIP LOCKED
    ), claims AS (
      INSERT INTO newsletter_deliveries (subscriber_id, week, batch_id)
      SELECT id, ${content.week}, ${batchId} FROM candidates
      ON CONFLICT (subscriber_id, week) DO NOTHING
      RETURNING subscriber_id
    ), new_batch AS (
      INSERT INTO newsletter_batches
        (id, week, status, content, recipients, attempt_id, first_attempt_at, claimed_at)
      SELECT ${batchId}, ${content.week}, 'sending', ${JSON.stringify(content)}::jsonb,
        jsonb_agg(jsonb_build_object('id', c.id, 'email', c.email) ORDER BY c.id),
        ${attemptId}, ${now.toISOString()}::timestamptz, ${now.toISOString()}::timestamptz
      FROM claims JOIN candidates c ON claims.subscriber_id = c.id
      HAVING count(*) > 0
      RETURNING id
    ) SELECT id FROM new_batch
  `);
  const id = result.rows[0]?.id;
  if (typeof id !== "string") return null;
  return (await db.select().from(newsletterBatches).where(eq(newsletterBatches.id, id)).limit(1))[0] ?? null;
}

function retryableBatch(now: Date) {
  return and(
    gt(newsletterBatches.firstAttemptAt, new Date(now.getTime() - 23 * 60 * 60 * 1000)),
    or(eq(newsletterBatches.status, "failed"), and(eq(newsletterBatches.status, "sending"), lt(newsletterBatches.claimedAt, new Date(now.getTime() - 10 * 60 * 1000)))),
  );
}

export async function claimRetryBatch(week: string, now: Date, exclude: string[]) {
  const eligible = and(eq(newsletterBatches.week, week), retryableBatch(now), exclude.length ? notInArray(newsletterBatches.id, exclude) : undefined);
  const candidate = (await db.select({ id: newsletterBatches.id }).from(newsletterBatches).where(eligible).orderBy(newsletterBatches.firstAttemptAt).limit(1))[0];
  if (!candidate) return null;
  const rows = await db.update(newsletterBatches).set({ status: "sending", attemptId: randomUUID(), claimedAt: now, error: null })
    .where(and(eq(newsletterBatches.id, candidate.id), eligible)).returning();
  return rows[0] ?? null;
}

export async function confirmedBatchRecipients(ids: string[]) {
  if (!ids.length) return [];
  return db.select({ id: newsletterSubscribers.id, email: newsletterSubscribers.email }).from(newsletterSubscribers)
    .where(and(inArray(newsletterSubscribers.id, ids), eq(newsletterSubscribers.status, "confirmed")));
}

export async function saveBatchPayload(batch: NewsletterBatch, payload: NewsletterMessage[]) {
  const rows = await db.update(newsletterBatches).set({ payload })
    .where(and(eq(newsletterBatches.id, batch.id), eq(newsletterBatches.attemptId, batch.attemptId), eq(newsletterBatches.status, "sending"), isNull(newsletterBatches.payload)))
    .returning();
  return rows[0] ?? null;
}

export async function finishBatch(batch: NewsletterBatch, result: { status: "sent"; providerIds: string[] } | { status: "failed" | "skipped"; error: string }, now: Date) {
  const values = result.status === "sent"
    ? { status: result.status, providerIds: result.providerIds, sentAt: now, error: null }
    : { status: result.status, error: result.error.slice(0, 300) };
  const rows = await db.update(newsletterBatches).set(values).where(and(
    eq(newsletterBatches.id, batch.id), eq(newsletterBatches.attemptId, batch.attemptId), eq(newsletterBatches.status, "sending"),
  )).returning({ id: newsletterBatches.id });
  if (!rows.length) throw new Error("Newsletter batch lease changed before acknowledgement");
}

export async function hasUnclaimedRecipients(week: string) {
  const rows = await db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers)
    .leftJoin(newsletterDeliveries, and(eq(newsletterDeliveries.subscriberId, newsletterSubscribers.id), eq(newsletterDeliveries.week, week)))
    .where(and(eq(newsletterSubscribers.status, "confirmed"), isNull(newsletterDeliveries.subscriberId))).limit(1);
  return rows.length > 0;
}
