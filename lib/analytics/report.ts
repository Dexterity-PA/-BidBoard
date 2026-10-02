import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { AnalyticsDays } from "./presentation";

export type AnalyticsTotals = { page_views: number; visits: number; browsers: number; returning_browsers: number; new_browsers: number; signups: number; saves: number; newsletter: number; multi_page_visits: number; converted_visits: number; geo_visits: number };
export type AnalyticsSource = { source: string; campaign: string; visits: number; signups: number; saves: number; newsletter: number };
export type DailyTraffic = { date: string; visits: number; page_views: number; new_browsers: number; signups: number; saves: number; newsletter: number };
export type Breakdown = { label: string; visits: number };
export type RegionTraffic = { country: string | null; region: string | null; visits: number };
export type PageTraffic = { path: string; views: number; visits: number };
export type AnalyticsReport = {
  totals: AnalyticsTotals; previous: AnalyticsTotals; comparable: boolean;
  daily: DailyTraffic[]; countries: RegionTraffic[]; regions: RegionTraffic[];
  devices: Breakdown[]; browsers: Breakdown[]; operatingSystems: Breakdown[];
  sources: AnalyticsSource[]; pages: PageTraffic[]; landingPages: Breakdown[];
  hourly: { hour: number; visits: number }[];
  quality: { internal_visits: number; scanner_referrals: number; first_event: string | null; last_event: string | null; first_dimensions: string | null };
  days: AnalyticsDays; includeInternal: boolean; since: string; generatedAt: string;
};

