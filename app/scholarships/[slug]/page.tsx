import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignedOut } from "@clerk/nextjs";
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
  if (!l) return { title: "Scholarship not found | BidBoard" };
  return {
    title: `${l.name}, ${l.provider} | BidBoard`,
    description: `${l.value} Deadline: ${l.deadline}.`.slice(0, 300),
  };
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

  const hint = coverageHint(l);
  const shownTags = l.tags.filter((t) => TAG_LABEL[t]);
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
            <span className="m-eyebrow">{l.provider}</span>
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
                  <dt>Deadline</dt>
                  <dd>{l.deadline || "Not published yet"}</dd>
                </div>
                {l.apply && (
                  <div className="m-fact">
                    <dt>How to apply</dt>
                    <dd>{l.apply}</dd>
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
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
