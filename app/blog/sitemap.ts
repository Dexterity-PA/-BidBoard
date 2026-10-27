import type { MetadataRoute } from "next";
import { GUIDES, guideModifiedAt, guidePath } from "@/lib/merit/blog";
import { SITE_URL } from "@/lib/merit/seo";

/** A separate submission lets Search Console report on the guide library. */
export default function sitemap(): MetadataRoute.Sitemap {
  return GUIDES.map((guide) => ({
    url: `${SITE_URL}${guidePath(guide.slug)}`,
    lastModified: guideModifiedAt(guide),
  }));
}
