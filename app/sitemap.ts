import type { MetadataRoute } from "next";
import { getVerification, LISTINGS } from "@/lib/merit/catalog";
import { SITE_URL } from "@/lib/merit/seo";
import { SCHOLARSHIP_TOPICS, topicPath } from "@/lib/merit/topics";
import { GUIDES, BLOG_UPDATED_AT, guideModifiedAt, guidePath } from "@/lib/merit/blog";

const siteUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/scholarships`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/scholarships/directory`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: BLOG_UPDATED_AT, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/for-counselors`, lastModified: "2026-10-27", changeFrequency: "monthly", priority: 0.8 },
    ...GUIDES.map((guide) => ({ url: `${siteUrl}${guidePath(guide.slug)}`, lastModified: guideModifiedAt(guide), changeFrequency: "monthly" as const, priority: 0.7 })),
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