/** Every panel uses one database snapshot and the same internal-traffic filter. */
export function analyticsReportQuery(days: AnalyticsDays, includeInternal = false, now = new Date()) {
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (days - 1) * 86400_000);
  const previousSince = new Date(since.getTime() - days * 86400_000);
  const previousEnd = new Date(now.getTime() - days * 86400_000);
  return { since: since.toISOString(), query: sql`
    WITH bounds AS (SELECT ${since.toISOString()}::timestamptz AS start_at, ${now.toISOString()}::timestamptz AS end_at,
      ${previousSince.toISOString()}::timestamptz AS previous_start, ${previousEnd.toISOString()}::timestamptz AS previous_end),
    retained AS (SELECT * FROM analytics_events WHERE created_at >= ${new Date(now.getTime() - 90 * 86400_000).toISOString()}::timestamptz AND created_at <= (SELECT end_at FROM bounds)),
    excluded_sessions AS (SELECT DISTINCT session_hash FROM retained WHERE source = 'internal-check' AND session_hash IS NOT NULL),
    filtered AS (SELECT * FROM retained e WHERE ${includeInternal} OR
      (COALESCE(e.source, '') <> 'internal-check' AND NOT EXISTS (SELECT 1 FROM excluded_sessions x WHERE x.session_hash = e.session_hash))),
    browser_history AS (SELECT browser_hash, min(created_at) AS first_at, (array_agg(session_hash ORDER BY created_at, id))[1] AS first_session
      FROM filtered WHERE kind = 'page_view' AND browser_hash IS NOT NULL GROUP BY browser_hash),
    current_events AS (SELECT * FROM filtered WHERE created_at >= (SELECT start_at FROM bounds)),
    previous_events AS (SELECT * FROM filtered WHERE created_at >= (SELECT previous_start FROM bounds) AND created_at <= (SELECT previous_end FROM bounds)),
    periods AS (SELECT 'current' AS period, * FROM current_events UNION ALL SELECT 'previous' AS period, * FROM previous_events),
    session_pages AS (SELECT period, session_hash, count(*)::int AS views FROM periods WHERE kind = 'page_view' GROUP BY period, session_hash),
    period_sessions AS (SELECT DISTINCT ON (period, session_hash) period, session_hash, country FROM periods WHERE kind = 'page_view' ORDER BY period, session_hash, created_at, id),
    totals AS (SELECT period, count(*) FILTER (WHERE kind = 'page_view')::int AS page_views,
      count(DISTINCT session_hash) FILTER (WHERE kind = 'page_view')::int AS visits,
      count(DISTINCT e.browser_hash) FILTER (WHERE kind = 'page_view')::int AS browsers,
      count(DISTINCT e.browser_hash) FILTER (WHERE kind = 'page_view' AND h.first_session <> e.session_hash)::int AS returning_browsers,
      count(DISTINCT e.browser_hash) FILTER (WHERE kind = 'page_view' AND h.first_at >= CASE WHEN period = 'current' THEN b.start_at ELSE b.previous_start END)::int AS new_browsers,
      count(*) FILTER (WHERE kind = 'signup')::int AS signups, count(*) FILTER (WHERE kind = 'save')::int AS saves,
      count(*) FILTER (WHERE kind = 'newsletter')::int AS newsletter,
      (SELECT count(*)::int FROM session_pages p WHERE p.period = e.period AND p.views > 1) AS multi_page_visits,
      count(DISTINCT session_hash) FILTER (WHERE kind <> 'page_view' AND session_hash IN (SELECT session_hash FROM periods pv WHERE pv.period = e.period AND pv.kind = 'page_view'))::int AS converted_visits,
      (SELECT count(*)::int FROM period_sessions p WHERE p.period = e.period AND p.country IS NOT NULL) AS geo_visits
      FROM periods e CROSS JOIN bounds b LEFT JOIN browser_history h ON h.browser_hash = e.browser_hash GROUP BY period),
    sessions AS (SELECT DISTINCT ON (session_hash) * FROM current_events WHERE kind = 'page_view' ORDER BY session_hash, created_at, id),
    visit_days AS (SELECT (created_at AT TIME ZONE 'UTC')::date AS date, count(*)::int AS visits FROM sessions GROUP BY 1),
    event_days AS (SELECT (created_at AT TIME ZONE 'UTC')::date AS date,
      count(*) FILTER (WHERE kind = 'page_view')::int AS page_views,
      count(*) FILTER (WHERE kind = 'signup')::int AS signups, count(*) FILTER (WHERE kind = 'save')::int AS saves,
      count(*) FILTER (WHERE kind = 'newsletter')::int AS newsletter FROM current_events GROUP BY 1),
    browser_days AS (SELECT (first_at AT TIME ZONE 'UTC')::date AS date, count(*)::int AS new_browsers FROM browser_history WHERE first_at >= (SELECT start_at FROM bounds) GROUP BY 1),
    daily AS (SELECT to_char(d.date, 'YYYY-MM-DD') AS date, COALESCE(v.visits, 0) AS visits, COALESCE(e.page_views, 0) AS page_views,
      COALESCE(n.new_browsers, 0) AS new_browsers, COALESCE(e.signups, 0) AS signups, COALESCE(e.saves, 0) AS saves, COALESCE(e.newsletter, 0) AS newsletter
      FROM bounds b CROSS JOIN LATERAL generate_series((b.start_at AT TIME ZONE 'UTC')::date, (b.end_at AT TIME ZONE 'UTC')::date, interval '1 day') AS d(date)
      LEFT JOIN visit_days v ON v.date = d.date::date LEFT JOIN event_days e ON e.date = d.date::date LEFT JOIN browser_days n ON n.date = d.date::date ORDER BY d.date),
    countries AS (SELECT country, NULL::text AS region, count(*)::int AS visits FROM sessions GROUP BY country ORDER BY visits DESC, country NULLS LAST),
    regions AS (SELECT country, region, count(*)::int AS visits FROM sessions GROUP BY country, region ORDER BY visits DESC, country NULLS LAST, region NULLS LAST),
    devices AS (SELECT COALESCE(device, 'Unknown') AS label, count(*)::int AS visits FROM sessions GROUP BY 1 ORDER BY visits DESC, label),
    browsers AS (SELECT COALESCE(browser, 'Unknown') AS label, count(*)::int AS visits FROM sessions GROUP BY 1 ORDER BY visits DESC, label),
    operating_systems AS (SELECT COALESCE(os, 'Unknown') AS label, count(*)::int AS visits FROM sessions GROUP BY 1 ORDER BY visits DESC, label),
    sources AS (SELECT COALESCE(source, referrer, CASE WHEN session_hash IS NULL THEN 'Unattributed' ELSE 'Direct / unknown' END) AS source,
      COALESCE(campaign, '') AS campaign, count(DISTINCT session_hash) FILTER (WHERE kind = 'page_view')::int AS visits,
      count(*) FILTER (WHERE kind = 'signup')::int AS signups, count(*) FILTER (WHERE kind = 'save')::int AS saves,
      count(*) FILTER (WHERE kind = 'newsletter')::int AS newsletter FROM current_events GROUP BY 1, 2 ORDER BY visits DESC, source, campaign),
    pages AS (SELECT path, count(*)::int AS views, count(DISTINCT session_hash)::int AS visits FROM current_events WHERE kind = 'page_view' GROUP BY path ORDER BY views DESC, path),
    landing_pages AS (SELECT path AS label, count(*)::int AS visits FROM sessions GROUP BY path ORDER BY visits DESC, path),
    visit_hours AS (SELECT extract(hour FROM created_at AT TIME ZONE 'UTC')::int AS hour, count(*)::int AS visits FROM sessions GROUP BY 1),
    hourly AS (SELECT h.hour, COALESCE(v.visits, 0) AS visits FROM generate_series(0, 23) AS h(hour) LEFT JOIN visit_hours v ON v.hour = h.hour ORDER BY h.hour)
    SELECT json_build_object(
      'totals', (SELECT row_to_json(t) FROM totals t WHERE period = 'current'),
      'previous', (SELECT row_to_json(t) FROM totals t WHERE period = 'previous'),
      'comparable', COALESCE((SELECT min(created_at) <= (SELECT previous_start FROM bounds) FROM retained), false),
      'daily', (SELECT COALESCE(json_agg(d), '[]'::json) FROM daily d),
      'countries', (SELECT COALESCE(json_agg(c), '[]'::json) FROM countries c),
      'regions', (SELECT COALESCE(json_agg(r), '[]'::json) FROM regions r),
      'devices', (SELECT COALESCE(json_agg(d), '[]'::json) FROM devices d),
      'browsers', (SELECT COALESCE(json_agg(d), '[]'::json) FROM browsers d),
      'operatingSystems', (SELECT COALESCE(json_agg(d), '[]'::json) FROM operating_systems d),
      'sources', (SELECT COALESCE(json_agg(s), '[]'::json) FROM sources s),
      'pages', (SELECT COALESCE(json_agg(p), '[]'::json) FROM pages p),
      'landingPages', (SELECT COALESCE(json_agg(p), '[]'::json) FROM landing_pages p),
      'hourly', (SELECT json_agg(h) FROM hourly h),
      'quality', json_build_object(
        'internal_visits', (SELECT count(DISTINCT session_hash)::int FROM retained WHERE kind = 'page_view' AND source = 'internal-check' AND created_at >= (SELECT start_at FROM bounds)),
        'scanner_referrals', (SELECT count(*)::int FROM sessions WHERE referrer ~* '(mimecastprotect|safelinks[.]protection[.]outlook|urldefense|proofpoint)'),
        'first_event', (SELECT min(created_at) FROM retained), 'last_event', (SELECT max(created_at) FROM retained),
        'first_dimensions', (SELECT min(created_at) FROM retained WHERE country IS NOT NULL OR device IS NOT NULL)
      )
    ) AS report
  ` };
}
const emptyTotals: AnalyticsTotals = { page_views: 0, visits: 0, browsers: 0, returning_browsers: 0, new_browsers: 0, signups: 0, saves: 0, newsletter: 0, multi_page_visits: 0, converted_visits: 0, geo_visits: 0 };
export async function analyticsReport(days: AnalyticsDays, includeInternal = false): Promise<AnalyticsReport> {
  const now = new Date();
  const { since, query } = analyticsReportQuery(days, includeInternal, now);
  const result = await db.execute(query);
  const report = result.rows[0].report as Omit<AnalyticsReport, 'days' | 'includeInternal' | 'since' | 'generatedAt'>;
  return { ...report, totals: report.totals || { ...emptyTotals }, previous: report.previous || { ...emptyTotals }, days, includeInternal, since, generatedAt: now.toISOString() };
}
