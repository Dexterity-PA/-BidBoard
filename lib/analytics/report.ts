import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type AnalyticsTotals = { page_views: number; visits: number; browsers: number; returning_browsers: number; signups: number; saves: number; newsletter: number };
export type AnalyticsSource = { source: string; campaign: string; visits: number; signups: number; saves: number; newsletter: number };

export async function analyticsReport(days: 7 | 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
  const [totals, sources] = await Promise.all([
    db.execute(sql`
      WITH returning_browsers AS (
        SELECT browser_hash FROM analytics_events WHERE kind = 'page_view' AND browser_hash IS NOT NULL
          AND created_at >= now() - interval '90 days'
        GROUP BY browser_hash HAVING count(DISTINCT session_hash) > 1
      )
      SELECT count(*) FILTER (WHERE kind = 'page_view')::int AS page_views,
        count(DISTINCT session_hash) FILTER (WHERE kind = 'page_view')::int AS visits,
        count(DISTINCT browser_hash) FILTER (WHERE kind = 'page_view')::int AS browsers,
        count(DISTINCT browser_hash) FILTER (WHERE kind = 'page_view' AND browser_hash IN (SELECT browser_hash FROM returning_browsers))::int AS returning_browsers,
        count(*) FILTER (WHERE kind = 'signup')::int AS signups,
        count(*) FILTER (WHERE kind = 'save')::int AS saves,
        count(*) FILTER (WHERE kind = 'newsletter')::int AS newsletter
      FROM analytics_events WHERE created_at >= ${since}::timestamptz
    `),
    db.execute(sql`
      SELECT COALESCE(source, referrer, CASE WHEN session_hash IS NULL THEN 'Unattributed' ELSE 'Direct / unknown' END) AS source,
        COALESCE(campaign, '') AS campaign,
        count(DISTINCT session_hash) FILTER (WHERE kind = 'page_view')::int AS visits,
        count(*) FILTER (WHERE kind = 'signup')::int AS signups,
        count(*) FILTER (WHERE kind = 'save')::int AS saves,
        count(*) FILTER (WHERE kind = 'newsletter')::int AS newsletter
      FROM analytics_events WHERE created_at >= ${since}::timestamptz
      GROUP BY 1, 2 ORDER BY visits DESC, signups DESC, saves DESC LIMIT 30
    `),
  ]);
  return { totals: totals.rows[0] as AnalyticsTotals, sources: sources.rows as AnalyticsSource[] };
}
