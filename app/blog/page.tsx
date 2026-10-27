import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import { BLOG_DESCRIPTION, BLOG_TITLE, GUIDES, GUIDE_CATEGORIES, blogStructuredData, categoryId, guidePath, readingMinutes } from "@/lib/merit/blog";
import { pageMetadata, serializeJsonLd } from "@/lib/merit/seo";

export const metadata = {
  ...pageMetadata("/blog", BLOG_TITLE, BLOG_DESCRIPTION),
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
};

export default function BlogPage() {
  return <div className="m-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogStructuredData()) }} />
    <SiteHeader />
    <main className="m-main m-wrap m-guide-index">
      <header className="m-guide-index-head">
        <p className="m-eyebrow">The Meritously blog</p>
        <h1 className="m-guide-index-title">Scholarships, explained.</h1>
        <p className="m-lede">Find awards that fit. Write an application that sounds like you. Understand what an offer would actually cover.</p>
        <p className="m-fine">Practical guides with official sources, examples and free templates.</p>
        <nav className="m-guide-categories" aria-label="Guide categories">{GUIDE_CATEGORIES.map((category) => <a key={category} href={`#${categoryId(category)}`} className="m-btn m-btn-ghost">{category}</a>)}</nav>
      </header>
      {GUIDE_CATEGORIES.map((category) => <section key={category} id={categoryId(category)} className="m-guide-category" aria-labelledby={`${categoryId(category)}-title`}>
        <h2 id={`${categoryId(category)}-title`} className="m-h2">{category}</h2>
        <ul className="m-guide-cards">{GUIDES.filter((guide) => guide.category === category).map((guide) => <li key={guide.slug} className="m-guide-card">
          <p className="m-fine">{readingMinutes(guide)} min read</p>
          <h3 className="m-guide-card-title"><Link href={guidePath(guide.slug)}>{guide.title}</Link></h3>
          <p className="m-body">{guide.description}</p>
        </li>)}</ul>
      </section>)}
      <section className="m-guide-tools" aria-labelledby="tools-title">
        <div><p className="m-eyebrow">Keep it simple</p><h2 id="tools-title" className="m-h2">Two free spreadsheet templates</h2><p className="m-body">Open the CSV files in your preferred spreadsheet app.</p></div>
        <ul className="m-guide-list"><li><a href="/resources/scholarship-tracker.csv" className="m-guide-link" download>Scholarship deadline tracker</a></li><li><a href="/resources/award-comparison.csv" className="m-guide-link" download>Award comparison worksheet</a></li></ul>
      </section>
      <p className="m-fine">Published by Meritously. Provider examples link to their official sources. Check the current award terms before applying. <Link href="/blog/feed.xml" className="m-guide-link">Follow the RSS feed</Link>.</p>
    </main>
    <SiteFooter />
  </div>;
}
