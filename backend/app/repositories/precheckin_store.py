"""Persiste pedidos do cliente e a confirmação da recepção na mesma senha."""

from fastapi import HTTPException

from app.repositories.queue_store import connection, lock_queue, require_queue_access
from app.schemas.precheckins import PrecheckinRequest, PrecheckinTicket

COLUMNS = """id, queue_id, customer_name, service_name, is_priority, status,
             issued_at, confirmed_at, waiting_since, called_at, finished_at"""


def as_precheckin(row) -> PrecheckinTicket:
    return PrecheckinTicket(ticket_number=f"#{row['id']}", **row)


def require_client(conn, account_id: str):
    profile = conn.execute("""
        SELECT p.display_name FROM client_profiles p
        JOIN accounts a ON a.id = p.account_id AND a.is_active
        WHERE p.account_id = %s FOR SHARE OF p, a
    """, (account_id,)).fetchone()
    if profile is None:
        raise HTTPException(403, "Esta operação exige uma conta de cliente.")
    return profile


def create(url: str, data: PrecheckinRequest, account_id: str) -> PrecheckinTicket:
    with connection(url) as conn:
        profile = require_client(conn, account_id)
        lock_queue(conn, data.queue_id)
        queue = conn.execute("""
            SELECT q.service_name FROM queues q JOIN queue_units qu ON qu.queue_id = q.id
            WHERE q.id = %s FOR SHARE OF qu
        """, (data.queue_id,)).fetchone()
        if queue is None:
            raise HTTPException(404, "Fila indisponível para pré-check-in.")
        previous = conn.execute(f"""
            SELECT {COLUMNS} FROM tickets
            WHERE client_account_id = %s AND request_id = %s
        """, (account_id, data.request_id)).fetchone()
        if previous:
            if previous["queue_id"] != data.queue_id:
                raise HTTPException(409, "O identificador deste pedido já foi usado em outra fila.")
            return as_precheckin(previous)
        if conn.execute("""
            SELECT id FROM tickets WHERE client_account_id = %s AND queue_id = %s
            AND status IN ('pending', 'waiting', 'active')
        """, (account_id, data.queue_id)).fetchone():
            raise HTTPException(409, "Você já possui uma senha aberta nesta fila.")
        row = conn.execute(f"""
            INSERT INTO tickets (queue_id, customer_name, service_name, is_priority,
                                 status, client_account_id, request_id, waiting_since)
            VALUES (%s, %s, %s, false, 'pending', %s, %s, NULL)
            ON CONFLICT (client_account_id, request_id) DO NOTHING
            RETURNING {COLUMNS}
        """, (data.queue_id, profile["display_name"], queue["service_name"],
              account_id, data.request_id)).fetchone()
        if row is None:
            row = conn.execute(f"""
                SELECT {COLUMNS} FROM tickets WHERE client_account_id = %s AND request_id = %s
            """, (account_id, data.request_id)).fetchone()
            if row["queue_id"] != data.queue_id:
                raise HTTPException(409, "O identificador deste pedido já foi usado em outra fila.")
        return as_precheckin(row)


def list_mine(url: str, account_id: str) -> list[PrecheckinTicket]:
    with connection(url) as conn:
        require_client(conn, account_id)
        rows = conn.execute(f"""
            SELECT {COLUMNS} FROM tickets WHERE client_account_id = %s ORDER BY id DESC
        """, (account_id,)).fetchall()
        return [as_precheckin(row) for row in rows]


def list_pending(url: str, queue_id: str, account_id: str) -> list[PrecheckinTicket]:
    with connection(url) as conn:
        require_queue_access(conn, queue_id, account_id, ("admin", "reception"))
        rows = conn.execute(f"""
            SELECT {COLUMNS} FROM tickets WHERE queue_id = %s AND status = 'pending' ORDER BY id
        """, (queue_id,)).fetchall()
        return [as_precheckin(row) for row in rows]


def confirm(url: str, ticket_id: int, account_id: str, is_priority: bool) -> PrecheckinTicket:
    with connection(url) as conn:
        identity = conn.execute("SELECT queue_id FROM tickets WHERE id = %s AND client_account_id IS NOT NULL",
                                (ticket_id,)).fetchone()
        if identity is None:
            raise HTTPException(404, "Pré-check-in não encontrado.")
        queue_id = identity["queue_id"]
        require_queue_access(conn, queue_id, account_id, ("admin", "reception"))
        lock_queue(conn, queue_id)
        row = conn.execute(f"SELECT {COLUMNS} FROM tickets WHERE id = %s", (ticket_id,)).fetchone()
        if row["status"] == "pending":
            row = conn.execute(f"""
                UPDATE tickets SET status = 'waiting', confirmed_at = clock_timestamp(), confirmed_by = %s,
                                   waiting_since = clock_timestamp(), is_priority = %s
                WHERE id = %s RETURNING {COLUMNS}
            """, (account_id, is_priority, ticket_id)).fetchone()
        return as_precheckin(row)


def get_mine(url: str, ticket_id: int, account_id: str) -> PrecheckinTicket:
    with connection(url) as conn:
        require_client(conn, account_id)
        row = conn.execute(f"""
            SELECT {COLUMNS} FROM tickets WHERE id = %s AND client_account_id = %s
        """, (ticket_id, account_id)).fetchone()
        if row is None:
            raise HTTPException(404, "Senha não encontrada.")
        return as_precheckin(row)
