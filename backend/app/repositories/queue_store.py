"""Operações da fila persistida. A linha da fila serializa as transições."""

from contextlib import contextmanager

import psycopg
from fastapi import HTTPException
from psycopg.rows import dict_row

from app.schemas.queues import QueueSummary
from app.schemas.tickets import ManualTicketRequest, NextTicketResponse, QueueState, Ticket


@contextmanager
def connection(url):
    try:
        with psycopg.connect(url, row_factory=dict_row, connect_timeout=5) as conn:
            yield conn
    except psycopg.Error:
        raise HTTPException(503, "Banco da fila indisponível.") from None


def list_queues(url: str) -> list[QueueSummary]:
    with connection(url) as conn:
        rows = conn.execute("""
            SELECT id, company_name AS "companyName", unit_name AS "unitName",
                   attendant_name AS "attendantName", room, service_name AS "serviceName"
            FROM queues ORDER BY id
        """).fetchall()
    return [QueueSummary.model_validate(row) for row in rows]


def lock_queue(conn, queue_id: str) -> None:
    if conn.execute("SELECT id FROM queues WHERE id = %s FOR UPDATE", (queue_id,)).fetchone() is None:
        raise HTTPException(404, "Fila não encontrada.")


def require_queue_access(conn, queue_id: str, account_id: str, roles: tuple[str, ...] = ()) -> None:
    membership = conn.execute("""
        SELECT m.role
        FROM queue_units qu
        JOIN unit_memberships m ON m.unit_id = qu.unit_id
        JOIN accounts a ON a.id = m.account_id
        WHERE qu.queue_id = %s AND m.account_id = %s AND a.is_active
        FOR SHARE OF qu, m, a
    """, (queue_id, account_id)).fetchone()
    if membership is None or (roles and membership["role"] not in roles):
        raise HTTPException(403, "Acesso à fila não permitido.")


def to_ticket(row) -> Ticket:
    return Ticket(ticket_number=f"#{row['id']}", **row)


def read_state(conn, queue_id: str) -> QueueState:
    rows = conn.execute("""
        SELECT id, queue_id, customer_name, service_name, is_priority, status
        FROM tickets WHERE queue_id = %s AND status IN ('waiting', 'active')
        ORDER BY is_priority DESC, waiting_since, id
    """, (queue_id,)).fetchall()
    return QueueState(
        active_ticket=next((to_ticket(row) for row in rows if row["status"] == "active"), None),
        remaining_queue=[to_ticket(row) for row in rows if row["status"] == "waiting"],
    )


def get_queue_state(url: str, queue_id: str, account_id: str) -> QueueState:
    with connection(url) as conn:
        require_queue_access(conn, queue_id, account_id)
        lock_queue(conn, queue_id)
        return read_state(conn, queue_id)


def create_manual_ticket(url: str, data: ManualTicketRequest, account_id: str) -> Ticket:
    with connection(url) as conn:
        require_queue_access(conn, data.queue_id, account_id, ("admin", "reception"))
        lock_queue(conn, data.queue_id)
        row = conn.execute("""
            INSERT INTO tickets (queue_id, customer_name, service_name, is_priority)
            VALUES (%s, %s, %s, %s)
            RETURNING id, queue_id, customer_name, service_name, is_priority
        """, (data.queue_id, data.customer_name, data.service_name, data.is_priority)).fetchone()
        return to_ticket(row)


def call_next_ticket(url: str, queue_id: str, account_id: str) -> NextTicketResponse:
    with connection(url) as conn:
        require_queue_access(conn, queue_id, account_id, ("admin", "professional"))
        lock_queue(conn, queue_id)
        state = read_state(conn, queue_id)
        if not state.remaining_queue:
            return NextTicketResponse(called_ticket=None, **state.model_dump())
        if state.active_ticket:
            raise HTTPException(409, "Finalize o atendimento atual antes de chamar outra senha.")
        called = state.remaining_queue[0]
        conn.execute("UPDATE tickets SET status = 'active', called_at = now() WHERE id = %s",
                     (int(called.ticket_number[1:]),))
        return NextTicketResponse(
            called_ticket=called, active_ticket=called, remaining_queue=state.remaining_queue[1:]
        )


def finish_current_ticket(url: str, queue_id: str, ticket_number: str, account_id: str) -> QueueState:
    with connection(url) as conn:
        require_queue_access(conn, queue_id, account_id, ("admin", "professional"))
        lock_queue(conn, queue_id)
        state = read_state(conn, queue_id)
        if not state.active_ticket or state.active_ticket.ticket_number != ticket_number:
            raise HTTPException(409, "O atendimento atual mudou. Atualize a fila.")
        conn.execute("UPDATE tickets SET status = 'finished', finished_at = now() WHERE id = %s",
                     (int(ticket_number[1:]),))
        return QueueState(active_ticket=None, remaining_queue=state.remaining_queue)
