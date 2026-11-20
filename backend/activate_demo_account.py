"""Ativa uma conta já criada no seed local, lendo a senha interativamente."""

import argparse
from getpass import getpass
from pathlib import Path

import psycopg
from dotenv import load_dotenv

from app.core.config import get_database_url
from app.services.auth import password_hasher


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("account", choices=("demo-centro", "demo-norte", "demo-multi", "demo-recepcao-norte", "demo-cliente", "demo-cliente-2"))
    parser.add_argument("--env-file", type=Path, default=Path(__file__).parent / ".env")
    args = parser.parse_args()
    load_dotenv(args.env_file)
    url = get_database_url()
    if not url:
        raise SystemExit("Configure DATABASE_URL no ambiente local.")
    password = getpass("Senha fictícia (mínimo 12 caracteres): ")
    if not 12 <= len(password) <= 1024 or password != getpass("Confirme a senha: "):
        raise SystemExit("Senha inválida ou confirmação diferente.")
    password_hash = password_hasher.hash(password)
    try:
        with psycopg.connect(url, connect_timeout=5) as conn:
            result = conn.execute("""
                UPDATE accounts SET password_hash = %s, is_active = true
                WHERE id = %s AND email = %s AND NOT is_active
            """, (password_hash, args.account, args.account.removeprefix("demo-") + "@example.invalid"))
            if result.rowcount != 1:
                raise SystemExit("Conta inexistente ou já ativa. Confira o seed local.")
    except psycopg.Error:
        raise SystemExit("Falha ao atualizar a conta no PostgreSQL.") from None
    print("Conta fictícia ativada.")


if __name__ == "__main__":
    main()
