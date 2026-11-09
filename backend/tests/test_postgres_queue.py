"""Valida concorrência e ciclo persistido em um schema descartável."""

import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

import psycopg
import pytest
from fastapi import HTTPException
from psycopg.conninfo import make_conninfo

from app.repositories import queue_store
from app.schemas.tickets import ManualTicketRequest


def test_postgres_ticket_lifecycle():
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Configure TEST_DATABASE_URL para testar PostgreSQL.")
    schema = f"test_queue_{uuid4().hex}"
    migrations = Path(__file__).resolve().parents[1] / "migrations"

    with psycopg.connect(url, autocommit=True) as admin:
        admin.execute(f"CREATE SCHEMA {schema}")
        try:
            scoped_url = make_conninfo(url, options=f"-c search_path={schema}")
            with psycopg.connect(scoped_url, autocommit=True) as conn:
                for name in ("001_create_queues.sql", "002_create_tickets.sql", "seed_demo.sql"):
                    conn.execute((migrations / name).read_text(encoding="utf-8-sig"))

            queue_id = queue_store.list_queues(scoped_url)[0].id

            def issue(priority):
                return queue_store.create_manual_ticket(scoped_url, ManualTicketRequest(
                    queue_id=queue_id, customer_name="Pessoa fictícia",
                    service_name="Teste", is_priority=priority,
                ))

            with ThreadPoolExecutor(max_workers=2) as executor:
                normal, priority = executor.map(issue, (False, True))
            assert normal.ticket_number != priority.ticket_number
            assert queue_store.call_next_ticket(scoped_url, queue_id).called_ticket == priority
            with pytest.raises(HTTPException) as blocked:
                queue_store.call_next_ticket(scoped_url, queue_id)
            assert blocked.value.status_code == 409
            with pytest.raises(HTTPException) as stale:
                queue_store.finish_current_ticket(scoped_url, queue_id, normal.ticket_number)
            assert stale.value.status_code == 409
            assert queue_store.get_queue_state(scoped_url, queue_id).active_ticket == priority
            state = queue_store.finish_current_ticket(scoped_url, queue_id, priority.ticket_number)
            assert state.active_ticket is None
            assert state.remaining_queue == [normal]
            with psycopg.connect(scoped_url) as conn:
                assert conn.execute("SELECT count(*) FROM tickets WHERE status = 'finished'").fetchone() == (1,)
        finally:
            admin.execute(f"DROP SCHEMA {schema} CASCADE")
