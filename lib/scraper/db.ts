import { db } from "../../db";
import { scholarships } from "../../db/schema";
import { NormalizedScholarship } from "./normalizer";
import { and, eq } from "drizzle-orm";

/**
 * Upserts a scholarship record into the database.
 * 
 * Prevents duplicates based on (name, provider).
 * Updates 'lastVerified' and amount/eligibility details if found.
 */
export async function upsertScholarship(data: NormalizedScholarship, sourceUrl: string) {
  const { name, provider, deadline, amount_min, amount_max, eligibility_tags, essay_required } = data;

  try {
    // Look for existing record based on name and provider only.
    // Note: Drizzle ORM doesn't have a simple "upsert on (col1, col2)" helper yet,
    // so we handle it manually.
    const existing = await db.query.scholarships.findFirst({
      where: and(
        eq(scholarships.name, name),
        eq(scholarships.provider, provider)
      ),
    });

    if (existing) {
      console.log(`[DB] Updating existing scholarship: ${name} (ID: ${existing.id})`);
      await db.update(scholarships)
        .set({
          amountMin: amount_min,
          amountMax: amount_max,
          requiresEssay: essay_required,
          eligibleEthnicities: eligibility_tags, // Mapping tags to a relevant field
          lastVerified: new Date(),
          updatedAt: new Date(),
          isActive: true, // Reactivate if it was dormant
          sourceUrl, 
        })
        .where(eq(scholarships.id, existing.id));
      return existing.id;
    } else {
      console.log(`[DB] Inserting new scholarship: ${name}`);
      const [inserted] = await db.insert(scholarships)
        .values({
          name,
          provider,
          deadline,
          amountMin: amount_min,
          amountMax: amount_max,
          requiresEssay: essay_required,
          eligibleEthnicities: eligibility_tags,
          source: "Scraper Pipeline",
          sourceUrl,
          lastVerified: new Date(),
          isVerified: false, // For manual review later
          isActive: true,
        })
        .returning({ id: scholarships.id });
      return inserted.id;
    }
  } catch (error) {
    console.error(`[DB] Upsert error for scholarship "${name}":`, error);
    // Don't throw for every single item failure, just log it.
    return null;
  }
}
