"""Autentica assinaturas WebSocket e acompanha a conexão enquanto estiver válida."""

import asyncio
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.services.auth import verify_token
from app.services.events import close_connection, connections
from app.services.queues import list_queues

router = APIRouter()


@router.websocket("/ws")
async def queue_websocket(socket: WebSocket) -> None:
    await socket.accept()
    try:
        # O token vai na primeira mensagem, não na URL nem nos logs de acesso.
        subscription = await asyncio.wait_for(socket.receive_json(), timeout=5)
        if not isinstance(subscription, dict) or subscription.get("type") != "subscribe":
            await close_connection(socket, code=1008)
            return
        token = subscription.get("token")
        queue_id = subscription.get("queue_id")
        if not isinstance(token, str) or not token or len(token) > 4096:
            await close_connection(socket, code=1008)
            return
        verify_token(token)
        if not any(queue.id == queue_id for queue in list_queues()):
            await close_connection(socket, code=1008)
            return
        connections[socket] = (queue_id, token)
        await socket.send_json({"type": "READY", "queue_id": queue_id})

        while True:
            message = await asyncio.wait_for(socket.receive_json(), timeout=45)
            verify_token(token)
            if not isinstance(message, dict) or message.get("type") != "ping":
                await close_connection(socket, code=1008)
                return
            await socket.send_json({"type": "pong"})
    except HTTPException:
        await close_connection(socket, code=1008)
    except (json.JSONDecodeError, UnicodeDecodeError, KeyError):
        await close_connection(socket, code=1008)
    except TimeoutError:
        await close_connection(socket)
    except (WebSocketDisconnect, RuntimeError, OSError):
        pass
    finally:
        connections.pop(socket, None)
