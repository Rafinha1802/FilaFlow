"""Cria os dois arquivos de configuração local com valores privados."""

import re
import secrets
from getpass import getpass
from pathlib import Path
from urllib.parse import quote

from pwdlib import PasswordHash

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    compose_env = ROOT / ".env"
    backend_env = ROOT / "backend" / ".env"
    for path in (compose_env, backend_env):
        if path.exists() or path.is_symlink():
            raise SystemExit(f"{path.relative_to(ROOT)} ja existe. Preserve ou ajuste o arquivo manualmente.")

    database_password = getpass("Senha PostgreSQL existente (Enter gera uma senha para volume novo): ")
    if any(char in database_password for char in "\r\n\x00\\'"):
        raise SystemExit("A senha do banco nao pode conter quebra de linha, barra invertida ou aspas simples.")
    database_password = database_password or secrets.token_urlsafe(32)
    port = input("Porta local do PostgreSQL [5433]: ").strip() or "5433"
    if not re.fullmatch(r"[0-9]{1,5}", port) or not 1 <= int(port) <= 65535:
        raise SystemExit("Porta invalida.")
    email = input("E-mail ficticio [operador@example.invalid]: ").strip() or "operador@example.invalid"
    if not re.fullmatch(r"[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+", email):
        raise SystemExit("Informe um e-mail ficticio valido.")
    password = getpass("Senha do operador ficticio: ")
    if not password or password != getpass("Confirme a senha do operador: "):
        raise SystemExit("Senha vazia ou confirmacao diferente.")

    password_hash = PasswordHash.recommended().hash(password)
    jwt_key = secrets.token_urlsafe(48)
    database_url = f"postgresql://temfyla:{quote(database_password, safe='')}@127.0.0.1:{int(port)}/temfyla"
    entries = {
        compose_env: f"TEMFYLA_DB_PASSWORD='{database_password}'\nTEMFYLA_DB_PORT={int(port)}\n",
        backend_env: (
            f"DATABASE_URL={database_url}\nDEMO_USER_EMAIL={email}\n"
            f"DEMO_PASSWORD_HASH='{password_hash}'\nJWT_SECRET_KEY={jwt_key}\n"
        ),
    }

    created = []
    try:
        for path, contents in entries.items():
            with path.open("x", encoding="utf-8") as file:
                created.append(path)
                file.write(contents)
    except OSError as error:
        for path in created:
            path.unlink()
        raise SystemExit(f"Nao foi possivel criar os arquivos: {error}") from error
    print("Arquivos .env e backend/.env criados.")


if __name__ == "__main__":
    main()
