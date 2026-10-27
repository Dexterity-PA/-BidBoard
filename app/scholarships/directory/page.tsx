import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import ScholarshipTopics from "@/components/merit/ScholarshipTopics";
import { LISTINGS } from "@/lib/merit/catalog";
import { collectionStructuredData, pageMetadata, serializeJsonLd } from "@/lib/merit/seo";

export const metadata = pageMetadata(
  "/scholarships/directory",
  "Scholarship and competition directory | Meritously",
  "Browse every college merit program, scholarship and competition in the Meritously catalog by name and provider. Read eligibility, deadlines and official sources.",
);

const groups = [
  { type: "college-program", title: "College merit programs" },
  { type: "scholarship", title: "Scholarships" },
  { type: "competition", title: "Competitions" },
] as const;

export default function DirectoryPage() {
  const orderedListings = groups.flatMap((group) => LISTINGS.filter((listing) => listing.type === group.type)
    .sort((a, b) => a.name.localeCompare(b.name, "en") || a.provider.localeCompare(b.provider, "en")));
  return (
    <div className="m-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionStructuredData(
        "/scholarships/directory", "Scholarship and competition directory", String(metadata.description), orderedListings,
      )) }} />
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap m-directory">
          <nav className="m-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/scholarships">Scholarships</Link><span aria-hidden="true">/</span>
            <span aria-current="page">Full directory</span>
          </nav>
          <header className="m-browse-head">
            <span className="m-eyebrow">Full catalog</span>
            <h1 className="m-h2">Scholarship and competition directory</h1>
            <p className="m-lede">
              All {LISTINGS.length} listings, including awards with unconfirmed dates and awards
              that consider financial need. Open a listing for its current details and official sources.
            </p>
            <Link href="/scholarships" className="m-arrow-link">Search and filter awards</Link>
          </header>
          <section aria-labelledby="directory-topics">
            <h2 id="directory-topics" className="m-h3">Browse by scholarship type</h2>
            <ScholarshipTopics />
          </section>
          <nav className="m-directory-nav" aria-label="Award categories">
            {groups.map((group) => (
              <a key={group.type} href={`#${group.type}`} className="m-btn m-btn-ghost m-btn-sm">{group.title}</a>
            ))}
          </nav>
          {groups.map((group) => (
            <section key={group.type} id={group.type} className="m-directory-section" aria-labelledby={`${group.type}-title`}>
              <h2 id={`${group.type}-title`} className="m-h3">{group.title}</h2>
              <ul className="m-directory-list">
                {orderedListings.filter((listing) => listing.type === group.type)
                  .map((listing) => (
                    <li key={listing.id}>
                      <Link href={`/scholarships/${listing.slug}`} prefetch={false} className="m-directory-link">
                        <span className="m-directory-name">{listing.name}</span>
                        <span className="m-fine">{listing.provider}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
