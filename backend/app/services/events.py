"""Mantém assinantes em memória e avisa quando a fila muda no mesmo processo."""

import asyncio

from fastapi import HTTPException, WebSocket, WebSocketDisconnect

from app.services.auth import verify_token

# Acesso apenas pelo event loop: cada conexão guarda sua fila e seu token.
connections: dict[WebSocket, tuple[str, str]] = {}


async def close_connection(socket: WebSocket, code: int = 1001) -> None:
    connections.pop(socket, None)
    try:
        await asyncio.wait_for(socket.close(code=code), timeout=1)
    except (RuntimeError, OSError, WebSocketDisconnect, TimeoutError):
        pass


async def _notify(socket: WebSocket, queue_id: str, token: str, event_type: str) -> None:
    try:
        # Uma conexão aberta não mantém acesso depois de o token expirar.
        verify_token(token)
    except HTTPException:
        await close_connection(socket, code=1008)
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
