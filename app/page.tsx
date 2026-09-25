import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import MeritCalendar, { type CalendarMonth } from "@/components/merit/MeritCalendar";
import { LISTINGS, awardTier, coverageHint, type MeritListing } from "@/lib/merit/catalog";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const PER_MONTH = 7;

function priority(l: MeritListing) {
  let p = 0;
  if (l.type === "college-program") p += 3;
  if (coverageHint(l)) p += 2;
  if (l.tags.includes("national")) p += 2;
  if (l.status === "live") p += 1;
  return p;
}

function buildCalendar(now: Date): CalendarMonth[] {
  // The calendar highlights substantial awards; the browse page has everything.
  const dated = LISTINGS.filter(
    (l) =>
      l.deadlineDate &&
      (l.status === "live" || l.status === "mixed-need") &&
      !l.tags.includes("needs-split") &&
      (l.type === "college-program" || l.tags.includes("national") || awardTier(l) >= 2),
  );
  const months: CalendarMonth[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const inMonth = dated.filter((l) => l.deadlineDate!.startsWith(key));
    const picked = [...inMonth]
      .sort((a, b) => priority(b) - priority(a) || a.deadlineDate!.localeCompare(b.deadlineDate!))
      .slice(0, PER_MONTH)
      .sort((a, b) => a.deadlineDate!.localeCompare(b.deadlineDate!));
    months.push({
      key,
      label: MONTH_NAMES[d.getUTCMonth()],
      year: d.getUTCFullYear(),
      entries: picked.map((l) => ({
        slug: l.slug,
        name: l.name,
        provider: l.provider,
        date: l.deadlineDate!,
      })),
      more: inMonth.length - picked.length,
    });
  }
  return months;
}

const KINDS = [
  {
    title: "College merit programs",
    body: "Full rides and full-tuition awards run by colleges, including the ones that need a separate application, an honors application or a nomination.",
    type: "college-program",
    examples: ["C054", "C058", "C079"],
  },
  {
    title: "Scholarships",
    body: "National and state awards from foundations, companies and honor societies, plus niche awards that reward a specific interest or skill.",
    type: "scholarship",
    examples: ["P001", "W001", "P044"],
  },
  {
    title: "Competitions",
    body: "Research, essay, arts and pitch contests that pay cash prizes or scholarships to the students who win.",
    type: "competition",
    examples: ["P025", "P029", "P026"],
  },
] as const;

const CHECKS = [
  {
    title: "Official sources on every listing",
    body: "Each award links to the college or sponsor page its details came from, so you can confirm them yourself.",
  },
  {
    title: "Unconfirmed details are labeled",
    body: "When a deadline or amount for this cycle has not been published yet, the listing says so instead of guessing from last year.",
  },
  {
    title: "Random drawings are left out",
    body: "Sweepstakes-style scholarships picked by lottery are not merit awards, so they are not in the catalog.",
  },
  {
    title: "Need-based aid is marked separately",
    body: "Awards that also weigh financial need carry a Merit + need label and are hidden unless you choose to include them.",
  },
];

export default function HomePage() {
  const months = buildCalendar(new Date());
  const byId = new Map(LISTINGS.map((l) => [l.id, l]));

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <section className="m-hero">
          <div className="m-wrap">
          <div className="m-hero-grid">
            <span className="m-eyebrow">Free for every student</span>
            <h1 className="m-h1">
              Find the merit scholarships <em>most students miss.</em>
            </h1>
            <p className="m-lede">
              BidBoard is a free, merit-only catalog for high-achieving students: college full
              rides, national awards and the niche scholarships that never make the big lists.
              Every listing links to its official source.
            </p>
            <div className="m-hero-actions">
              <Link href="/scholarships" className="m-btn m-btn-primary">
                Browse scholarships
              </Link>
              <Link href="/sign-up" className="m-btn m-btn-ghost">
                Create free account
              </Link>
            </div>
          </div>
          </div>
        </section>

        <section className="m-cal" aria-labelledby="cal-title">
          <div className="m-wrap">
            <div className="m-cal-head">
              <div style={{ display: "grid", gap: 10 }}>
                <span className="m-eyebrow">The merit calendar</span>
                <h2 id="cal-title" className="m-h2">
                  Merit deadlines come early.
                </h2>
              </div>
              <p className="m-body" style={{ maxWidth: 440 }}>
                Many full-ride programs close before Early Action, and some need a nomination
                weeks before that. Here is what is coming up.
              </p>
            </div>
            <MeritCalendar months={months} />
            <p className="m-cal-foot">
              Dates are from each program&apos;s official page. Open a listing for the full
              timeline.
            </p>
          </div>
        </section>

        <section className="m-section" aria-labelledby="kinds-title">
          <div className="m-wrap">
            <div className="m-section-head">
              <span className="m-eyebrow">What you&apos;ll find</span>
              <h2 id="kinds-title" className="m-h2">
                Three kinds of merit money, in one place.
              </h2>
            </div>
            <div className="m-kinds">
              {KINDS.map((k) => (
                <div key={k.type} className="m-kind">
                  <h3 className="m-kind-title">{k.title}</h3>
                  <p className="m-body">{k.body}</p>
                  <ul className="m-kind-examples">
                    {k.examples.map((id) => {
                      const l = byId.get(id);
                      if (!l) return null;
                      return (
                        <li key={id}>
                          <Link href={`/scholarships/${l.slug}`}>{l.name}</Link>{" "}
                          <span>· {l.provider}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link href={`/scholarships?type=${k.type}`} className="m-arrow-link">
                    See all {k.title.toLowerCase()} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="m-section" style={{ paddingTop: 0 }} aria-labelledby="checks-title">
          <div className="m-wrap">
            <div className="m-section-head">
              <span className="m-eyebrow">How listings are checked</span>
              <h2 id="checks-title" className="m-h2">
                Built to be trusted, not just long.
              </h2>
            </div>
            <div className="m-checks">
              {CHECKS.map((c) => (
                <div key={c.title} className="m-check">
                  <h3 className="m-check-title">{c.title}</h3>
                  <p className="m-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="m-section" style={{ paddingTop: 0 }} aria-labelledby="track-title">
          <div className="m-wrap">
            <div className="m-band">
              <div style={{ display: "grid", gap: 16 }}>
                <h2 id="track-title" className="m-h2">
                  Keep every deadline in one place.
                </h2>
                <p className="m-body">
                  Create a free account to save the awards you are going after and see all of
                  their deadlines, nominations and interviews on one timeline.
                </p>
                <div>
                  <Link href="/sign-up" className="m-btn m-btn-primary">
                    Create free account
                  </Link>
                </div>
              </div>
              <ul className="m-band-list">
                <li>Save awards from any listing</li>
                <li>Track what you have started, submitted and won</li>
                <li>See nomination and interview dates, not just final deadlines</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
