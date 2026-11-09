"""Exercita login, configuração incompleta e rejeição de tokens inválidos."""

from datetime import datetime, timedelta, timezone
import secrets

import jwt
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.auth import password_hasher


@pytest.fixture(scope="module")
def test_account():
    # Credenciais efêmeras só para testes; nenhuma conta é criada na aplicação.
    password = secrets.token_urlsafe(24)
    return {
        "email": "test@example.invalid",
        "password": password,
        "password_hash": password_hasher.hash(password),
        "secret": secrets.token_urlsafe(48),
    }


@pytest.fixture
def auth_client(monkeypatch, test_account):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("DEMO_USER_EMAIL", test_account["email"])
    monkeypatch.setenv("DEMO_PASSWORD_HASH", test_account["password_hash"])
    monkeypatch.setenv("JWT_SECRET_KEY", test_account["secret"])
    with TestClient(app) as client:
        yield client


def test_login_and_protected_route(auth_client, test_account):
    response = auth_client.post("/api/auth/login", json={
        "email": "  TEST@example.invalid  ", "password": test_account["password"],
    })
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "no-store"
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["user"] == {
        "id": "demo-company", "email": test_account["email"], "role": "company",
    }
    claims = jwt.decode(data["access_token"], test_account["secret"], algorithms=["HS256"])
    assert claims["exp"] - claims["iat"] == 30 * 60
    assert set(claims) == {"sub", "iat", "exp", "iss"}

    protected = auth_client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {data['access_token']}",
    })
    assert protected.status_code == 200
    assert protected.json() == data["user"]
    for secret in (test_account["password"], test_account["password_hash"], test_account["secret"]):
        assert secret not in response.text
        assert secret not in protected.text


@pytest.mark.parametrize("wrong_field", ["email", "password"])
def test_invalid_credentials(auth_client, test_account, wrong_field):
    body = {"email": test_account["email"], "password": test_account["password"]}
    body[wrong_field] = "incorrect"
    response = auth_client.post("/api/auth/login", json=body)
    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"
    assert "access_token" not in response.json()


@pytest.mark.parametrize("authorization", [None, "Basic invalid", "Bearer not-a-jwt"])
def test_missing_or_malformed_token(auth_client, authorization):
    headers = {} if authorization is None else {"Authorization": authorization}
    response = auth_client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.parametrize("problem", [
    "expired", "signature", "subject", "missing_exp", "issuer", "algorithm", "future_iat",
])
def test_invalid_signed_tokens(auth_client, test_account, problem):
    now = datetime.now(timezone.utc)
    claims = {
        "sub": test_account["email"], "iat": now,
        "exp": now + timedelta(minutes=30), "iss": "filaflow-dev",
    }
    key = test_account["secret"]
    algorithm = "HS256"
    if problem == "expired":
        claims["exp"] = now - timedelta(seconds=1)
    elif problem == "signature":
        key = secrets.token_urlsafe(48)
    elif problem == "subject":
        claims["sub"] = "other@example.invalid"
    elif problem == "missing_exp":
        del claims["exp"]
    elif problem == "issuer":
        claims["iss"] = "other-app"
    elif problem == "algorithm":
        algorithm = "HS384"
    elif problem == "future_iat":
        claims["iat"] = now + timedelta(minutes=5)

    token = jwt.encode(claims, key, algorithm=algorithm)
    response = auth_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


@pytest.mark.parametrize("setting,value", [
    ("DEMO_USER_EMAIL", ""), ("DEMO_PASSWORD_HASH", ""),
    ("JWT_SECRET_KEY", ""), ("JWT_SECRET_KEY", "short"),
    ("DEMO_PASSWORD_HASH", "not-a-password-hash"),
])
def test_invalid_configuration_keeps_public_routes_available(
    auth_client, test_account, monkeypatch, setting, value,
):
    monkeypatch.setenv(setting, value)
    response = auth_client.post("/api/auth/login", json={
        "email": test_account["email"], "password": test_account["password"],
    })
    assert response.status_code == 503
    assert "access_token" not in response.json()
    assert auth_client.get("/api/health").status_code == 200
    assert auth_client.get("/api/queues").status_code == 200


def test_auth_without_environment(monkeypatch):
    for name in ("DEMO_USER_EMAIL", "DEMO_PASSWORD_HASH", "JWT_SECRET_KEY", "DATABASE_URL"):
        monkeypatch.delenv(name, raising=False)
    with TestClient(app) as client:
        assert client.get("/api/health").status_code == 200
        assert client.get("/api/queues").status_code == 200
        assert client.post("/api/auth/login", json={
            "email": "test@example.invalid", "password": "test-only",
        }).status_code == 503
        assert client.get("/api/auth/me").status_code == 401


@pytest.mark.parametrize("body", [{}, {"email": "test@example.invalid", "password": ""}])
def test_invalid_login_body(auth_client, body):
    assert auth_client.post("/api/auth/login", json=body).status_code == 422
