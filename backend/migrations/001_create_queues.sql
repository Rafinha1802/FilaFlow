BEGIN;

CREATE TABLE IF NOT EXISTS queues (
    id text PRIMARY KEY,
    company_name text NOT NULL,
    unit_name text NOT NULL,
    attendant_name text NOT NULL,
    room text NOT NULL,
    service_name text NOT NULL
);

COMMIT;
