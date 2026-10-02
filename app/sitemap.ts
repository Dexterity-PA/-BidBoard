import type { MetadataRoute } from "next";
import { getVerification, LISTINGS } from "@/lib/merit/catalog";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meritously.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/scholarships`, changeFrequency: "daily", priority: 0.9 },
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
