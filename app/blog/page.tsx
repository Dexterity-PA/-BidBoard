import Link from "next/link";
import GuideLibrary from "@/components/merit/GuideLibrary";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import { BLOG_DESCRIPTION, BLOG_TITLE, GUIDES, GUIDE_CATEGORIES, blogStructuredData, categoryId, getGuide, guidePath, readingMinutes } from "@/lib/merit/blog";
import { GUIDE_READING_PATHS } from "@/lib/merit/blog-discovery";
import { pageMetadata, serializeJsonLd } from "@/lib/merit/seo";

export const metadata = {
  ...pageMetadata("/blog", BLOG_TITLE, BLOG_DESCRIPTION),
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
};

export default function BlogPage() {
  return <div className="m-page m-editorial">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogStructuredData()) }} />
    <SiteHeader />
    <main className="m-main m-wrap m-guide-index">
      <header className="m-guide-index-head">
        <p className="m-eyebrow">The Meritously blog</p>
        <h1 className="m-guide-index-title">Scholarships, explained.</h1>
        <p className="m-lede">Find awards that fit. Write an application that sounds like you. Understand what an offer would actually cover.</p>
        <p className="m-fine">{GUIDES.length} practical guides with official sources, examples and free templates.</p>
        <p className="m-body">Helping a group of students? <Link href="/for-counselors" className="m-guide-link">Get counselor resources and sharing text</Link>.</p>
        <nav className="m-guide-categories" aria-label="Guide categories">{GUIDE_CATEGORIES.map((category) => <a key={category} href={`#${categoryId(category)}`} className="m-guide-category-link">{category}</a>)}</nav>
      </header>
      <section className="m-guide-paths" aria-labelledby="reading-paths-title">
        <h2 id="reading-paths-title" className="m-h2">What are you working on?</h2>
        <div className="m-guide-path-grid">{GUIDE_READING_PATHS.map((path) => <section key={path.title} className="m-guide-path">
          <h3 className="m-h3">{path.title}</h3>
          <p className="m-body">{path.description}</p>
          <ul className="m-guide-more-list">{path.slugs.map((slug) => {
            const guide = getGuide(slug)!;
            return <li key={slug}><Link href={guidePath(slug)} className="m-guide-link">{guide.seoTitle ?? guide.title}</Link></li>;
          })}</ul>
        </section>)}</div>
      </section>
      <GuideLibrary categories={GUIDE_CATEGORIES} guides={GUIDES.map((guide) => ({ slug: guide.slug, title: guide.title, description: guide.description, category: guide.category, minutes: readingMinutes(guide) }))} />
      <section className="m-guide-tools" aria-labelledby="tools-title">
        <div><p className="m-eyebrow">Keep it simple</p><h2 id="tools-title" className="m-h2">Free planning tools</h2><p className="m-body">Open the CSV files in your preferred spreadsheet app, or start with a plain text checklist.</p></div>
        <ul className="m-guide-list"><li><a href="/resources/scholarship-tracker.csv" className="m-guide-link" download>Scholarship deadline tracker</a></li><li><a href="/resources/award-comparison.csv" className="m-guide-link" download>Award comparison worksheet</a></li><li><a href="/resources/scholarship-starter-kit.txt" className="m-guide-link" download>Student search checklist</a></li><li><a href="/resources/scholarship-application-checklist.txt" className="m-guide-link" download>Application submission checklist</a></li></ul>
      </section>
      <p className="m-fine">Published by Meritously. Provider examples link to their official sources. Check the current award terms before applying. <Link href="/blog/feed.xml" className="m-guide-link">Follow the RSS feed</Link>.</p>
    </main>
    <SiteFooter />
  </div>;
}
