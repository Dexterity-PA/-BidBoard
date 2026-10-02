import { pgTable, text, bigint, boolean, uuid, timestamp, integer } from "drizzle-orm/pg-core";

export const accountSyncState = pgTable("account_sync_state", {
  accountKey: text("account_key").primaryKey(),
  version: bigint("version", { mode: "number" }).notNull(),
  eventAt: bigint("event_at", { mode: "number" }).notNull(),
  deleted: boolean("deleted").notNull().default(false),
});
export const operationalEvents = pgTable("operational_events", {
  id: uuid("id").primaryKey(),
  component: text("component").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const scheduledJobRuns = pgTable("scheduled_job_runs", {
  id: uuid("id").primaryKey(),
  job: text("job").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  failed: integer("failed").notNull().default(0),
});
export const healthMonitorConfig = pgTable("health_monitor_config", {
  id: integer("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const operationalAlerts = pgTable("operational_alerts", {
  key: text("key").primaryKey(),
  component: text("component").notNull(),
  code: text("code").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
