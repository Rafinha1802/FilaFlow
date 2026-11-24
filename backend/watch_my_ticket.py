"""Acompanha uma senha própria no ambiente local, com autenticação interativa."""

import argparse
import asyncio
from datetime import datetime
from getpass import getpass
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from websockets.asyncio.client import connect
from websockets.exceptions import ConnectionClosed

BASE_URL = "http://127.0.0.1:8000"


def request_json(path: str, *, token: str | None = None, body: dict | None = None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    with urlopen(Request(BASE_URL + path, data=data, headers=headers), timeout=10) as response:
        return json.load(response)


def local_timestamp(value: str | None) -> str:
    if value is None:
        return "pendente"
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone().isoformat(
        sep=" ", timespec="seconds",
    )


def show_state(ticket_id: int, token: str) -> None:
    ticket = request_json(f"/api/pre-checkins/{ticket_id}", token=token)
    print(
        f"Senha {ticket['ticket_number']} | {ticket['status']} | "
        f"chamada: {local_timestamp(ticket['called_at'])} | "
        f"conclusão: {local_timestamp(ticket['finished_at'])}",
        flush=True,
    )


async def watch(ticket_id: int, token: str) -> None:
    async with connect("ws://127.0.0.1:8000/ws/tickets") as socket:
        await socket.send(json.dumps({"type": "subscribe", "token": token, "ticket_id": ticket_id}))
        while True:
            try:
                raw = await asyncio.wait_for(socket.recv(), timeout=20)
            except TimeoutError:
                await socket.send(json.dumps({"type": "ping"}))
                continue
            event = json.loads(raw)
            if event.get("type") in ("READY", "TICKET_UPDATED"):
                show_state(ticket_id, token)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ticket_id", type=int)
    args = parser.parse_args()
    if not 0 < args.ticket_id < 2**63:
        raise SystemExit("Identificador de senha inválido.")
    email = input("E-mail da conta fictícia de cliente: ").strip()
    password = getpass("Senha: ")
    try:
        session = request_json("/api/auth/login", body={"email": email, "password": password})
        token = session["access_token"]
        print("Horários no fuso local do computador, com o deslocamento UTC indicado.")
        asyncio.run(watch(args.ticket_id, token))
    except HTTPError as error:
        raise SystemExit(f"A API recusou a consulta (HTTP {error.code}). Confira a conta e a senha escolhida.") from None
    except URLError:
        raise SystemExit("A API local está indisponível.") from None
    except ConnectionClosed as error:
        raise SystemExit(f"A assinatura foi encerrada (código {error.code}). Execute novamente para reconectar.") from None
    except KeyboardInterrupt:
        print("Acompanhamento encerrado.")


if __name__ == "__main__":
    main()
