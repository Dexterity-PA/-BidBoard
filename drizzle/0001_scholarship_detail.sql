ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "essay_prompts" jsonb;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "application_requirements" jsonb;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "what_they_want" text;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "tips" jsonb;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "opens_date" date;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "winners_announced_date" date;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "category" text;
