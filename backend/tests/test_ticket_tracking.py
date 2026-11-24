"""Valida acompanhamento individual e escopo profissional da fila."""

from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import psycopg
import pytest
from fastapi import HTTPException
from starlette.websockets import WebSocketDisconnect

from app.repositories import queue_store
from test_unit_authorization import operational_session, login, headers


def create_and_confirm(client, customer, reception):
    response = client.post("/api/pre-checkins", headers=headers(customer), json={
        "queue_id": "clinica-vida-norte", "request_id": str(uuid4()),
    })
    assert response.status_code == 200
    ticket = response.json()
    assert client.post(f"/api/pre-checkins/{ticket['id']}/confirm",
                       headers=headers(reception), json={}).status_code == 200
    return ticket


def subscribe(socket, token, ticket_id):
    socket.send_json({"type": "subscribe", "token": token, "ticket_id": ticket_id})
    assert socket.receive_json() == {"type": "READY", "ticket_id": ticket_id}


def test_client_receives_only_own_ticket_and_recovers_after_reconnection(operational_session):
    client, password, _ = operational_session
    customer = login(client, "cliente", password)
    other = login(client, "cliente-2", password)
    reception = login(client, "recepcao-norte", password)
    professional = login(client, "norte", password)
    first = create_and_confirm(client, customer, reception)
    second = create_and_confirm(client, other, reception)
    first_url = f"/api/pre-checkins/{first['id']}"
    assert client.get(first_url, headers=headers(other)).status_code == 404
    assert client.get(first_url, headers=headers(professional)).status_code == 403

    with client.websocket_connect("/ws/tickets") as socket:
        socket.send_json({"type": "subscribe", "token": other, "ticket_id": first["id"]})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008

    with client.websocket_connect("/ws/tickets") as first_socket:
        subscribe(first_socket, customer, first["id"])
        with client.websocket_connect("/ws/tickets") as second_socket:
            subscribe(second_socket, other, second["id"])
            called = client.post("/api/tickets/next", headers=headers(professional),
                                 params={"queue_id": "clinica-vida-norte"})
            assert called.status_code == 200
            assert called.json()["called_ticket"]["ticket_number"] == first["ticket_number"]
            assert first_socket.receive_json() == {"type": "TICKET_UPDATED", "ticket_id": first["id"]}
            second_socket.send_json({"type": "ping"})
            assert second_socket.receive_json() == {"type": "pong"}

    params = {"queue_id": "clinica-vida-norte", "ticket_number": first["ticket_number"]}
    assert client.post("/api/tickets/finish", headers=headers(professional), params=params).status_code == 200
    with client.websocket_connect("/ws/tickets") as socket:
        subscribe(socket, customer, first["id"])
        current = client.get(first_url, headers=headers(customer))
        assert current.status_code == 200
        assert current.json()["status"] == "finished"
        assert current.json()["called_at"] and current.json()["finished_at"]


def test_professional_only_operates_assigned_queue_and_serializes_calls(operational_session):
    client, password, url = operational_session
    customer = login(client, "cliente", password)
    other = login(client, "cliente-2", password)
    reception = login(client, "recepcao-norte", password)
    professional = login(client, "norte", password)
    create_and_confirm(client, customer, reception)
    create_and_confirm(client, other, reception)
    with psycopg.connect(url) as conn:
        conn.execute("""
            INSERT INTO queues SELECT 'north-other', company_name, unit_name,
            attendant_name, room, service_name FROM queues WHERE id = 'clinica-vida-norte'
        """)
        conn.execute("INSERT INTO queue_units VALUES ('north-other', 'demo:norte')")
    allowed = client.get("/api/queues/me", headers=headers(professional)).json()
    assert [queue["id"] for queue in allowed] == ["clinica-vida-norte"]
    assert client.get("/api/tickets", headers=headers(professional),
                      params={"queue_id": "north-other"}).status_code == 403

    def call():
        try:
            queue_store.call_next_ticket(url, "clinica-vida-norte", "demo-norte")
            return 200
        except HTTPException as error:
            return error.status_code

    with ThreadPoolExecutor(max_workers=2) as executor:
        assert sorted(executor.map(lambda _: call(), range(2))) == [200, 409]
    state = queue_store.get_queue_state(url, "clinica-vida-norte", "demo-norte")
    assert state.active_ticket is not None
    assert len(state.remaining_queue) == 1

    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "token": professional, "queue_id": "clinica-vida-norte"})
        assert socket.receive_json()["type"] == "READY"
        with psycopg.connect(url) as conn:
            conn.execute("DELETE FROM professional_queues WHERE account_id = 'demo-norte'")
        socket.send_json({"type": "ping"})
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008
    assert client.get("/api/tickets", headers=headers(professional),
                      params={"queue_id": "clinica-vida-norte"}).status_code == 403


def test_disabled_client_stops_receiving_events(operational_session):
    client, password, url = operational_session
    customer = login(client, "cliente", password)
    reception = login(client, "recepcao-norte", password)
    professional = login(client, "norte", password)
    ticket = create_and_confirm(client, customer, reception)
    with client.websocket_connect("/ws/tickets") as socket:
        subscribe(socket, customer, ticket["id"])
        with psycopg.connect(url) as conn:
            conn.execute("UPDATE accounts SET is_active = false WHERE id = 'demo-cliente'")
        assert client.post("/api/tickets/next", headers=headers(professional),
                           params={"queue_id": "clinica-vida-norte"}).status_code == 200
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008
