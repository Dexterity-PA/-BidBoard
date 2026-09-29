import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { isAnalyticsAdmin } from "@/lib/analytics/access";
import { analyticsReport, type AnalyticsTotals } from "@/lib/analytics/report";
import { analyticsEnabled } from "@/lib/analytics/server";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics | Meritously", robots: { index: false, follow: false } };

const metrics: [keyof AnalyticsTotals, string][] = [
  ["visits", "Visits"], ["page_views", "Page views"], ["browsers", "Browsers"],
  ["returning_browsers", "Returning browsers"], ["signups", "New accounts"],
  ["saves", "Awards saved"], ["newsletter", "Confirmed digest opt-ins"],
];

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.ANALYTICS_ADMIN_EMAIL) notFound();
  const user = await currentUser();
  if (!isAnalyticsAdmin(user, process.env.ANALYTICS_ADMIN_EMAIL, userId)) notFound();

  let reports;
  try { reports = await Promise.all(([7, 30] as const).map(async (days) => ({ days, ...await analyticsReport(days) }))); }
  catch { return <main className={styles.main}><Link href="/">Meritously</Link><h1>Analytics</h1><p>Analytics is temporarily unavailable. No counts are shown until the database can be read.</p></main>; }

  return <main className={styles.main}>
    <Link href="/">Meritously</Link>
    <h1>Outreach analytics</h1>
    <p>Private owner dashboard. {analyticsEnabled() ? "Measurement is enabled." : "Measurement is disabled."} Windows end now; times use UTC.</p>
    {reports.map(({ days, totals, sources }) => <section key={days} className={styles.section}>
      <h2>Last {days} days</h2>
      <dl className={styles.cards}>{metrics.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{Number(totals?.[key] ?? 0).toLocaleString("en-US")}</dd></div>)}</dl>
      <h3>Sources and campaigns</h3>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Sources for the last ${days} days`}>
        <table><thead><tr><th scope="col">Source</th><th scope="col">Campaign</th><th scope="col">Visits</th><th scope="col">Accounts</th><th scope="col">Saves</th><th scope="col">Digest opt-ins</th></tr></thead>
          <tbody>{sources.map((row, index) => <tr key={index}><th scope="row">{row.source}</th><td>{row.campaign || "None"}</td><td>{row.visits}</td><td>{row.signups}</td><td>{row.saves}</td><td>{row.newsletter}</td></tr>)}</tbody>
        </table>
      </div>
      {sources.length === 0 && <p>No measurements in this window yet.</p>}
    </section>)}
    <section className={styles.section}><h2>Reading these numbers</h2>
      <p>A visit ends after 30 minutes without a tracked page navigation. Each discovery page counts once per visit; reloads do not add views. Award detail pages are grouped together.</p>
      <p>Browsers are random browser identifiers, not people. Returning browsers have at least two recorded visits within retained history. Clearing storage, switching devices, privacy preferences and blockers affect these counts.</p>
      <p>Account creation, successful saves per account and award, and confirmed digest opt-ins are deduplicated within 90 days of retained history. These are activity totals, not the current subscriber or tracker size. No historic user list was imported; recent accounts can appear when a visit completes after signup.</p>
      <p>Source attribution comes from the current visit. Confirmations opened in another browser and webhook-only signups can be unattributed. Automated traffic filters are limited; these are outreach estimates.</p>
      <p>For outreach, use labels without names or emails, for example <code>https://www.bidboard.app/?utm_source=school-newsletter&amp;utm_campaign=fall-2026</code>. Labels accept up to 48 letters, digits, underscores or hyphens.</p>
    </section>
  </main>;
}
