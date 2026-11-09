"""Testa a configuração opcional do banco sem acessar PostgreSQL."""

import pytest

from app.core.config import get_database_url


@pytest.mark.parametrize("value", [None, "", "   "])
def test_database_url_is_optional(monkeypatch, value):
    # monkeypatch restaura o ambiente ao final de cada teste.
    if value is None:
        monkeypatch.delenv("DATABASE_URL", raising=False)
    else:
        monkeypatch.setenv("DATABASE_URL", value)

    assert get_database_url() is None


def test_database_url_reads_current_environment(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_database_url() is None

    # Endereço apenas para teste de leitura: não contém credenciais nem é acessado.
    database_url = "postgresql://localhost/test_only"
    monkeypatch.setenv("DATABASE_URL", database_url)

    assert get_database_url() == database_url
