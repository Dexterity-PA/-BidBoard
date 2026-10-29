import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SaveMeritButton from "@/components/merit/SaveMeritButton";
import MatchNote from "@/components/merit/MatchNote";
import DeadlineExport from "@/components/merit/DeadlineExport";
import { deadlineLabel, deadlineOrder, expiredBeforeDate, listedDeadlineState } from "@/lib/merit/deadline-status";
import { isMeritSaved } from "@/app/actions/merit";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import { listingDescription, listingStructuredData, pageMetadata, serializeJsonLd } from "@/lib/merit/seo";
import { getScholarshipTopic, TOPIC_BY_TYPE, topicPath } from "@/lib/merit/topics";
import {
  LISTINGS,
  STATUS_LABEL,
  TAG_LABEL,
  TYPE_LABEL,
  coverageHint,
  formatISODate,
  getDetailListing,
  getVerification,
  requirements,
  timelineSteps,
  verificationState,
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
  const l = getDetailListing(slug);
  if (!l) notFound();
  return {
    ...pageMetadata(`/scholarships/${l.slug}`, `${l.name}, ${l.provider} | Meritously`, listingDescription(l)),
    ...(l.status === "excluded" ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Up to three related listings: same type, sharing a state or program tag, soonest first. */
function related(l: MeritListing): MeritListing[] {
  const today = expiredBeforeDate();
  const keyTags = l.tags.filter((t) => t.startsWith("state:") || t === "stamps" || t.startsWith("major:"));
  const pool = LISTINGS.filter(
    (o) => o.id !== l.id && o.type === l.type && (o.status === "live" || o.status === "mixed-need"),
  );
  const score = (o: MeritListing) =>
    (o.provider === l.provider ? 3 : 0) + keyTags.filter((t) => o.tags.includes(t)).length * 2 + (coverageHint(o) && coverageHint(l) ? 1 : 0);
  return pool
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => deadlineOrder(a.o, today) - deadlineOrder(b.o, today) || b.s - a.s || (a.o.deadlineDate ?? "9999").localeCompare(b.o.deadlineDate ?? "9999"))
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
  const l = getDetailListing(slug);
  if (!l) notFound();

  const retired = l.status === "excluded";
  const topic = getScholarshipTopic(TOPIC_BY_TYPE[l.type])!;
  const saved = retired ? false : await isMeritSaved(l.slug).catch(() => false);
  const hint = retired ? null : coverageHint(l);
  const steps = retired ? [] : timelineSteps(l);
  const needs = retired ? [] : requirements(l);
  const more = related(l);
  const verification = getVerification(l);
  const freshness = verificationState(verification?.checkedAt);
  const reportHref = `mailto:hello@meritously.com?subject=${encodeURIComponent(
    `Listing ${l.id}: ${l.name} (${l.provider})`,
  )}&body=${encodeURIComponent("What looks wrong or out of date?\n\n")}`;
  // Tags already covered by "What you'll need" are not repeated as badges.
  const REQ_TAGS = new Set(["automatic-consideration", "checkbox-opt-in", "separate-application", "honors-application", "nomination", "invitation-only", "recommendations", "essay", "essays", "short-essay", "video", "portfolio", "research-required", "speech", "interview", "finalist-round", "membership", "local-route", "acceptance-required", "fafsa-required", "fee"]);
  const shownTags = l.tags.filter((t) => TAG_LABEL[t] && !REQ_TAGS.has(t));
  const statusClass = l.status === "mixed-need" ? "m-badge-need" : "m-badge-dir";

  return (
    <div className="m-page">
      {!retired && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(listingStructuredData(l)) }} />}
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap">
          <nav className="m-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/scholarships">Browse</Link> <span aria-hidden>/</span>{" "}
            <Link href={topicPath(topic.slug)}>{topic.title}</Link>
          </nav>

          <header className="m-detail-head">
            <span className="m-detail-provider">{l.provider}</span>
            <h1 className="m-detail-title">{l.name}</h1>
            <div className="m-detail-badges">
              {retired && <span className="m-badge">Retired</span>}
              {(l.status === "mixed-need" || l.status === "directory") && (
                <span className={`m-badge ${statusClass}`}>{STATUS_LABEL[l.status]}</span>
              )}
              <span className="m-badge">{TYPE_LABEL[l.type]}</span>
              {hint && <span className="m-badge m-badge-gold">{hint}</span>}
            </div>
          </header>

          <div className="m-detail">
            <aside className="m-card m-detail-actions" aria-label={retired ? "Program status" : "Apply and save"}>
              <span className="m-card-label">{retired ? "Program status" : deadlineLabel(l)}</span>
              <span className="m-card-deadline">
                {retired ? "No longer offered" : l.deadlineDate ? formatISODate(l.deadlineDate) : "No confirmed date"}
              </span>
              {!retired && listedDeadlineState(l) === "past" && <p className="m-fine">This listed date has passed. The next cycle is not confirmed here. Check the provider before preparing an application.</p>}
              {!retired && listedDeadlineState(l) === "later-stage" && <p className="m-fine">An earlier milestone has passed. Read the full timeline below: a later stage may require an earlier application.</p>}
              {!retired && freshness === "stale" && verification?.outcome !== "unavailable" && <p className="m-fine">It’s been at least 90 days since we checked this award. Check the current dates and rules before applying.</p>}
              {l.sources[0] && (
                <a
                  href={l.sources[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-btn m-btn-primary"
                >
                  {retired ? "Read official update" : "Open official page"}
                </a>
              )}
              {!retired && (
                <>
                  <DeadlineExport deadline={{
                    id: l.id, name: l.name, provider: l.provider, deadlineDate: l.deadlineDate,
                    deadlineConfirmed: freshness === "current" && verification?.outcome !== "unavailable" && verification?.outcome !== "retired" && ["supported", "corrected"].includes(verification?.checks?.deadline ?? ""),
                    deadlineDescription: l.deadline,
                    officialUrl: verification?.sourceUrls[0] ?? l.sources[0] ?? null,
                    eligibilityUrl: `https://meritously.com/scholarships/${l.slug}#eligibility`, eligibility: l.eligibility,
                  }} />
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
                </>
              )}
            </aside>

            <div className="m-detail-content">
              {retired && (
                <p className="m-notice m-notice-watch">
                  This program has ended. We’ve kept this page so you can still refer to past applications.
                </p>
              )}
              {l.status === "watchlist" && (
                <p className="m-notice m-notice-watch">
                  Some details for the current application cycle haven’t been published or confirmed yet.
                  Check the official page before making plans.
                </p>
              )}
              {l.status === "mixed-need" && (
                <p className="m-notice m-notice-need">
                  This award considers financial need as well as merit.
                </p>
              )}
              {l.status === "directory" && (
                <p className="m-notice m-notice-dir">
                  One application covers several awards. Each award has its own requirements.
                </p>
              )}

              <dl className="m-facts">
                <div className="m-fact">
                  <dt>{retired ? "Former award" : "Award"}</dt>
                  <dd>{l.value}</dd>
                </div>
                <div className="m-fact">
                  <dt>{retired ? "Program dates" : steps.length ? "Timeline" : "Deadline"}</dt>
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
                    <dt>{retired ? "Application status" : "How to apply"}</dt>
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
                  <div className="m-fact" id="eligibility">
                    <dt>{retired ? "Former eligibility" : "Who can apply"}</dt>
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

            <aside className="m-card m-detail-sources" aria-label="Official sources">
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
                {verification
                  ? <>{verification.outcome === "unavailable" ? "Review attempted" : "Last checked"} {formatISODate(verification.checkedAt)}. </>
                  : <>We haven’t recorded a check date for this award yet. </>}
                {retired ? "The official source records the program's retirement." : "Check the current deadline and requirements on the official page before applying."}
              </p>
              {verification?.notes && <p className="m-fine">{verification.notes}</p>}
              {!!verification?.unresolved?.length && (
                <ul className="m-fine" aria-label="Details still unconfirmed">
                  {verification.unresolved.map((note) => <li key={note}>{note}</li>)}
                </ul>
              )}
              <a href={reportHref} className="m-arrow-link" style={{ fontSize: 13 }}>
                Spot a mistake? Let us know
              </a>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
