-- drizzle/0006_drop_stripe_columns.sql
-- BidBoard is fully free; Stripe was removed. Drop the unused billing columns.
-- Hand-written (repo convention, see 0001-0005): drizzle-kit generate is not
-- usable here (installed drizzle-kit 0.18.1 cannot read the v7 meta snapshot,
-- and meta/ is 5 migrations stale). Idempotent: safe to re-run.
-- WARNING: destructive — permanently deletes tier / stripe_customer_id /
-- stripe_subscription_id data for ALL users when applied.

ALTER TABLE "users" DROP COLUMN IF EXISTS "tier";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_subscription_id";
