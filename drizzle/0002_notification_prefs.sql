ALTER TABLE "student_profiles"
  ADD COLUMN IF NOT EXISTS "graduation_year" integer,
  ADD COLUMN IF NOT EXISTS "school_name" text,
  ADD COLUMN IF NOT EXISTS "min_award_amount" integer,
  ADD COLUMN IF NOT EXISTS "categories_of_interest" text[],
  ADD COLUMN IF NOT EXISTS "max_hours_willing" integer,
  ADD COLUMN IF NOT EXISTS "preferred_deadline_range" text,
  ADD COLUMN IF NOT EXISTS "notification_preferences" jsonb
    DEFAULT '{"deadlines_7d":true,"deadlines_3d":true,"deadlines_1d":false,"weekly_digest":true,"product_updates":true}'::jsonb;
