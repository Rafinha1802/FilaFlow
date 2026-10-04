"""Verifica o contrato HTTP do endpoint de saúde, sem precisar de banco."""

from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok():
    # O cliente executa a requisição na aplicação, sem abrir uma porta de rede.
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
