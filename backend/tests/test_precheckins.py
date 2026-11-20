"""Exercita a senha compartilhada desde o pedido até a confirmação."""

from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4
from pathlib import Path

import psycopg
from fastapi import HTTPException
import pytest

from app.repositories import precheckin_store, queue_store
from app.schemas.precheckins import PrecheckinRequest
from app.schemas.tickets import ManualTicketRequest
from test_unit_authorization import operational_session, login, headers


def test_precheckin_http_identity_and_confirmation(operational_session):
    client, password, _ = operational_session
    customer = login(client, "cliente", password)
    other = login(client, "cliente-2", password)
    reception = login(client, "centro", password)
    professional = login(client, "norte", password)
    multi = login(client, "multi", password)
    body = {"queue_id": "clinica-vida", "request_id": str(uuid4())}
    assert client.post("/api/pre-checkins", json=body).status_code == 401
    assert client.get("/api/auth/me", headers=headers(customer)).json()["role"] == "client"
    created = client.post("/api/pre-checkins", json=body, headers=headers(customer))
    assert created.status_code == 200
    ticket = created.json()
    assert ticket["status"] == "pending"
    assert ticket["waiting_since"] is None
    assert ticket["customer_name"] == "Cliente de teste"
    assert not ticket["is_priority"]
    assert client.post("/api/pre-checkins", json=body, headers=headers(customer)).json() == ticket
    assert client.post("/api/pre-checkins", json=body, headers=headers(reception)).status_code == 403
    assert client.post("/api/pre-checkins", json={**body, "is_priority": True},
                       headers=headers(customer)).status_code == 422
    assert client.get("/api/pre-checkins/me", headers=headers(other)).json() == []
    assert client.get("/api/pre-checkins/me", headers=headers(customer)).json() == [ticket]
    params = {"queue_id": "clinica-vida"}
    assert client.get("/api/pre-checkins", params=params, headers=headers(reception)).json() == [ticket]
    assert client.get("/api/pre-checkins", params=params, headers=headers(customer)).status_code == 403
    assert client.get("/api/tickets", params=params, headers=headers(reception)).json()["remaining_queue"] == []
    confirmation = f"/api/pre-checkins/{ticket['id']}/confirm"
    for token in (customer, professional):
        assert client.post(confirmation, json={}, headers=headers(token)).status_code == 403
    confirmed = client.post(confirmation, json={"is_priority": True}, headers=headers(reception))
    assert confirmed.status_code == 200
    assert confirmed.json()["id"] == ticket["id"]
    assert confirmed.json()["status"] == "waiting"
    assert confirmed.json()["confirmed_at"]
    assert client.post(confirmation, json={}, headers=headers(reception)).json() == confirmed.json()
    state = client.get("/api/tickets", params=params, headers=headers(reception)).json()
    assert state["remaining_queue"][0]["ticket_number"] == ticket["ticket_number"]
    called = client.post("/api/tickets/next", params=params, headers=headers(multi)).json()
    assert called["called_ticket"]["ticket_number"] == ticket["ticket_number"]
    assert client.post(confirmation, json={}, headers=headers(reception)).json()["status"] == "active"


def test_concurrent_precheckin_and_confirmation(operational_session):
    _, _, url = operational_session
    data = PrecheckinRequest(queue_id="clinica-vida", request_id=uuid4())
    with ThreadPoolExecutor(max_workers=2) as executor:
        created = list(executor.map(lambda _: precheckin_store.create(url, data, "demo-cliente"), range(2)))
    assert created[0].id == created[1].id
    manual = queue_store.create_manual_ticket(
        url,
        ManualTicketRequest(
            queue_id="clinica-vida", customer_name="Pessoa de balcão", service_name="Teste",
        ),
        "demo-centro",
    )
    with ThreadPoolExecutor(max_workers=2) as executor:
        confirmed = list(executor.map(
            lambda _: precheckin_store.confirm(url, created[0].id, "demo-centro", False), range(2),
        ))
    assert confirmed[0] == confirmed[1]
    state = queue_store.get_queue_state(url, "clinica-vida", "demo-centro")
    assert [ticket.ticket_number for ticket in state.remaining_queue] == [
        manual.ticket_number, created[0].ticket_number,
    ]
    with psycopg.connect(url) as conn:
        assert conn.execute("SELECT count(*) FROM tickets WHERE client_account_id = 'demo-cliente'").fetchone() == (1,)


def test_request_conflicts_and_migration_reapplication(operational_session):
    client, password, url = operational_session
    customer = login(client, "cliente", password)
    body = {"queue_id": "clinica-vida", "request_id": str(uuid4())}
    ticket = client.post("/api/pre-checkins", json=body, headers=headers(customer)).json()
    assert client.post("/api/pre-checkins", json={**body, "queue_id": "clinica-vida-norte"},
                       headers=headers(customer)).status_code == 409
    assert client.post("/api/pre-checkins", json={**body, "request_id": str(uuid4())},
                       headers=headers(customer)).status_code == 409
    with pytest.raises(HTTPException) as missing:
        precheckin_store.confirm(url, ticket["id"] + 100, "demo-centro", False)
    assert missing.value.status_code == 404
    migration = Path(__file__).resolve().parents[1] / "migrations" / "004_create_precheckins.sql"
    with psycopg.connect(url, autocommit=True) as conn:
        before = conn.execute("SELECT * FROM tickets ORDER BY id").fetchall()
        conn.execute(migration.read_text(encoding="utf-8-sig"))
        assert conn.execute("SELECT * FROM tickets ORDER BY id").fetchall() == before
