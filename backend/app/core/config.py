"""Lê configurações do ambiente sem criar conexões com serviços externos."""

import os


def get_database_url() -> str | None:
    """Fornece a URL para a futura conexão PostgreSQL, quando configurada."""
    # Ler ao chamar a função evita guardar uma configuração antiga na importação.
    database_url = os.getenv("DATABASE_URL", "").strip()
    return database_url or None
