import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import ClosingSoon, { type SoonRow } from "@/components/merit/ClosingSoon";
import { LISTINGS, awardTier, coverageHint } from "@/lib/merit/catalog";

/** Substantial awards with a confirmed upcoming date, soonest first. */
function closingSoon(now: Date): SoonRow[] {
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
    .slice(0, 12)
    .map((l) => ({
      slug: l.slug,
      name: l.name,
      provider: l.provider,
      date: l.deadlineDate!,
      hint: coverageHint(l),
    }));
}

const KINDS = [
  {
    title: "College merit programs",
    body: "Full rides and full-tuition awards run by colleges, including ones that need a separate application, an honors application or a nomination.",
    type: "college-program",
    examples: ["C054", "C058", "C079"],
  },
  {
    title: "Scholarships",
    body: "National and state awards from foundations, companies and honor societies, plus niche awards for specific interests and skills.",
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
    title: "Official sources",
    body: "Every award links to the college or sponsor page its details came from.",
  },
  {
    title: "Unconfirmed is labeled",
    body: "If this cycle's deadline or amount isn't published yet, the listing says so instead of guessing.",
  },
  {
    title: "No random drawings",
    body: "Sweepstakes-style scholarships picked by lottery aren't merit awards, so they aren't listed.",
  },
  {
    title: "Need-based aid is separate",
    body: "Awards that also weigh financial need are labeled and hidden unless you include them.",
  },
];

export default function HomePage() {
  const soon = closingSoon(new Date());
  const byId = new Map(LISTINGS.map((l) => [l.id, l]));

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <section className="m-hero">
          <div className="m-wrap m-hero-grid">
            <div className="m-hero-copy">
              <span className="m-pill">Free for every student</span>
              <h1 className="m-h1">Merit scholarships, without the noise.</h1>
              <p className="m-lede">
                Meritously is a free catalog of merit awards for high-achieving students: college
                full rides, national awards and the niche scholarships most lists miss. Every
                listing links to its official source.
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
            <ClosingSoon rows={soon} />
          </div>
        </section>

        <section className="m-section" aria-labelledby="kinds-title">
          <div className="m-wrap">
            <div className="m-section-head">
              <span className="m-eyebrow">What&apos;s in the catalog</span>
              <h2 id="kinds-title" className="m-h2">
                Three kinds of merit money, in one place.
              </h2>
            </div>
            <div className="m-kinds">
              {KINDS.map((k) => (
                <div key={k.type} className="m-kind">
                  <h3 className="m-h3">{k.title}</h3>
                  <p className="m-body">{k.body}</p>
                  <ul className="m-kind-examples">
                    {k.examples.map((id) => {
                      const l = byId.get(id);
                      if (!l) return null;
                      return (
                        <li key={id}>
                          <Link href={`/scholarships/${l.slug}`}>{l.name}</Link>
                          <span>{l.provider}</span>
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

        <section className="m-section m-section-alt" aria-labelledby="checks-title">
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
                  <h3 className="m-h3">{c.title}</h3>
                  <p className="m-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="m-section" aria-labelledby="track-title">
          <div className="m-wrap">
            <div className="m-cta">
              <div style={{ display: "grid", gap: 10 }}>
                <h2 id="track-title" className="m-h2">
                  Track every deadline in one place.
                </h2>
                <p className="m-body">
                  Save the awards you&apos;re going after, move them from started to submitted,
                  and see every deadline on one list.
                </p>
              </div>
              <Link href="/sign-up" className="m-btn">
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
