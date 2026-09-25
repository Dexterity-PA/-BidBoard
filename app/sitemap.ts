import type { MetadataRoute } from "next";
import { LAST_CHECKED, LISTINGS } from "@/lib/merit/catalog";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${LAST_CHECKED}T00:00:00Z`);
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/scholarships`, changeFrequency: "daily", priority: 0.9 },
    ...LISTINGS.map((l) => ({
      url: `${siteUrl}/scholarships/${l.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
