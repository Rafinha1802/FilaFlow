"""Verifica emissão autenticada, validação e numeração concorrente em memória."""

from concurrent.futures import ThreadPoolExecutor
import secrets

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.tickets import ManualTicketRequest
from app.services import tickets
from app.services.auth import password_hasher

PAYLOAD = {
    "queue_id": "clinica-vida", "customer_name": "Paciente de teste",
    "service_name": "Consulta", "is_priority": False,
}


@pytest.fixture(autouse=True)
def isolated_tickets(monkeypatch):
    # Cada teste recebe um armazenamento independente, sem apagar dados reais.
    monkeypatch.setattr(tickets, "_tickets", [])
    monkeypatch.setattr(tickets, "_active_tickets", {})
    monkeypatch.setattr(tickets, "_next_ticket_number", 49)


@pytest.fixture(scope="module")
def credentials():
    password = secrets.token_urlsafe(24)
    return password, password_hasher.hash(password)


@pytest.fixture
def client(monkeypatch, credentials):
    password, password_hash = credentials
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("DEMO_USER_EMAIL", "tickets@example.invalid")
    monkeypatch.setenv("DEMO_PASSWORD_HASH", password_hash)
    monkeypatch.setenv("JWT_SECRET_KEY", secrets.token_urlsafe(48))
    with TestClient(app) as test_client:
        response = test_client.post("/api/auth/login", json={
            "email": "tickets@example.invalid", "password": password,
        })
        assert response.status_code == 200
        test_client.headers["Authorization"] = f"Bearer {response.json()['access_token']}"
        yield test_client


def test_issue_and_store_sequential_tickets(client):
    response = client.post("/api/tickets/manual", json=PAYLOAD)
    assert response.status_code == 201
    assert response.json() == {**PAYLOAD, "ticket_number": "#49", "estimated_wait_text": "Aguardando"}
    second = client.post("/api/tickets/manual", json={
        **PAYLOAD, "customer_name": "  Outra pessoa  ", "is_priority": True,
    })
    assert second.status_code == 201
    assert second.json()["ticket_number"] == "#50"
    assert second.json()["customer_name"] == "Outra pessoa"
    assert second.json()["is_priority"] is True
    assert len(tickets._tickets) == 2
    assert tickets._tickets[1].model_dump() == second.json()


@pytest.mark.parametrize("field,value", [
    ("customer_name", "   "), ("customer_name", "x" * 151),
    ("service_name", ""), ("service_name", "x" * 151),
    ("queue_id", ""), ("is_priority", "false"), ("is_priority", 1),
])
def test_invalid_input_does_not_consume_number(client, field, value):
    response = client.post("/api/tickets/manual", json={**PAYLOAD, field: value})
    assert response.status_code == 422
    assert tickets._tickets == []
    assert client.post("/api/tickets/manual", json=PAYLOAD).json()["ticket_number"] == "#49"


def test_unknown_queue_does_not_create_ticket(client):
    assert client.post("/api/tickets/manual", json={**PAYLOAD, "queue_id": "unknown"}).status_code == 404
    assert tickets._tickets == []


@pytest.mark.parametrize("authorization", [None, "Bearer invalid-token"])
def test_authentication_required(client, authorization):
    headers = {} if authorization is None else {"Authorization": authorization}
    client.headers.pop("Authorization")
    response = client.post("/api/tickets/manual", json=PAYLOAD, headers=headers)
    assert response.status_code == 401
    assert tickets._tickets == []


def test_concurrent_issuance_has_unique_numbers():
    data = ManualTicketRequest(**PAYLOAD)
    with ThreadPoolExecutor(max_workers=8) as executor:
        created = list(executor.map(lambda _: tickets.create_manual_ticket(data), range(40)))
    assert {item.ticket_number for item in created} == {f"#{n}" for n in range(49, 89)}
    assert len(tickets._tickets) == 40


def test_next_obeys_priority_and_fifo_and_snapshot(client):
    for name, priority in [("Normal 1", False), ("Priority 1", True),
                           ("Normal 2", False), ("Priority 2", True)]:
        assert client.post("/api/tickets/manual", json={
            **PAYLOAD, "customer_name": name, "is_priority": priority,
        }).status_code == 201
    snapshot = client.get("/api/tickets?queue_id=clinica-vida")
    assert snapshot.status_code == 200
    assert snapshot.json()["active_ticket"] is None
    assert [t["ticket_number"] for t in snapshot.json()["remaining_queue"]] == ["#50", "#52", "#49", "#51"]
    for number, remaining in [("#50", 3), ("#52", 2), ("#49", 1), ("#51", 0)]:
        response = client.post("/api/tickets/next?queue_id=clinica-vida")
        assert response.status_code == 200
        data = response.json()
        assert data["called_ticket"]["ticket_number"] == number
        assert data["active_ticket"] == data["called_ticket"]
        assert len(data["remaining_queue"]) == remaining
        # Uma nova consulta permite reconstruir o painel após recarregar.
        assert client.get("/api/tickets?queue_id=clinica-vida").json() == {
            "active_ticket": data["active_ticket"], "remaining_queue": data["remaining_queue"],
        }
    empty = client.post("/api/tickets/next?queue_id=clinica-vida").json()
    assert empty["called_ticket"] is None
    assert empty["remaining_queue"] == []
    assert empty["active_ticket"]["ticket_number"] == "#51"


def test_initial_queue_is_empty(client):
    assert client.get("/api/tickets?queue_id=clinica-vida").json() == {
        "active_ticket": None, "remaining_queue": [],
    }
    assert client.post("/api/tickets/next?queue_id=clinica-vida").json() == {
        "called_ticket": None, "active_ticket": None, "remaining_queue": [],
    }


@pytest.mark.parametrize("method,path", [("GET", "/api/tickets"), ("POST", "/api/tickets/next")])
def test_queue_read_and_next_reject_unknown_queue(client, method, path):
    assert client.request(method, path + "?queue_id=unknown").status_code == 404
    assert tickets._tickets == []
    assert tickets._active_tickets == {}


@pytest.mark.parametrize("method,path", [("GET", "/api/tickets"), ("POST", "/api/tickets/next")])
def test_queue_read_and_next_require_authentication(client, method, path):
    client.post("/api/tickets/manual", json=PAYLOAD)
    client.headers.pop("Authorization")
    assert client.request(method, path + "?queue_id=clinica-vida").status_code == 401
    assert len(tickets._tickets) == 1
    assert tickets._active_tickets == {}


def test_concurrent_calls_never_call_the_same_ticket_twice():
    for _ in range(20):
        tickets.create_manual_ticket(ManualTicketRequest(**PAYLOAD))
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(lambda _: tickets.call_next_ticket("clinica-vida"), range(30)))
    called = [r.called_ticket.ticket_number for r in results if r.called_ticket]
    assert len(called) == 20
    assert len(set(called)) == 20
    assert sum(r.called_ticket is None for r in results) == 10
    assert tickets.get_queue_state("clinica-vida").remaining_queue == []
