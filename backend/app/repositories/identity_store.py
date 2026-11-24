"""Consultas de identidade e vínculos operacionais."""

from app.repositories.queue_store import connection
from app.schemas.queues import OperationalQueue


def active_account(url: str, *, email: str | None = None, account_id: str | None = None):
    with connection(url) as conn:
        return conn.execute("""
            SELECT a.id, a.email, a.password_hash,
                   CASE WHEN p.account_id IS NULL THEN 'company' ELSE 'client' END AS role
            FROM accounts a LEFT JOIN client_profiles p ON p.account_id = a.id
            WHERE a.is_active AND (a.email = %s OR a.id = %s)
        """, (email, account_id)).fetchone()


def allowed_queues(url: str, account_id: str) -> list[OperationalQueue]:
    with connection(url) as conn:
        rows = conn.execute("""
            SELECT q.id, u.company_name AS "companyName", u.name AS "unitName",
                   q.attendant_name AS "attendantName", q.room, q.service_name AS "serviceName",
                   u.id AS "unitId", m.role
            FROM unit_memberships m
            JOIN accounts a ON a.id = m.account_id AND a.is_active
            JOIN units u ON u.id = m.unit_id
            JOIN queue_units qu ON qu.unit_id = u.id
            JOIN queues q ON q.id = qu.queue_id
            WHERE m.account_id = %s AND (
                m.role <> 'professional' OR EXISTS (
                    SELECT 1 FROM professional_queues pq
                    WHERE pq.account_id = m.account_id AND pq.queue_id = q.id
                )
            ) ORDER BY u.name, q.id
        """, (account_id,)).fetchall()
    return [OperationalQueue.model_validate(row) for row in rows]
