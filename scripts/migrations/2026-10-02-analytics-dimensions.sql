-- Nullable additions preserve old events without inventing historical geography.
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS os text;
