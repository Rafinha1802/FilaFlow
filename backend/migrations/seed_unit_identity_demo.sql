BEGIN;

INSERT INTO units (id, company_name, name)
VALUES
    ('legacy:clinica-vida', 'Clínica Vida', 'Unidade Centro'),
    ('demo:norte', 'Clínica Vida', 'Unidade Norte')
ON CONFLICT (id) DO NOTHING;

INSERT INTO queues (id, company_name, unit_name, attendant_name, room, service_name)
VALUES
    ('clinica-vida', 'Clínica Vida', 'Unidade Centro', 'Equipe de teste', 'Sala 1', 'Atendimento'),
    ('clinica-vida-norte', 'Clínica Vida', 'Unidade Norte', 'Equipe de teste', 'Sala 2', 'Atendimento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO queue_units (queue_id, unit_id)
VALUES ('clinica-vida', 'legacy:clinica-vida'), ('clinica-vida-norte', 'demo:norte')
ON CONFLICT (queue_id) DO NOTHING;

-- Fixture accounts are inactive until the authentication checkpoint.
INSERT INTO accounts (id, email)
VALUES
    ('demo-centro', 'centro@example.invalid'),
    ('demo-norte', 'norte@example.invalid'),
    ('demo-multi', 'multi@example.invalid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO unit_memberships (account_id, unit_id, role)
VALUES
    ('demo-centro', 'legacy:clinica-vida', 'reception'),
    ('demo-norte', 'demo:norte', 'professional'),
    ('demo-multi', 'legacy:clinica-vida', 'admin'),
    ('demo-multi', 'demo:norte', 'professional')
ON CONFLICT (account_id, unit_id) DO NOTHING;

COMMIT;
