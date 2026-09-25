import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import DeadlineBoard, { type BoardRow } from "@/components/merit/DeadlineBoard";
import { LISTINGS, awardTier, coverageHint, maxDollars, type MeritListing } from "@/lib/merit/catalog";

function valueLabel(l: MeritListing): string | null {
  const hint = coverageHint(l);
  if (hint) return hint;
  const d = maxDollars(l);
  return d > 0 ? `$${d.toLocaleString("en-US")}` : null;
}

/** Substantial awards with a confirmed upcoming date, soonest first. */
function nextDeadlines(now: Date): BoardRow[] {
  // Start a day back so the client's own "today" decides what is past.
  const from = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  return LISTINGS.filter(
    (l) =>
      l.deadlineDate &&
      l.deadlineDate >= from &&
      l.status === "live" &&
      !l.tags.includes("needs-split") &&
      (l.type === "college-program" || l.tags.includes("national") || awardTier(l) >= 3),
  )
    .sort((a, b) => a.deadlineDate!.localeCompare(b.deadlineDate!))
    .slice(0, 16)
    .map((l) => ({
      slug: l.slug,
      name: l.name,
      provider: l.provider,
      date: l.deadlineDate!,
      value: valueLabel(l),
    }));
}

/** This month and the next two, with how many confirmed deadlines are still ahead in each. */
function upcomingMonths(now: Date) {
  // Deadlines already past this month don't count toward it.
  const from = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const out: { key: string; label: string; count: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const key = d.toISOString().slice(0, 7);
    out.push({
      key,
      label: d.toLocaleString("en-US", { month: "long", timeZone: "UTC" }),
      count: LISTINGS.filter((l) => l.deadlineDate?.startsWith(key) && l.deadlineDate >= from).length,
    });
  }
  return out;
}

const KINDS = [
  { type: "college-program", label: "College merit programs" },
  { type: "scholarship", label: "Scholarships" },
  { type: "competition", label: "Competitions" },
] as const;

export default function HomePage() {
  const now = new Date();
  const rows = nextDeadlines(now);
  const months = upcomingMonths(now);
  const total = LISTINGS.length;

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <section className="lp-hero">
          <div className="m-wrap">
            <h1 className="lp-title">
              {total} merit scholarships, each checked against its official page.
            </h1>
            <p className="lp-sub">
              Free for students. College full rides, national awards and competitions in one list.
            </p>
            <form action="/scholarships" method="get" className="lp-search" role="search">
              <label htmlFor="lp-q" className="lp-sr">
                Search scholarships
              </label>
              <input
                id="lp-q"
                name="q"
                type="search"
                className="lp-search-input"
                placeholder="Search by award, college or sponsor"
                autoComplete="off"
              />
              <button type="submit" className="m-btn m-btn-primary lp-search-btn">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-next">
          <div className="m-wrap">
            <div className="lp-head">
              <h2 id="lp-next" className="lp-label">
                Next confirmed deadlines
              </h2>
              <Link href="/scholarships" className="lp-head-link">
                See all {total}
              </Link>
            </div>
            <DeadlineBoard rows={rows} />
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-browse">
          <div className="m-wrap lp-browse">
            <h2 id="lp-browse" className="lp-label">
              Browse
            </h2>
            <ul className="lp-links">
              {KINDS.map((k) => (
                <li key={k.type}>
                  <Link href={`/scholarships?type=${k.type}`}>
                    {k.label}
                    <span className="lp-count">
                      {LISTINGS.filter((l) => l.type === k.type).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="lp-links">
              {months.map((m) => (
                <li key={m.key}>
                  <Link href={`/scholarships?month=${m.key}`}>
                    Due in {m.label}
                    <span className="lp-count">{m.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section lp-notes">
          <div className="m-wrap lp-notes-grid">
            <p>
              Not listed: sweepstakes, popularity votes and need-only aid. Awards that also weigh
              financial need are labeled. If a cycle&apos;s deadline isn&apos;t published yet, the
              listing says so.
            </p>
            <p>
              <Link href="/sign-up" className="lp-inline-link">
                Create a free account
              </Link>{" "}
              to save awards and keep your deadlines on one list.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
