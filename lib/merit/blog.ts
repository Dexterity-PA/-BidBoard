import { GUIDES as ORIGINAL_GUIDES } from "./blog-content";
import { EXPANSION_GUIDES } from "./blog-expansion";
import { STUDENT_GUIDES } from "./blog-student-guides";
import { FUNDING_GUIDES } from "./blog-funding-guides";
import { MERIT_SEARCH_GUIDES } from "./blog-merit-search-guides";
import { APPLICATION_GUIDES } from "./blog-application-guides";
import { pageMetadata, SITE_URL } from "./seo";
import type { Guide } from "./blog-types";
import { TOPIC_GUIDE_PICKS } from "./blog-discovery";

export const GUIDE_PUBLISHED_AT = "2026-10-27T15:53:33Z";
export const GUIDE_DATE = "2026-10-27";
export const GUIDE_CATEGORIES = ["Finding scholarships", "Applications", "Understanding awards"] as const;
export const BLOG_TITLE = "Scholarship guides: merit aid and applications | Meritously";
export const BLOG_DESCRIPTION = "Find merit scholarships, check GPA and deadline rules, write stronger applications and compare offers. Practical guides with official sources and free templates.";
export const GUIDES: Guide[] = [...ORIGINAL_GUIDES, ...EXPANSION_GUIDES, ...STUDENT_GUIDES, ...FUNDING_GUIDES, ...MERIT_SEARCH_GUIDES, ...APPLICATION_GUIDES];
export const guidePublishedAt = (guide: Guide) => guide.publishedAt ?? GUIDE_PUBLISHED_AT;
export const guideModifiedAt = (guide: Guide) => guide.updatedAt ?? guidePublishedAt(guide);
export const BLOG_UPDATED_AT = GUIDES.map(guideModifiedAt).sort().at(-1)!;
export const guideDisplayDate = (guide: Guide) => new Date(guidePublishedAt(guide)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Phoenix" });
export const guidePath = (slug: string) => `/blog/${slug}`;
export const categoryId = (category: string) => category.toLowerCase().replaceAll(" ", "-");
export const getGuide = (slug: string) => GUIDES.find((guide) => guide.slug === slug);

export function getTopicGuides(topic: string) {
  const matches = GUIDES.filter((guide) => guide.topics.includes(topic));
  const preferred = (TOPIC_GUIDE_PICKS[topic] ?? []).flatMap((slug) => {
    const guide = matches.find((entry) => entry.slug === slug);
    return guide ? [guide] : [];
  });
  return [...preferred, ...matches.filter((guide) => !preferred.includes(guide))].slice(0, 6);
}

/** Only text and explicit https or root-relative links are supported. No raw HTML. */
export function inlineParts(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  let cursor = 0;
  for (const match of text.matchAll(/\[([^\]]+)\]\((https:\/\/[^)\s]+|\/(?!\/)[^)\s]+)\)/g)) {
    if (match.index! > cursor) parts.push({ text: text.slice(cursor, match.index) });
    parts.push({ text: match[1], href: match[2] });
    cursor = match.index! + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

export function guideText(guide: Guide) {
  return [guide.title, ...guide.intro, ...guide.sections.flatMap((section) => [
    section.title, ...(section.paragraphs ?? []), ...(section.list ?? []),
    ...(section.table ? [...section.table.headers, ...section.table.rows.flat()] : []),
    ...(section.paragraphsAfter ?? []),
  ])].map((text) => inlineParts(text).map((part) => part.text).join("")).join(" ");
}

export const readingMinutes = (guide: Guide) => Math.max(1, Math.ceil(guideText(guide).split(/\s+/).length / 220));

export function guideMetadata(guide: Guide) {
  const path = guidePath(guide.slug);
  const metadata = pageMetadata(path, `${guide.seoTitle ?? guide.title} | Meritously`, guide.description);
  return {
    ...metadata,
    authors: [{ name: "Meritously", url: SITE_URL }],
    openGraph: {
      ...metadata.openGraph, type: "article" as const,
      publishedTime: guidePublishedAt(guide), modifiedTime: guideModifiedAt(guide),
      authors: [SITE_URL], section: guide.category,
      images: [{ url: `${SITE_URL}${path}/opengraph-image`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: { ...metadata.twitter, images: [`${SITE_URL}${path}/opengraph-image`] },
  };
}

export function guideStructuredData(guide: Guide) {
  const url = `${SITE_URL}${guidePath(guide.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting", "@id": `${url}#article`, url, mainEntityOfPage: url,
        headline: guide.title, description: guide.description, articleSection: guide.category,
        datePublished: guidePublishedAt(guide), dateModified: guideModifiedAt(guide),
        author: { "@type": "Organization", name: "Meritously", url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization`, "@type": "Organization", name: "Meritously", url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/meritously-mark.png` } },
        image: `${url}/opengraph-image`, inLanguage: "en-US",
        wordCount: guideText(guide).split(/\s+/).length,
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Meritously", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Scholarship guides", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };
}

export function blogStructuredData() {
  return {
    "@context": "https://schema.org", "@type": "Blog", "@id": `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`, name: BLOG_TITLE, description: BLOG_DESCRIPTION,
    blogPost: GUIDES.map((guide) => ({ "@type": "BlogPosting", headline: guide.title, url: `${SITE_URL}${guidePath(guide.slug)}` })),
  };
}

export function xmlEscape(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function guideFeed() {
  const date = new Date(BLOG_UPDATED_AT).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${BLOG_TITLE}</title><link>${SITE_URL}/blog</link><description>${xmlEscape(BLOG_DESCRIPTION)}</description>
<language>en-us</language><lastBuildDate>${date}</lastBuildDate>
<atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${GUIDES.map((guide) => `<item><title>${xmlEscape(guide.title)}</title><link>${SITE_URL}${guidePath(guide.slug)}</link><guid isPermaLink="true">${SITE_URL}${guidePath(guide.slug)}</guid><description>${xmlEscape(guide.description)}</description><pubDate>${new Date(guidePublishedAt(guide)).toUTCString()}</pubDate><category>${xmlEscape(guide.category)}</category></item>`).join("\n")}
</channel></rss>`;
}
