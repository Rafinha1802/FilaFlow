BEGIN;

CREATE TABLE IF NOT EXISTS units (
    id text PRIMARY KEY,
    company_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE CHECK (email <> '' AND email = lower(btrim(email))),
    password_hash text,
    is_active boolean NOT NULL DEFAULT false,
    CHECK (NOT is_active OR NULLIF(btrim(password_hash), '') IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS unit_memberships (
    account_id text NOT NULL REFERENCES accounts(id),
    unit_id text NOT NULL REFERENCES units(id),
    role text NOT NULL CHECK (role IN ('admin', 'reception', 'professional')),
    PRIMARY KEY (account_id, unit_id)
);

CREATE TABLE IF NOT EXISTS queue_units (
    queue_id text PRIMARY KEY REFERENCES queues(id),
    unit_id text NOT NULL REFERENCES units(id)
);

-- Preserve existing queue IDs and tickets. A legacy queue gets its own
-- unit until an explicit relationship between queues is established.
INSERT INTO units (id, company_name, name)
SELECT 'legacy:' || id, company_name, unit_name FROM queues q
WHERE NOT EXISTS (SELECT 1 FROM queue_units qu WHERE qu.queue_id = q.id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO queue_units (queue_id, unit_id)
SELECT id, 'legacy:' || id FROM queues q
WHERE NOT EXISTS (SELECT 1 FROM queue_units qu WHERE qu.queue_id = q.id)
ON CONFLICT (queue_id) DO NOTHING;

COMMIT;
