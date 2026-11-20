BEGIN;

INSERT INTO accounts (id, email)
VALUES ('demo-cliente', 'cliente@example.invalid'), ('demo-cliente-2', 'cliente-2@example.invalid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO client_profiles (account_id, display_name)
VALUES ('demo-cliente', 'Cliente de teste'), ('demo-cliente-2', 'Outro cliente de teste')
ON CONFLICT (account_id) DO NOTHING;

COMMIT;
