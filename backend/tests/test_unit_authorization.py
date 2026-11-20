"""Valida a autorização por unidade nos contratos HTTP e WebSocket."""

import os
import secrets
from pathlib import Path
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg import sql
from psycopg.conninfo import make_conninfo
from starlette.websockets import WebSocketDisconnect

from app.main import app
from app.services.auth import password_hasher


@pytest.fixture
def operational_session(monkeypatch):
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Configure TEST_DATABASE_URL para testar PostgreSQL.")
    schema_name = f"test_access_{uuid4().hex}"
    schema = sql.Identifier(schema_name)
    directory = Path(__file__).resolve().parents[1] / "migrations"
    scoped_url = make_conninfo(url, options=f"-c search_path={schema_name}")
    with psycopg.connect(url, autocommit=True) as admin:
        admin.execute(sql.SQL("CREATE SCHEMA {}").format(schema))
        try:
            password = secrets.token_urlsafe(24)
            with psycopg.connect(scoped_url, autocommit=True) as conn:
                for name in ("001_create_queues.sql", "002_create_tickets.sql",
                             "003_create_unit_identity.sql", "seed_unit_identity_demo.sql"):
                    conn.execute((directory / name).read_text(encoding="utf-8-sig"))
                conn.execute("UPDATE accounts SET is_active = true, password_hash = %s",
                             (password_hasher.hash(password),))
                conn.execute("INSERT INTO accounts (id, email) VALUES ('inactive', 'inactive@example.invalid')")
            monkeypatch.setenv("DATABASE_URL", scoped_url)
            monkeypatch.setenv("JWT_SECRET_KEY", secrets.token_urlsafe(48))
            with TestClient(app) as client:
                yield client, password, scoped_url
        finally:
            admin.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(schema))


def login(client, name, password):
    response = client.post("/api/auth/login", json={"email": f"{name}@example.invalid", "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def issue(client, token, queue_id):
    return client.post("/api/tickets/manual", headers=headers(token), json={
        "queue_id": queue_id, "customer_name": "Pessoa fictícia", "service_name": "Teste",
    })


def test_operational_roles_and_unit_isolation(operational_session):
    client, password, _ = operational_session
    center = login(client, "centro", password)
    north = login(client, "norte", password)
    multi = login(client, "multi", password)
    assert client.post("/api/auth/login", json={
        "email": "inactive@example.invalid", "password": password,
    }).status_code == 401
    queues = client.get("/api/queues/me", headers=headers(multi)).json()
    assert [(queue["id"], queue["role"]) for queue in queues] == [
        ("clinica-vida", "admin"), ("clinica-vida-norte", "professional"),
    ]
    assert issue(client, center, "clinica-vida").status_code == 201
    assert issue(client, north, "clinica-vida").status_code == 403
    assert issue(client, multi, "clinica-vida-norte").status_code == 403
    for token, queue_id in ((center, "clinica-vida-norte"), (north, "clinica-vida")):
        assert client.get("/api/tickets", headers=headers(token), params={"queue_id": queue_id}).status_code == 403
        assert client.post("/api/tickets/next", headers=headers(token),
                           params={"queue_id": queue_id}).status_code == 403
    params = {"queue_id": "clinica-vida"}
    assert client.post("/api/tickets/next", headers=headers(center), params=params).status_code == 403
    called = client.post("/api/tickets/next", headers=headers(multi), params=params)
    assert called.status_code == 200
    params["ticket_number"] = called.json()["called_ticket"]["ticket_number"]
    assert client.post("/api/tickets/finish", headers=headers(center), params=params).status_code == 403
    assert client.post("/api/tickets/finish", headers=headers(multi), params=params).status_code == 200


def test_websocket_checks_membership_before_subscription_and_delivery(operational_session):
    client, password, url = operational_session
    center = login(client, "centro", password)
    multi = login(client, "multi", password)
    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "token": center, "queue_id": "clinica-vida-norte"})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008

    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "token": center, "queue_id": "clinica-vida"})
        assert socket.receive_json()["type"] == "READY"
        assert issue(client, multi, "clinica-vida").status_code == 201
        assert socket.receive_json()["type"] == "QUEUE_UPDATED"
        with psycopg.connect(url) as conn:
            conn.execute("DELETE FROM unit_memberships WHERE account_id = 'demo-centro'")
        assert issue(client, multi, "clinica-vida").status_code == 201
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008
