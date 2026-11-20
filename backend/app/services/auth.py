"""Autentica o usuário de desenvolvimento e emite ou verifica seus tokens JWT."""

from datetime import datetime, timedelta, timezone
import os
import secrets

import jwt
from fastapi import HTTPException
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from app.core.config import AuthSettings, get_auth_settings, get_database_url
from app.repositories.identity_store import active_account
from app.schemas.auth import AuthUser, LoginResponse

password_hasher = PasswordHash.recommended()
TOKEN_LIFETIME = timedelta(minutes=30)
TOKEN_ISSUER = "filaflow-dev"
DATABASE_TOKEN_ISSUER = "temfyla-accounts"
dummy_hash = password_hasher.hash(secrets.token_urlsafe(32))


def database_signing_key() -> str:
    key = os.getenv("JWT_SECRET_KEY", "").strip()
    if len(key.encode("utf-8")) < 32:
        raise HTTPException(503, "Autenticação não configurada.")
    return key


def require_auth_settings() -> AuthSettings:
    settings = get_auth_settings()
    if settings is None:
        raise HTTPException(503, "Autenticação de desenvolvimento não configurada.")
    return settings


def unauthorized() -> HTTPException:
    return HTTPException(
        401,
        "Credenciais ou token inválidos.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def login(email: str, password: str) -> LoginResponse:
    if url := get_database_url():
        key = database_signing_key()
        account = active_account(url, email=email.strip().lower())
        try:
            matches = password_hasher.verify(password, account["password_hash"] if account else dummy_hash)
        except (UnknownHashError, ValueError):
            matches = False
        if not account or not matches:
            raise unauthorized()
        return issue_token(AuthUser(id=account["id"], email=account["email"]), account["id"],
                           key, DATABASE_TOKEN_ISSUER)

    settings = require_auth_settings()
    try:
        # Verifica o hash mesmo para outro e-mail, evitando atalhos na validação.
        password_matches = password_hasher.verify(password, settings.password_hash)
    except (UnknownHashError, ValueError):
        raise HTTPException(503, "Configuração de autenticação inválida.") from None

    if not password_matches or email.strip().casefold() != settings.email:
        raise unauthorized()

    return issue_token(AuthUser(email=settings.email), settings.email, settings.secret_key, TOKEN_ISSUER)


def issue_token(user: AuthUser, subject: str, key: str, issuer: str) -> LoginResponse:
    now = datetime.now(timezone.utc)
    # O token contém identificação e validade, nunca senha, hash ou chave secreta.
    token = jwt.encode(
        {
            "sub": subject,
            "iat": now,
            "exp": now + TOKEN_LIFETIME,
            "iss": issuer,
        },
        key,
        algorithm="HS256",
    )
    return LoginResponse(access_token=token, user=user)


def verify_token(token: str) -> AuthUser:
    url = get_database_url()
    settings = None if url else require_auth_settings()
    key = settings.secret_key if settings else database_signing_key()
    try:
        # O algoritmo permitido é definido pelo servidor, não pelo token recebido.
        claims = jwt.decode(
            token,
            key,
            algorithms=["HS256"],
            issuer=DATABASE_TOKEN_ISSUER if url else TOKEN_ISSUER,
            options={"require": ["sub", "iat", "exp", "iss"]},
        )
    except jwt.InvalidTokenError:
        raise unauthorized() from None

    if url:
        account = active_account(url, account_id=claims["sub"])
        if not account:
            raise unauthorized()
        return AuthUser(id=account["id"], email=account["email"])

    if claims["sub"] != settings.email:
        raise unauthorized()
    return AuthUser(email=settings.email)
