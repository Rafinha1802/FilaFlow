"""Autentica o usuário de desenvolvimento e emite ou verifica seus tokens JWT."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from app.core.config import AuthSettings, get_auth_settings
from app.schemas.auth import AuthUser, LoginResponse

password_hasher = PasswordHash.recommended()
TOKEN_LIFETIME = timedelta(minutes=30)
TOKEN_ISSUER = "filaflow-dev"


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
    settings = require_auth_settings()
    try:
        # Verifica o hash mesmo para outro e-mail, evitando atalhos na validação.
        password_matches = password_hasher.verify(password, settings.password_hash)
    except (UnknownHashError, ValueError):
        raise HTTPException(503, "Configuração de autenticação inválida.") from None

    if not password_matches or email.strip().casefold() != settings.email:
        raise unauthorized()

    now = datetime.now(timezone.utc)
    # O token contém identificação e validade, nunca senha, hash ou chave secreta.
    token = jwt.encode(
        {
            "sub": settings.email,
            "iat": now,
            "exp": now + TOKEN_LIFETIME,
            "iss": TOKEN_ISSUER,
        },
        settings.secret_key,
        algorithm="HS256",
    )
    return LoginResponse(access_token=token, user=AuthUser(email=settings.email))


def verify_token(token: str) -> AuthUser:
    settings = require_auth_settings()
    try:
        # O algoritmo permitido é definido pelo servidor, não pelo token recebido.
        claims = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            issuer=TOKEN_ISSUER,
            options={"require": ["sub", "iat", "exp", "iss"]},
        )
    except jwt.InvalidTokenError:
        raise unauthorized() from None

    if claims["sub"] != settings.email:
        raise unauthorized()
    return AuthUser(email=settings.email)
