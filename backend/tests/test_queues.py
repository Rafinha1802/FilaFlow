"""Verifica o contrato de listagem esperado pelo React, sem autenticação ou banco."""

from fastapi.testclient import TestClient

from app.main import app


def test_list_queues_returns_public_demo_summary(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    with TestClient(app) as client:
        response = client.get("/api/queues")

    assert response.status_code == 200
    # O consumidor espera um array direto, sem um envelope como {"data": ...}.
    assert response.json() == [
        {
            "id": "clinica-vida",
            "companyName": "Clínica Vida",
            "unitName": "Unidade Centro",
            "attendantName": "Dr. Carlos Mendes",
            "room": "Consultório 04",
            "serviceName": "Consulta Oftalmologia Geral",
        }
    ]
