-- A hash of the account ID and event versions prevents replayed events from restoring deleted accounts.
-- No emails, names, profiles or webhook payloads are retained here.
CREATE TABLE IF NOT EXISTS account_sync_state (
  account_key text PRIMARY KEY,
  version bigint NOT NULL,
  event_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS operational_events (
  id uuid PRIMARY KEY,
  component text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS operational_events_created ON operational_events (created_at);
CREATE TABLE IF NOT EXISTS scheduled_job_runs (
  id uuid PRIMARY KEY,
  job text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  failed integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS scheduled_job_runs_started ON scheduled_job_runs (job, started_at);
CREATE TABLE IF NOT EXISTS health_monitor_config (
  id integer PRIMARY KEY CHECK (id = 1),
  started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO health_monitor_config (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS operational_alerts (
  key text PRIMARY KEY,
  component text NOT NULL,
  code text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS operational_alerts_created ON operational_alerts (created_at);
