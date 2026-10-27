import type { Metadata } from "next";
import type { MeritListing } from "./catalog";
import { getScholarshipTopic, TOPIC_BY_TYPE, topicPath } from "./topics";

export const SITE_URL = "https://meritously.com";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: `${SITE_URL}${path}`, siteName: "Meritously", type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function listingDescription(listing: MeritListing): string {
  const text = `${listing.name} from ${listing.provider}. ${listing.value} Deadline: ${listing.deadline} Eligibility: ${listing.eligibility}`
    .replace(/\s+/g, " ").trim();
  if (text.length <= 300) return text;
  return `${text.slice(0, 297).replace(/\s+\S*$/, "")}...`;
}

/** Escape catalog text before embedding it in an HTML script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": `${SITE_URL}/#organization`,
      name: "Meritously", url: SITE_URL,
      logo: {
        "@type": "ImageObject", url: `${SITE_URL}/meritously-mark.png`, width: 512, height: 512,
      },
    },
    {
      "@type": "WebSite", "@id": `${SITE_URL}/#website`,
      name: "Meritously", url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-US",
    },
  ],
};

export function listingStructuredData(listing: MeritListing) {
  const url = `${SITE_URL}/scholarships/${listing.slug}`;
  const topic = getScholarshipTopic(TOPIC_BY_TYPE[listing.type])!;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${url}#webpage`, url,
        name: `${listing.name}, ${listing.provider} | Meritously`,
        description: listingDescription(listing),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Meritously", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Scholarships and competitions", item: `${SITE_URL}/scholarships` },
          { "@type": "ListItem", position: 3, name: topic.title, item: `${SITE_URL}${topicPath(topic.slug)}` },
          { "@type": "ListItem", position: 4, name: listing.name, item: url },
        ],
      },
    ],
  };
}

export function collectionStructuredData(path: string, title: string, description: string, listings: MeritListing[]) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: title, description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList", numberOfItems: listings.length,
          itemListElement: listings.map((listing, index) => ({
            "@type": "ListItem", position: index + 1, name: `${listing.name}, ${listing.provider}`,
            url: `${SITE_URL}/scholarships/${listing.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Meritously", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Scholarships and competitions", item: `${SITE_URL}/scholarships` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };
}
