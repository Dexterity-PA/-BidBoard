import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SaveMeritButton from "@/components/merit/SaveMeritButton";
import MatchNote from "@/components/merit/MatchNote";
import { isMeritSaved } from "@/app/actions/merit";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import {
  LAST_CHECKED,
  LISTINGS,
  STATUS_LABEL,
  TAG_LABEL,
  TYPE_LABEL,
  coverageHint,
  formatISODate,
  getListing,
  requirements,
  timelineSteps,
  type MeritListing,
} from "@/lib/merit/catalog";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const l = getListing(slug);
  if (!l) return { title: "Scholarship not found | Meritously" };
  return {
    title: `${l.name}, ${l.provider} | Meritously`,
    description: `${l.value} Deadline: ${l.deadline}.`.slice(0, 300),
  };
}

/** Up to three related listings: same type, sharing a state or program tag, soonest first. */
function related(l: MeritListing): MeritListing[] {
  const keyTags = l.tags.filter((t) => t.startsWith("state:") || t === "stamps" || t.startsWith("major:"));
  const pool = LISTINGS.filter(
    (o) => o.id !== l.id && o.type === l.type && (o.status === "live" || o.status === "mixed-need"),
  );
  const score = (o: MeritListing) =>
    (o.provider === l.provider ? 3 : 0) + keyTags.filter((t) => o.tags.includes(t)).length * 2 + (coverageHint(o) && coverageHint(l) ? 1 : 0);
  return pool
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || (a.o.deadlineDate ?? "9999").localeCompare(b.o.deadlineDate ?? "9999"))
    .slice(0, 3)
    .map((x) => x.o);
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = getListing(slug);
  if (!l) notFound();

  const saved = await isMeritSaved(l.slug).catch(() => false);
  const hint = coverageHint(l);
  const steps = timelineSteps(l);
  const needs = requirements(l);
  const more = related(l);
  const reportHref = `mailto:hello@bidboard.app?subject=${encodeURIComponent(
    `Listing ${l.id}: ${l.name} (${l.provider})`,
  )}&body=${encodeURIComponent("What looks wrong or out of date?\n\n")}`;
  // Tags already covered by "What you'll need" are not repeated as badges.
  const REQ_TAGS = new Set(["automatic-consideration", "checkbox-opt-in", "separate-application", "honors-application", "nomination", "self-nomination", "invitation-only", "recommendations", "essay", "short-essay", "video", "portfolio", "research", "speech", "interview", "finalist-round", "membership", "local-route", "acceptance-required", "fafsa-required", "fee"]);
  const shownTags = l.tags.filter((t) => TAG_LABEL[t] && !REQ_TAGS.has(t));
  const statusClass =
    l.status === "live"
      ? "m-badge-verified"
      : l.status === "watchlist"
        ? "m-badge-watch"
        : l.status === "mixed-need"
          ? "m-badge-need"
          : "m-badge-dir";

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap">
          <nav className="m-crumb" aria-label="Breadcrumb">
            <Link href="/scholarships">Browse</Link> <span aria-hidden>/</span>{" "}
            <Link href={`/scholarships?type=${l.type}`}>{TYPE_LABEL[l.type]}s</Link>
          </nav>

          <header className="m-detail-head">
            <span className="m-detail-provider">{l.provider}</span>
            <h1 className="m-detail-title">{l.name}</h1>
            <div className="m-detail-badges">
              {l.status !== "excluded" && (
                <span className={`m-badge ${statusClass}`}>{STATUS_LABEL[l.status]}</span>
              )}
              <span className="m-badge">{TYPE_LABEL[l.type]}</span>
              {hint && <span className="m-badge m-badge-gold">{hint}</span>}
            </div>
          </header>

          <div className="m-detail">
            <div>
              {l.status === "watchlist" && (
                <p className="m-notice m-notice-watch">
                  This is a real program, but some details for the current cycle are not
                  published or not yet confirmed. Check the official source before you plan
                  around it.
                </p>
              )}
              {l.status === "mixed-need" && (
                <p className="m-notice m-notice-need">
                  Financial need is part of how this award is decided, alongside merit.
                </p>
              )}
              {l.status === "directory" && (
                <p className="m-notice m-notice-dir">
                  This is a group of awards reached through one application. Each award inside it
                  has its own rules.
                </p>
              )}

              <dl className="m-facts">
                <div className="m-fact">
                  <dt>Award</dt>
                  <dd>{l.value}</dd>
                </div>
                <div className="m-fact">
                  <dt>{steps.length ? "Timeline" : "Deadline"}</dt>
                  <dd>
                    {steps.length ? (
                      <ol className="m-steps">
                        {steps.map((st, i) => (
                          <li key={i} className="m-step">
                            <span className="m-step-date">{st.date}</span>
                            <span>{st.label}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      l.deadline || "Not published yet"
                    )}
                  </dd>
                </div>
                {l.apply && (
                  <div className="m-fact">
                    <dt>How to apply</dt>
                    <dd>{l.apply}</dd>
                  </div>
                )}
                {needs.length > 0 && (
                  <div className="m-fact">
                    <dt>What you&apos;ll need</dt>
                    <dd>
                      <ul className="m-needs">
                        {needs.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {l.eligibility && (
                  <div className="m-fact">
                    <dt>Who can apply</dt>
                    <dd>{l.eligibility}</dd>
                  </div>
                )}
                {l.notes && (
                  <div className="m-fact">
                    <dt>Good to know</dt>
                    <dd>{l.notes}</dd>
                  </div>
                )}
                {shownTags.length > 0 && (
                  <div className="m-fact">
                    <dt>Details</dt>
                    <dd>
                      <div className="m-detail-badges">
                        {shownTags.map((t) => (
                          <span key={t} className="m-badge">
                            {TAG_LABEL[t]}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>

              {more.length > 0 && (
                <section className="m-related" aria-labelledby="related-title">
                  <h2 id="related-title" className="m-h3">
                    Similar awards
                  </h2>
                  <ul className="m-related-list">
                    {more.map((o) => (
                      <li key={o.id}>
                        <Link href={`/scholarships/${o.slug}`} className="m-related-card">
                          <span className="m-row-provider">{o.provider}</span>
                          <span className="m-related-name">{o.name}</span>
                          <span className="m-fine">
                            {o.deadlineDate ? `Due ${formatISODate(o.deadlineDate)}` : "No confirmed date"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="m-aside">
              <div className="m-card">
                <span className="m-card-label">Next deadline</span>
                <span className="m-card-deadline">
                  {l.deadlineDate ? formatISODate(l.deadlineDate) : "No confirmed date"}
                </span>
                {l.sources[0] && (
                  <a
                    href={l.sources[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m-btn m-btn-primary"
                  >
                    Open official page
                  </a>
                )}
                <MatchNote record={l} />
                <SignedIn>
                  <SaveMeritButton slug={l.slug} initiallySaved={saved} />
                </SignedIn>
                <SignedOut>
                  <Link
                    href={`/sign-up?redirect_url=${encodeURIComponent(`/scholarships/${l.slug}`)}`}
                    className="m-btn m-btn-ghost"
                  >
                    Sign up to save this award
                  </Link>
                </SignedOut>
              </div>

              <div className="m-card">
                <span className="m-card-label">Official sources</span>
                <ul className="m-sources">
                  {l.sources.map((s) => (
                    <li key={s}>
                      <a href={s} target="_blank" rel="noopener noreferrer">
                        {hostOf(s)}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="m-fine">
                  Details last checked {formatISODate(LAST_CHECKED)}. Programs change their rules,
                  so confirm on the official page before applying.
                </p>
                <a href={reportHref} className="m-arrow-link" style={{ fontSize: 13 }}>
                  Report a problem with this listing
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
