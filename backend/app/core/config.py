"""Lê configurações do ambiente sem criar conexões com serviços externos."""

import os
from dataclasses import dataclass


def get_database_url() -> str | None:
    """Fornece a URL para a futura conexão PostgreSQL, quando configurada."""
    # Ler ao chamar a função evita guardar uma configuração antiga na importação.
    database_url = os.getenv("DATABASE_URL", "").strip()
    return database_url or None


@dataclass(frozen=True, repr=False)
class AuthSettings:
    """Transporta a configuração de autenticação sem exibi-la em representações."""

    email: str
    password_hash: str
    secret_key: str


def get_auth_settings() -> AuthSettings | None:
    """Sem configuração completa, somente a autenticação fica indisponível."""
    email = os.getenv("DEMO_USER_EMAIL", "").strip().casefold()
    password_hash = os.getenv("DEMO_PASSWORD_HASH", "").strip()
    secret_key = os.getenv("JWT_SECRET_KEY", "").strip()
    if not email or not password_hash or len(secret_key.encode("utf-8")) < 32:
        return None

    return AuthSettings(email, password_hash, secret_key)
