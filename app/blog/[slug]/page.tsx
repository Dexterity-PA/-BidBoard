import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import { GuideInline, GuideSectionContent } from "@/components/merit/GuideContent";
import CopyText from "@/components/merit/CopyText";
import { GUIDES, categoryId, getGuide, guideDisplayDate, guideMetadata, guideModifiedAt, guidePath, guidePublishedAt, guideStructuredData, readingMinutes } from "@/lib/merit/blog";
import { serializeJsonLd, SITE_URL } from "@/lib/merit/seo";
import { getScholarshipTopic, topicPath } from "@/lib/merit/topics";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return GUIDES.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  return guideMetadata(guide);
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const modified = guideModifiedAt(guide);
  const wasUpdated = modified !== guidePublishedAt(guide);
  const displayDate = wasUpdated ? new Date(modified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Phoenix" }) : guideDisplayDate(guide);
  return <div className="m-page m-editorial">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(guideStructuredData(guide)) }} />
    <SiteHeader />
    <main className="m-main m-wrap m-guide-shell">
      <nav className="m-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Guides</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.category}</span></nav>
      <article className="m-guide-article">
        <header className="m-guide-header">
          <Link href={`/blog#${categoryId(guide.category)}`} className="m-eyebrow m-guide-link">{guide.category}</Link>
          <h1 className="m-guide-title">{guide.title}</h1>
          <p className="m-guide-meta">By <Link href="/#about" className="m-guide-link">Meritously</Link> · <span>{wasUpdated ? "Updated" : "Published"} <time dateTime={modified}>{displayDate}</time></span> · {readingMinutes(guide)} min read</p>
          {guide.intro.map((paragraph) => <p key={paragraph} className="m-guide-intro"><GuideInline text={paragraph} /></p>)}
        </header>
        {guide.sections.length > 2 && <nav className="m-guide-toc" aria-label="In this guide"><p className="m-eyebrow">In this guide</p><ol className="m-guide-toc-list">{guide.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol></nav>}
        {guide.sections.map((section) => <GuideSectionContent key={section.id} section={section} />)}
        <footer className="m-guide-note"><CopyText text={`${SITE_URL}${guidePath(guide.slug)}`} label="Copy link to this guide" fallback="Copy isn't available. Copy the page address from your browser instead." /><p>Published by Meritously. The date above reflects this article’s publication or revision. Check the linked official sources for current eligibility, award terms and application dates.</p><p>Sharing with a class or advising group? <Link href="/for-counselors" className="m-guide-link">Get counselor resources and sharing text</Link>.</p><p>Found a detail that needs correcting? <a href="mailto:hello@meritously.com" className="m-guide-link">Let us know</a>.</p></footer>
      </article>
      <aside className="m-guide-more" aria-labelledby="related-title">
        <section><h2 id="related-title" className="m-h3">Keep reading</h2><ul className="m-guide-more-list">{guide.related.map((slug) => {
          const related = getGuide(slug)!;
          return <li key={slug}><Link href={guidePath(slug)} className="m-guide-link">{related.title}</Link></li>;
        })}</ul></section>
        <section><h2 className="m-h3">Find relevant awards</h2><ul className="m-guide-more-list">{guide.topics.map((slug) => <li key={slug}><Link href={topicPath(slug)} className="m-guide-link">{getScholarshipTopic(slug)!.title}</Link></li>)}</ul><Link href="/scholarships/directory" className="m-arrow-link">Browse the full directory</Link></section>
      </aside>
    </main>
    <SiteFooter />
  </div>;
}
