import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";

/** Single indexed SELECT by slug. Returns undefined if not found. */
export async function getScholarshipBySlug(slug: string) {
  return db.query.scholarships.findFirst({
    where: eq(scholarships.slug, slug),
  });
}
