import Link from "next/link";
import CopyText from "@/components/merit/CopyText";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import { COUNSELOR_BLURB, COUNSELOR_DESCRIPTION, COUNSELOR_PATH, COUNSELOR_TITLE, STUDENT_PATHS } from "@/lib/merit/counselor-resources";
import { GUIDES, guidePath } from "@/lib/merit/blog";
import { LISTINGS } from "@/lib/merit/catalog";
import { pageMetadata, serializeJsonLd, SITE_URL } from "@/lib/merit/seo";

export const metadata = pageMetadata(COUNSELOR_PATH, COUNSELOR_TITLE, COUNSELOR_DESCRIPTION);

export default function CounselorResourcesPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", url: `${SITE_URL}${COUNSELOR_PATH}`,
    name: COUNSELOR_TITLE, description: COUNSELOR_DESCRIPTION,
    mainEntity: { "@type": "ItemList", itemListElement: STUDENT_PATHS.map((path, index) => ({ "@type": "ListItem", position: index + 1, name: path.title, url: `${SITE_URL}${guidePath(path.slug)}` })) },
  };
  return <div className="m-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <SiteHeader />
    <main className="m-main m-wrap m-guide-index">
      <header className="m-guide-index-head">
        <p className="m-eyebrow">For counselors, advisers and college-access organizations</p>
        <h1 className="m-guide-index-title">Scholarship resources you can share.</h1>
        <p className="m-lede">A place to start a student conversation, a short activity for a group and practical tools families can use at home.</p>
        <p className="m-body">Explore {LISTINGS.length} scholarship and competition listings and {GUIDES.length} guides. Browsing, guides and downloads are free and don&apos;t require an account. Students can optionally create a free account to save awards and track application tasks.</p>
        <div className="m-guide-categories"><Link href="/scholarships/directory" className="m-btn m-btn-primary">Browse the directory</Link><a href="#share" className="m-btn m-btn-ghost">Get sharing text</a><a href="/resources/scholarship-starter-kit.txt" download className="m-btn m-btn-ghost">Download student checklist</a></div>
      </header>
      <section className="m-guide-category" aria-labelledby="student-paths-title">
        <h2 id="student-paths-title" className="m-h2">Choose a starting point</h2>
        <ul className="m-guide-cards">{STUDENT_PATHS.map((path) => <li key={path.slug} className="m-guide-card"><h3 className="m-guide-card-title"><Link href={guidePath(path.slug)}>{path.title}</Link></h3><p className="m-body">{path.description}</p></li>)}</ul>
      </section>
      <section className="m-counselor-activity" aria-labelledby="activity-title">
        <div><p className="m-eyebrow">A suggested 15-minute activity</p><h2 id="activity-title" className="m-h2">Leave with one useful next step</h2><p className="m-body">Students can use a fictional profile if they prefer not to share personal information in a group.</p></div>
        <ol className="m-guide-list m-numbered-list"><li><strong>Pick an opportunity.</strong> Find an award relevant to the student&apos;s year, interests or college plans.</li><li><strong>Open the official source.</strong> Identify the current cycle, eligibility and application method. Mark anything unclear.</li><li><strong>Identify the work.</strong> List the essay, documents, recommendation or nomination needed.</li><li><strong>Choose the next action.</strong> Add one task and a target date to the tracker. If eligibility is uncertain, make the task a question for the provider.</li></ol>
      </section>
      <section className="m-guide-tools" aria-labelledby="downloads-title"><div><h2 id="downloads-title" className="m-h2">Free tools for students</h2><p className="m-body">The spreadsheets open in Excel, Google Sheets and other spreadsheet apps. The checklist is a plain text file.</p></div><ul className="m-guide-list"><li><a href="/resources/scholarship-tracker.csv" className="m-guide-link" download>Scholarship deadline tracker</a></li><li><a href="/resources/award-comparison.csv" className="m-guide-link" download>Award comparison worksheet</a></li><li><a href="/resources/scholarship-starter-kit.txt" className="m-guide-link" download>Student search checklist</a></li></ul></section>
      <section id="share" className="m-guide-category m-counselor-share" aria-labelledby="share-title"><h2 id="share-title" className="m-h2">Ready for a newsletter or school resource page</h2><p className="m-body">Use or adapt this text. It describes the resource without implying that your organization endorses it.</p><p className="m-share-blurb">{COUNSELOR_BLURB}</p><CopyText text={COUNSELOR_BLURB} label="Copy sharing text" fallback="Copy isn't available. Select the sharing text above and copy it manually." /><p className="m-body">Page link: <a href={`${SITE_URL}${COUNSELOR_PATH}`} className="m-guide-link">{SITE_URL}{COUNSELOR_PATH}</a></p><CopyText text={`${SITE_URL}${COUNSELOR_PATH}`} label="Copy page link" fallback="Copy isn't available. Select the page link above and copy it manually." /></section>
      <section className="m-guide-category" aria-labelledby="review-title"><h2 id="review-title" className="m-h2">Before recommending an award</h2><ul className="m-guide-list"><li>Confirm current eligibility and deadlines on the provider&apos;s official website. Some catalog dates are unconfirmed or belong to an earlier cycle.</li><li>Check what the money covers and the requirements for renewing it. A large award does not necessarily cover the total cost of attendance.</li><li>Use the catalog as a research starting point. Meritously does not administer the listed awards or guarantee selection.</li><li>Review <Link href="/privacy" className="m-guide-link">the privacy policy</Link> and <Link href="/terms" className="m-guide-link">terms</Link> before introducing optional accounts in a school setting.</li></ul><p className="m-body">Found an error or a student need the guides don&apos;t address? <a href="mailto:hello@meritously.com" className="m-guide-link">Send feedback</a>.</p></section>
    </main><SiteFooter />
  </div>;
}
