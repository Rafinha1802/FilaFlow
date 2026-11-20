"""Mantém assinantes em memória e avisa quando a fila muda no mesmo processo."""

import asyncio

from fastapi import HTTPException, WebSocket, WebSocketDisconnect

from starlette.concurrency import run_in_threadpool

from app.core.config import get_database_url
from app.repositories.queue_store import connection, require_queue_access
from app.services.auth import verify_token
from app.services.queues import list_queues

# Acesso apenas pelo event loop: cada conexão guarda sua fila e seu token.
connections: dict[WebSocket, tuple[str, str]] = {}


async def close_connection(socket: WebSocket, code: int = 1001) -> None:
    connections.pop(socket, None)
    try:
        await asyncio.wait_for(socket.close(code=code), timeout=1)
    except (RuntimeError, OSError, WebSocketDisconnect, TimeoutError):
        pass


def authorize_subscription(token: str, queue_id: str) -> None:
    user = verify_token(token)
    if url := get_database_url():
        with connection(url) as conn:
            require_queue_access(conn, queue_id, user.id)
    elif not any(queue.id == queue_id for queue in list_queues()):
        raise HTTPException(403, "Acesso à fila não permitido.")


async def _notify(socket: WebSocket, queue_id: str, token: str, event_type: str) -> None:
    try:
        # Uma conexão aberta não mantém acesso depois de o token expirar.
        await run_in_threadpool(authorize_subscription, token, queue_id)
    except HTTPException as error:
        await close_connection(socket, code=1011 if error.status_code == 503 else 1008)
        return
    if connections.get(socket) != (queue_id, token):
        return
    try:
        await asyncio.wait_for(socket.send_json({
            "type": event_type, "queue_id": queue_id,
        }), timeout=2)
    except (RuntimeError, OSError, WebSocketDisconnect, TimeoutError):
        # Uma aba desconectada não deve impedir uma emissão ou chamada HTTP.
        await close_connection(socket)


async def notify_queue(queue_id: str, event_type: str) -> None:
    await asyncio.gather(*(
        _notify(socket, queue_id, token, event_type)
        for socket, (subscribed_queue, token) in list(connections.items())
        if subscribed_queue == queue_id
    ))
