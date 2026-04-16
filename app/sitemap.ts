import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

const staticPages: MetadataRoute.Sitemap = [
  { url: siteUrl, changeFrequency: "monthly", priority: 1.0 },
  { url: `${siteUrl}/scholarships`, changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/pricing`, changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await db
      .select({ slug: scholarships.slug, updatedAt: scholarships.updatedAt })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    const scholarshipPages: MetadataRoute.Sitemap = rows.map((r) => ({
      url: `${siteUrl}/scholarships/${r.slug}`,
      lastModified: r.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...scholarshipPages];
  } catch {
    // Migration not yet applied — return static pages only.
    return staticPages;
  }
}
