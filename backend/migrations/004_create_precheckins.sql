BEGIN;

CREATE TABLE IF NOT EXISTS client_profiles (
    account_id text PRIMARY KEY REFERENCES accounts(id),
    display_name text NOT NULL CHECK (btrim(display_name) <> '')
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_account_id text REFERENCES client_profiles(account_id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS request_id uuid;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS confirmed_by text REFERENCES accounts(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS waiting_since timestamptz;

UPDATE tickets SET waiting_since = issued_at
WHERE waiting_since IS NULL AND status <> 'pending';

ALTER TABLE tickets ALTER COLUMN waiting_since SET DEFAULT clock_timestamp();
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check
    CHECK (status IN ('pending', 'waiting', 'active', 'finished'));

CREATE UNIQUE INDEX IF NOT EXISTS tickets_client_request
    ON tickets (client_account_id, request_id);
CREATE UNIQUE INDEX IF NOT EXISTS tickets_client_open_queue
    ON tickets (client_account_id, queue_id)
    WHERE client_account_id IS NOT NULL AND status IN ('pending', 'waiting', 'active');

DROP INDEX IF EXISTS tickets_waiting_order;
CREATE INDEX tickets_waiting_order
    ON tickets (queue_id, is_priority DESC, waiting_since, id) WHERE status = 'waiting';

COMMIT;
