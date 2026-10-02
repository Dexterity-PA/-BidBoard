import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import DeadlineBoard, { type BoardRow } from "@/components/merit/DeadlineBoard";
import NewsletterForm from "@/components/merit/NewsletterForm";
import { LISTINGS, awardTier, coverageHint, maxDollars, type MeritListing } from "@/lib/merit/catalog";

export const metadata = { alternates: { canonical: "/" } };

function valueLabel(l: MeritListing): string | null {
  const hint = coverageHint(l);
  if (hint) return hint;
  const d = maxDollars(l);
  return d > 0 ? `Up to $${d.toLocaleString("en-US")}` : null;
}

/** Substantial awards with an upcoming date in the catalog, soonest first. */
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

/** Real examples, with a live alternative when a featured award's date has passed. */
function cataloguePreview(now: Date) {
  const today = now.toISOString().slice(0, 10);
  return ["P001", "C001", "P025"].flatMap((id) => {
    const preferred = LISTINGS.find((listing) => listing.id === id);
    const available = (listing: MeritListing) => listing.status === "live" &&
      !listing.tags.includes("needs-split") && (!listing.deadlineDate || listing.deadlineDate >= today);
    const listing = preferred && available(preferred) ? preferred : LISTINGS.find((candidate) => candidate.type === preferred?.type && available(candidate));
    return listing ? [listing] : [];
  });
}

export default function HomePage() {
  const now = new Date();
  const rows = nextDeadlines(now);
  const months = upcomingMonths(now);
  const preview = cataloguePreview(now);
  const total = LISTINGS.length;

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <section className="lp-hero">
          <div className="m-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <h1 className="lp-title">Find your next merit scholarship.</h1>
              <p className="lp-sub">
                Explore {total}{" "}college merit programs, scholarships and competitions.
                Four optional answers help you find a place to start.
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
            <section className="lp-preview" aria-labelledby="lp-preview-title">
              <div className="lp-preview-head">
                <h2 id="lp-preview-title">A look inside the catalog</h2>
                <p>Different paths to merit aid.</p>
              </div>
              <ul className="lp-preview-list">
                {preview.map((listing) => (
                  <li key={listing.id}>
                    <Link href={`/scholarships/${listing.slug}`} className="lp-preview-award">
                      <span className="lp-preview-type">{listing.type === "college-program" ? "College merit" : listing.type === "competition" ? "Competition" : "Scholarship"}</span>
                      <span className="lp-preview-name">{listing.name}</span>
                      <span className="lp-preview-provider">{listing.provider}</span>
                      <span className="lp-preview-value">{coverageHint(listing) || (maxDollars(listing) > 0 ? `Up to $${maxDollars(listing).toLocaleString("en-US")}` : "See award details")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="lp-preview-note">Examples from the catalog. Check each award&apos;s official eligibility rules.</p>
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
            <div>
              <h2 id="lp-search-title" className="lp-label">Already have something in mind?</h2>
              <p className="lp-search-caption">Search by award, college or sponsor.</p>
            </div>
            <form action="/scholarships" method="get" className="lp-search" role="search">
              <label htmlFor="lp-q" className="lp-sr">
                Search scholarships
              </label>
              <input
                id="lp-q"
                name="q"
                type="search"
                className="lp-search-input"
                placeholder="Award, college or sponsor"
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
              <div>
                <h2 id="lp-next" className="lp-section-title">Coming up next</h2>
                <p className="lp-head-caption">Awards with upcoming dates in the catalog.</p>
              </div>
              <Link href="/scholarships" className="lp-head-link">
                Browse all awards
              </Link>
            </div>
            <DeadlineBoard rows={rows} show={5} initialToday={now.toISOString().slice(0, 10)} />
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
                A free place to find merit scholarships and keep your next steps together.
              </p>
              <ol className="lp-how-steps">
                <li><h3>Narrow the list</h3><p>Four optional answers help guide your search.</p></li>
                <li><h3>Check the requirements</h3><p>Confirm eligibility and deadlines on the official source.</p></li>
                <li><h3>Build your shortlist</h3><p>Save awards and track your progress with a free account.</p></li>
              </ol>
              <p>
                Have a correction or a question?{" "}
                <a href="mailto:hello@meritously.com" className="lp-inline-link">Get in touch.</a>
              </p>
            </div>
            <div>
              <h2 className="lp-section-title">What &ldquo;checked&rdquo; means</h2>
              <p>
                Listings link to official sources and show individual check dates where recorded.
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
          <div className="m-wrap">
            <div className="lp-updates-panel">
              <div>
                <h2 id="lp-updates-title" className="lp-section-title">Keep up with upcoming awards.</h2>
                <p className="m-body">One weekly email with upcoming deadlines and a short list of awards. No account needed.</p>
                <p className="m-fine">Want reminders for your saved awards? <Link href="/settings/notifications" className="lp-inline-link">Choose your reminder preferences.</Link></p>
              </div>
              <div><NewsletterForm /></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
