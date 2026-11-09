INSERT INTO queues (id, company_name, unit_name, attendant_name, room, service_name)
VALUES ('clinica-vida', 'Clínica Vida', 'Unidade Centro', 'Equipe de teste', 'Sala 1', 'Atendimento')
ON CONFLICT (id) DO NOTHING;
