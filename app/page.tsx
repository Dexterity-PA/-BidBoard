import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import DeadlineBoard, { type BoardRow } from "@/components/merit/DeadlineBoard";
import NewsletterForm from "@/components/merit/NewsletterForm";
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
          <div className="m-wrap lp-hero-grid">
            <div>
              <h1 className="lp-title">Find your next merit scholarship.</h1>
              <p className="lp-sub">
                {total}{" "}college merit programs, scholarships and competitions. Narrow the list
                with four answers, then check each award&apos;s official requirements.
              </p>
              <div className="lp-actions">
                <Link href="/scholarships?match=1" className="m-btn m-btn-primary">
                  Find potential matches
                </Link>
                <Link href="/scholarships" className="m-btn m-btn-ghost">
                  Browse all awards
                </Link>
              </div>
              <p className="lp-caption">Free to browse and match. No account needed.</p>
            </div>
            <section className="lp-how" aria-labelledby="lp-how-title">
              <h2 id="lp-how-title" className="lp-how-title">From a long list to a shortlist</h2>
              <ol className="lp-how-steps">
                <li>
                  <h3>Tell us four things</h3>
                  <p>Your state, citizenship, unweighted GPA and intended field. Skip anything
                    you prefer not to share.</p>
                </li>
                <li>
                  <h3>Explore potential matches</h3>
                  <p>We filter using those answers. You still need to check the full eligibility
                    rules on each award&apos;s official page.</p>
                </li>
                <li>
                  <h3>Keep your next steps together</h3>
                  <p>Create a free account when you want to save awards and track deadlines.</p>
                </li>
              </ol>
            </section>
          </div>
          <div className="m-wrap">
            <div className="lp-community">
              <p>Used by <strong>10,000+ people.</strong></p>
              <a href="#about" className="lp-inline-link">About Meritously</a>
            </div>
          </div>
        </section>

        <section className="lp-section lp-search-section" aria-labelledby="lp-search-title">
          <div className="m-wrap lp-search-grid">
            <h2 id="lp-search-title" className="lp-label">Have an award or college in mind?</h2>
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

        <section id="about" className="lp-section lp-about" aria-labelledby="lp-about-title">
          <div className="m-wrap lp-about-grid">
            <div>
              <h2 id="lp-about-title" className="lp-section-title">About Meritously</h2>
              <p>
                Meritously is a free merit scholarship finder. Browse awards, check official
                requirements, and keep your applications organized.
              </p>
              <p>
                Have a correction, a question or an idea for the site?{" "}
                <a href="mailto:hello@bidboard.app" className="lp-inline-link">Get in touch.</a>
              </p>
            </div>
            <div>
              <h2 className="lp-section-title">What &ldquo;checked&rdquo; means</h2>
              <p>
                Listings link to official sources and show when details were last checked.
                Unconfirmed information is labeled, so you can see what still needs checking.
                Always confirm the current requirements before applying.
              </p>
              <p>
                Awards that also consider financial need are labeled separately. Sweepstakes,
                popularity votes and need-only aid aren&apos;t included.
              </p>
            </div>
          </div>
        </section>
        <section id="updates" className="lp-section lp-updates" aria-labelledby="lp-updates-title">
          <div className="m-wrap lp-about-grid">
            <div>
              <h2 id="lp-updates-title" className="lp-section-title">Scholarship updates, once a week.</h2>
              <p className="m-body">Get upcoming deadlines and a short list of awards in your inbox. No account needed.</p>
              <p className="m-fine">Want reminders for your saved awards? <Link href="/settings/notifications" className="lp-inline-link">Choose your reminder preferences.</Link></p>
            </div>
            <div><NewsletterForm /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
