"""Verifica o contrato de listagem esperado pelo React, sem autenticação ou banco."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.parametrize("database_url", [None, "postgresql://localhost/test_only"])
def test_list_queues_returns_public_demo_summary(monkeypatch, database_url):
    # A URL de teste não contém credenciais e não deve ser acessada pela listagem.
    if database_url is None:
        monkeypatch.delenv("DATABASE_URL", raising=False)
    else:
        monkeypatch.setenv("DATABASE_URL", database_url)

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
