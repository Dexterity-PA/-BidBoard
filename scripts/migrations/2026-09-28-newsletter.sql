-- Additive migration. Review and apply explicitly before enabling newsletter signup.
-- Existing users are deliberately NOT imported or subscribed.
BEGIN;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id text PRIMARY KEY,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  confirmation_token_hash text,
  confirmation_expires_at timestamptz,
  consented_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  CONSTRAINT newsletter_subscribers_email_normalized CHECK (email = lower(btrim(email)))
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique ON newsletter_subscribers (email);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_confirmation_unique ON newsletter_subscribers (confirmation_token_hash);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_id ON newsletter_subscribers (status, id);

CREATE TABLE IF NOT EXISTS newsletter_cooldowns (
  key text PRIMARY KEY,
  blocked_until timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_batches (
  id text PRIMARY KEY,
  week text NOT NULL,
  status text NOT NULL,
  content jsonb NOT NULL,
  recipients jsonb NOT NULL,
  payload jsonb,
  attempt_id text NOT NULL,
  first_attempt_at timestamptz NOT NULL,
  claimed_at timestamptz NOT NULL,
  sent_at timestamptz,
  provider_ids jsonb,
  error text,
  CONSTRAINT newsletter_batches_status_check CHECK (status IN ('sending', 'sent', 'failed', 'skipped'))
);
CREATE INDEX IF NOT EXISTS newsletter_batches_week_status ON newsletter_batches (week, status);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  subscriber_id text NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  week text NOT NULL,
  -- The claim and its batch are created by one atomic SQL statement. Deferring
  -- this check allows claims to determine the batch's exact immutable audience.
  batch_id text NOT NULL REFERENCES newsletter_batches(id) DEFERRABLE INITIALLY DEFERRED
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_deliveries_subscriber_week_unique ON newsletter_deliveries (subscriber_id, week);
CREATE INDEX IF NOT EXISTS newsletter_deliveries_batch_id ON newsletter_deliveries (batch_id);

COMMIT;
