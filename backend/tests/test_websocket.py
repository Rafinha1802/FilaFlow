"""Verifica assinatura autenticada, avisos entre clientes e limpeza das conexões."""

from datetime import datetime, timedelta, timezone
import secrets
import os

import jwt
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import app
from app.services import events, tickets


@pytest.fixture
def session(monkeypatch):
    key = secrets.token_urlsafe(48)
    email = "ws-test@example.invalid"
    monkeypatch.setenv("DEMO_USER_EMAIL", email)
    monkeypatch.setenv("DEMO_PASSWORD_HASH", "unused-in-token-validation")
    monkeypatch.setenv("JWT_SECRET_KEY", key)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setattr(tickets, "_tickets", [])
    monkeypatch.setattr(tickets, "_active_tickets", {})
    monkeypatch.setattr(tickets, "_next_ticket_number", 49)
    now = datetime.now(timezone.utc)
    token = jwt.encode({"sub": email, "iat": now, "exp": now + timedelta(minutes=30),
                        "iss": "filaflow-dev"}, key, algorithm="HS256")
    with TestClient(app) as client:
        client.headers["Authorization"] = f"Bearer {token}"
        yield client, token
    assert events.connections == {}


def subscribe(socket, token):
    socket.send_json({"type": "subscribe", "queue_id": "clinica-vida", "token": token})
    assert socket.receive_json() == {"type": "READY", "queue_id": "clinica-vida"}


def test_two_clients_receive_issuance_and_call_notifications(session):
    client, token = session
    with client.websocket_connect("/ws") as first, client.websocket_connect("/ws") as second:
        subscribe(first, token)
        subscribe(second, token)
        result = client.post("/api/tickets/manual", json={
            "queue_id": "clinica-vida", "customer_name": "Test", "service_name": "Consulta",
        })
        assert result.status_code == 201
        for socket in (first, second):
            assert socket.receive_json() == {"type": "QUEUE_UPDATED", "queue_id": "clinica-vida"}
        called = client.post("/api/tickets/next?queue_id=clinica-vida")
        assert called.status_code == 200
        for socket in (first, second):
            assert socket.receive_json() == {"type": "TICKET_CALLED", "queue_id": "clinica-vida"}
        assert client.get("/api/tickets?queue_id=clinica-vida").json()["active_ticket"]["ticket_number"] == "#49"


@pytest.mark.parametrize("subscription", [
    {}, [], {"type": "subscribe", "queue_id": "clinica-vida"},
    {"type": "subscribe", "queue_id": "clinica-vida", "token": "invalid"},
])
def test_invalid_subscription_is_closed_without_data(session, subscription):
    client, _ = session
    with client.websocket_connect("/ws") as socket:
        socket.send_json(subscription)
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_unknown_queue_is_rejected(session):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "queue_id": "other", "token": token})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_empty_queue_does_not_emit_called_event(session):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        assert client.post("/api/tickets/next?queue_id=clinica-vida").json()["called_ticket"] is None
        socket.send_json({"type": "ping"})
        assert socket.receive_json() == {"type": "pong"}


def test_malformed_message_closes_connection(session):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        socket.send_text("not-json")
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_binary_message_is_rejected(session):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        socket.send_bytes(b"unsupported")
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_ping_revalidates_identity(session, monkeypatch):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        monkeypatch.setenv("DEMO_USER_EMAIL", "different@example.invalid")
        socket.send_json({"type": "ping"})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_invalid_subscriber_does_not_fail_http_mutation(session, monkeypatch):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        def invalid_token(_):
            raise HTTPException(401)
        monkeypatch.setattr(events, "verify_token", invalid_token)
        assert client.post("/api/tickets/manual", json={
            "queue_id": "clinica-vida", "customer_name": "Test", "service_name": "Consulta",
        }).status_code == 201
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_reconnection_can_recover_missed_changes(session):
    client, token = session
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
    assert client.post("/api/tickets/manual", json={
        "queue_id": "clinica-vida", "customer_name": "Test", "service_name": "Consulta",
    }).status_code == 201
    with client.websocket_connect("/ws") as socket:
        subscribe(socket, token)
        state = client.get("/api/tickets?queue_id=clinica-vida").json()
        assert [ticket["ticket_number"] for ticket in state["remaining_queue"]] == ["#49"]


def test_expired_token_is_rejected(session):
    client, token = session
    claims = jwt.decode(token, options={"verify_signature": False})
    claims["exp"] = datetime.now(timezone.utc) - timedelta(seconds=1)
    expired = jwt.encode(claims, os.environ["JWT_SECRET_KEY"], algorithm="HS256")
    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "queue_id": "clinica-vida", "token": expired})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_failed_send_does_not_block_other_subscribers(session, monkeypatch):
    client, token = session
    with client.websocket_connect("/ws") as first, client.websocket_connect("/ws") as second:
        subscribe(first, token)
        subscribe(second, token)
        server_socket = next(iter(events.connections))
        async def failed_send(_):
            raise RuntimeError("Disconnected")
        monkeypatch.setattr(server_socket, "send_json", failed_send)
        assert client.post("/api/tickets/manual", json={
            "queue_id": "clinica-vida", "customer_name": "Test", "service_name": "Consulta",
        }).status_code == 201
        with pytest.raises(WebSocketDisconnect):
            first.receive_json()
        assert second.receive_json() == {"type": "QUEUE_UPDATED", "queue_id": "clinica-vida"}
