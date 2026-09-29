import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey(),
  kind: text("kind").$type<"page_view" | "signup" | "save" | "newsletter">().notNull(),
  browserHash: text("browser_hash"),
  sessionHash: text("session_hash"),
  path: text("path"),
  source: text("source"),
  campaign: text("campaign"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("analytics_events_created_at").on(t.createdAt), index("analytics_events_browser").on(t.browserHash, t.createdAt)]);

export const analyticsRateLimits = pgTable("analytics_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [index("analytics_rate_limits_expiry").on(t.expiresAt)]);
