INSERT INTO professional_queues (account_id, queue_id)
SELECT m.account_id, qu.queue_id
FROM unit_memberships m
JOIN queue_units qu ON qu.unit_id = m.unit_id
WHERE m.account_id IN ('demo-norte', 'demo-multi')
  AND m.role = 'professional'
  AND qu.queue_id = 'clinica-vida-norte'
ON CONFLICT (account_id, queue_id) DO NOTHING;
