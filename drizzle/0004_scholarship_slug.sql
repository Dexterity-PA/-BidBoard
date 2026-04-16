-- drizzle/0004_scholarship_slug.sql
-- Idempotent: safe to re-run

-- 1. Add nullable slug column
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "slug" varchar(100);

-- 2. Generate base slugs from name (skip rows already populated)
UPDATE "scholarships"
SET "slug" = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(name, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    ),
    '^-|-$', '', 'g'
  )
)
WHERE "slug" IS NULL;

-- 3. Truncate to 80 chars
UPDATE "scholarships"
SET "slug" = LEFT("slug", 80)
WHERE LENGTH("slug") > 80;

-- 4. Resolve collisions: append -2, -3, ... by ascending id
WITH ranked AS (
  SELECT id, slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM scholarships
  WHERE slug IS NOT NULL
)
UPDATE scholarships s
SET slug = r.slug || '-' || r.rn
FROM ranked r
WHERE s.id = r.id AND r.rn > 1;

-- 5. Enforce NOT NULL (all rows have a slug after backfill)
DO $$
BEGIN
  BEGIN
    ALTER TABLE "scholarships" ALTER COLUMN "slug" SET NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- 6. Unique index
CREATE UNIQUE INDEX IF NOT EXISTS "idx_scholarships_slug" ON "scholarships" ("slug");
