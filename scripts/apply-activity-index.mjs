import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

// Create the activity_log table if it doesn't exist
await sql`
  CREATE TABLE IF NOT EXISTS activity_log (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    action_type TEXT NOT NULL,
    reference_id INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

console.log("✓ activity_log table ensured");

// Dedup support column: store the UTC calendar day as an immutable generated column,
// then build a unique index on it — avoids the "not IMMUTABLE" restriction on date_trunc/CAST(timestamptz)
await sql`
  ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS created_day DATE
      GENERATED ALWAYS AS (CAST(created_at AT TIME ZONE 'UTC' AS date)) STORED
`;

console.log("✓ created_day generated column ensured");

// Idempotency index: same (user, action type, referenceId) on same calendar day = no-op
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS activity_log_dedup
  ON activity_log (
    user_id,
    action_type,
    COALESCE(reference_id, -1),
    created_day
  )
`;

// Performance index: heatmap queries filter by user_id + created_at range
await sql`
  CREATE INDEX IF NOT EXISTS activity_log_user_created_idx
  ON activity_log (user_id, created_at DESC)
`;

console.log("✓ activity_log indexes created");
