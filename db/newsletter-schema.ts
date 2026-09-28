import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { NewsletterDigestContent, NewsletterMessage, NewsletterRecipient } from "@/lib/newsletter/types";

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  status: text("status").$type<"pending" | "confirmed" | "unsubscribed">().notNull().default("pending"),
  confirmationTokenHash: text("confirmation_token_hash"),
  confirmationExpiresAt: timestamp("confirmation_expires_at", { withTimezone: true }),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("newsletter_subscribers_email_unique").on(t.email),
  uniqueIndex("newsletter_subscribers_confirmation_unique").on(t.confirmationTokenHash),
  index("newsletter_subscribers_status_id").on(t.status, t.id),
  check("newsletter_subscribers_status_check", sql`${t.status} IN ('pending', 'confirmed', 'unsubscribed')`),
  check("newsletter_subscribers_email_normalized", sql`${t.email} = lower(btrim(${t.email}))`),
]);

export const newsletterCooldowns = pgTable("newsletter_cooldowns", {
  key: text("key").primaryKey(),
  blockedUntil: timestamp("blocked_until", { withTimezone: true }).notNull(),
});

export const newsletterBatches = pgTable("newsletter_batches", {
  id: text("id").primaryKey(),
  week: text("week").notNull(),
  status: text("status").$type<"sending" | "sent" | "failed" | "skipped">().notNull(),
  content: jsonb("content").$type<NewsletterDigestContent>().notNull(),
  recipients: jsonb("recipients").$type<NewsletterRecipient[]>().notNull(),
  payload: jsonb("payload").$type<NewsletterMessage[]>(),
  attemptId: text("attempt_id").notNull(),
  firstAttemptAt: timestamp("first_attempt_at", { withTimezone: true }).notNull(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  providerIds: jsonb("provider_ids").$type<string[]>(),
  error: text("error"),
}, (t) => [
  index("newsletter_batches_week_status").on(t.week, t.status),
  check("newsletter_batches_status_check", sql`${t.status} IN ('sending', 'sent', 'failed', 'skipped')`),
]);

export const newsletterDeliveries = pgTable("newsletter_deliveries", {
  subscriberId: text("subscriber_id").notNull().references(() => newsletterSubscribers.id, { onDelete: "cascade" }),
  week: text("week").notNull(),
  batchId: text("batch_id").notNull().references(() => newsletterBatches.id),
}, (t) => [
  uniqueIndex("newsletter_deliveries_subscriber_week_unique").on(t.subscriberId, t.week),
  index("newsletter_deliveries_batch_id").on(t.batchId),
]);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewsletterBatch = typeof newsletterBatches.$inferSelect;
