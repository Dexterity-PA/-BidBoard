-- Additive, first-party measurement only. No existing user data is copied or changed.
CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('page_view', 'signup', 'save', 'newsletter')),
  browser_hash text,
  session_hash text,
  path text,
  source text,
  campaign text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS analytics_events_browser ON analytics_events (browser_hash, created_at);
CREATE TABLE IF NOT EXISTS analytics_rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS analytics_rate_limits_expiry ON analytics_rate_limits (expires_at);
