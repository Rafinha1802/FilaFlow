"""Autentica assinaturas WebSocket e acompanha a conexão enquanto estiver válida."""

import asyncio
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from app.services.events import authorize_subscription, close_connection, connections

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
        if not isinstance(queue_id, str) or not 1 <= len(queue_id) <= 100:
            await close_connection(socket, code=1008)
            return
        await run_in_threadpool(authorize_subscription, token, queue_id)
        connections[socket] = (queue_id, token)
        await socket.send_json({"type": "READY", "queue_id": queue_id})

        while True:
            message = await asyncio.wait_for(socket.receive_json(), timeout=45)
            await run_in_threadpool(authorize_subscription, token, queue_id)
            if not isinstance(message, dict) or message.get("type") != "ping":
                await close_connection(socket, code=1008)
                return
            await socket.send_json({"type": "pong"})
    except HTTPException as error:
        await close_connection(socket, code=1011 if error.status_code == 503 else 1008)
    except (json.JSONDecodeError, UnicodeDecodeError, KeyError):
        await close_connection(socket, code=1008)
    except TimeoutError:
        await close_connection(socket)
    except (WebSocketDisconnect, RuntimeError, OSError):
        pass
    finally:
        connections.pop(socket, None)
