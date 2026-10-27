import type { MetadataRoute } from "next";
import { getVerification, LISTINGS } from "@/lib/merit/catalog";
import { SITE_URL } from "@/lib/merit/seo";
import { SCHOLARSHIP_TOPICS, topicPath } from "@/lib/merit/topics";

const siteUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/scholarships`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/scholarships/directory`, changeFrequency: "weekly", priority: 0.8 },
    ...SCHOLARSHIP_TOPICS.map((topic) => ({
      url: `${siteUrl}${topicPath(topic.slug)}`, changeFrequency: "weekly" as const, priority: 0.8,
    })),
    ...LISTINGS.map((l) => {
      const checkedAt = getVerification(l)?.checkedAt;
      return {
        url: `${siteUrl}/scholarships/${l.slug}`,
        ...(checkedAt ? { lastModified: `${checkedAt}T00:00:00Z` } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    }),
  ];
}
