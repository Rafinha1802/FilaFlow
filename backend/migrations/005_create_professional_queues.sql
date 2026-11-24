BEGIN;

CREATE TABLE IF NOT EXISTS professional_queues (
    account_id text NOT NULL REFERENCES accounts(id),
    queue_id text NOT NULL REFERENCES queues(id),
    PRIMARY KEY (account_id, queue_id)
);

COMMIT;
