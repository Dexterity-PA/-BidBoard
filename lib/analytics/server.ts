import "server-only";
import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ANALYTICS_COOKIE, ANALYTICS_OPTOUT, parseAttributionCookie, type Attribution } from "./shared";
import type { VisitMetadata } from "./metadata";

type Conversion = "signup" | "save" | "newsletter";

export function analyticsEnabled() {
  return process.env.ANALYTICS_ENABLED === "true" && Boolean(process.env.ANALYTICS_SECRET || process.env.CRON_SECRET);
}

export function analyticsHash(purpose: string, value: string) {
  const secret = process.env.ANALYTICS_SECRET || process.env.CRON_SECRET;
  if (!secret) throw new Error("Analytics unavailable");
  return createHmac("sha256", secret).update(`analytics:${purpose}\0${value}`).digest("hex");
}

export function trackingDeclined(h: Headers, cookieValue?: string) {
  return h.get("dnt") === "1" || h.get("sec-gpc") === "1" || cookieValue === "1";
}

/** Analytics errors, including timeouts, never fail an account or tracker action. */
export async function bestEffortAnalytics(work: () => Promise<unknown>, requireCollectionEnabled = true) {
  if (requireCollectionEnabled && !analyticsEnabled()) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      work(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Analytics timeout")), 1500); }),
    ]);
  } catch { console.warn("[analytics] Measurement unavailable."); }
  finally { if (timer) clearTimeout(timer); }
}

export async function requestAttribution(): Promise<Attribution | null> {
  try {
    const [jar, h] = await Promise.all([cookies(), headers()]);
    if (trackingDeclined(h, jar.get(ANALYTICS_OPTOUT)?.value)) return null;
    return parseAttributionCookie(jar.get(ANALYTICS_COOKIE)?.value);
  } catch { return null; }
}

async function writeEvent(kind: "page_view" | Conversion, entity: string, attribution: Attribution | null, path: string | null, createdAt = new Date(), metadata?: VisitMetadata) {
  const id = analyticsHash(`event:${kind}`, entity);
  const browser = attribution ? analyticsHash("browser", attribution.browser) : null;
  const session = attribution ? analyticsHash("session", attribution.session) : null;
  await db.execute(sql`
    INSERT INTO analytics_events (id, kind, browser_hash, session_hash, path, source, campaign, referrer, created_at, country, region, device, browser, os)
    VALUES (${id}, ${kind}, ${browser}, ${session}, ${path}, ${attribution?.source ?? null}, ${attribution?.campaign ?? null}, ${attribution?.referrer ?? null}, ${createdAt.toISOString()}::timestamptz, ${metadata?.country ?? null}, ${metadata?.region ?? null}, ${metadata?.device ?? null}, ${metadata?.browser ?? null}, ${metadata?.os ?? null})
    ON CONFLICT (id) DO UPDATE SET
      browser_hash = COALESCE(analytics_events.browser_hash, EXCLUDED.browser_hash),
      session_hash = CASE WHEN analytics_events.browser_hash IS NULL THEN EXCLUDED.session_hash ELSE analytics_events.session_hash END,
      source = CASE WHEN analytics_events.browser_hash IS NULL THEN EXCLUDED.source ELSE analytics_events.source END,
      campaign = CASE WHEN analytics_events.browser_hash IS NULL THEN EXCLUDED.campaign ELSE analytics_events.campaign END,
      referrer = CASE WHEN analytics_events.browser_hash IS NULL THEN EXCLUDED.referrer ELSE analytics_events.referrer END
  `);
}

export async function recordPageView(attribution: Attribution, path: string, metadata?: VisitMetadata) {
  await bestEffortAnalytics(() => writeEvent("page_view", `${attribution.browser}:${attribution.session}:${path}`, attribution, path, new Date(), metadata));
}

export async function recordConversion(kind: Conversion, entity: string, options: { attribution?: Attribution | null; createdAt?: Date } = {}) {
  await bestEffortAnalytics(async () => {
    const attribution = options.attribution === undefined ? await requestAttribution() : options.attribution;
    await writeEvent(kind, entity, attribution, null, options.createdAt);
  });
}

/** Network addresses are used transiently, never stored; the keyed hash expires after one day. */
export async function allowAnalyticsRequest(ip: string, now = new Date()) {
  const minute = Math.floor(now.getTime() / 60_000);
  const key = analyticsHash("rate", `${minute}:${ip.slice(0, 128)}`);
  const result = await db.execute(sql`
    INSERT INTO analytics_rate_limits (key, count, expires_at)
    VALUES (${key}, 1, ${new Date(now.getTime() + 24 * 60 * 60_000).toISOString()}::timestamptz)
    ON CONFLICT (key) DO UPDATE SET count = analytics_rate_limits.count + 1
    WHERE analytics_rate_limits.count < 120 RETURNING key
  `);
  return result.rows.length === 1;
}

export async function cleanAnalyticsRetention() {
  await bestEffortAnalytics(async () => {
    await db.execute(sql`DELETE FROM analytics_events WHERE created_at < now() - interval '90 days'`);
    await db.execute(sql`DELETE FROM analytics_rate_limits WHERE expires_at < now()`);
  }, false);
}
