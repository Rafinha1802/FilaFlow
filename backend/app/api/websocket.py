"""Autentica assinaturas WebSocket e acompanha a conexão enquanto estiver válida."""

import asyncio
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from app.services.events import (
    authorize_subscription, authorize_ticket_subscription, close_connection,
    connections, ticket_connections,
)

router = APIRouter()


@router.websocket("/ws")
async def queue_websocket(socket: WebSocket) -> None:
    await serve_subscription(socket)


@router.websocket("/ws/tickets")
async def ticket_websocket(socket: WebSocket) -> None:
    await serve_subscription(socket, ticket_scope=True)


async def serve_subscription(socket: WebSocket, ticket_scope: bool = False) -> None:
    key = "ticket_id" if ticket_scope else "queue_id"
    registry = ticket_connections if ticket_scope else connections
    authorize = authorize_ticket_subscription if ticket_scope else authorize_subscription
    await socket.accept()
    try:
        # O token vai na primeira mensagem, não na URL nem nos logs de acesso.
        subscription = await asyncio.wait_for(socket.receive_json(), timeout=5)
        if not isinstance(subscription, dict) or subscription.get("type") != "subscribe":
            await close_connection(socket, code=1008)
            return
        token = subscription.get("token")
        target = subscription.get(key)
        if not isinstance(token, str) or not token or len(token) > 4096:
            await close_connection(socket, code=1008)
            return
        valid_target = (
            type(target) is int and 0 < target < 2**63
            if ticket_scope else isinstance(target, str) and 1 <= len(target) <= 100
        )
        if not valid_target:
            await close_connection(socket, code=1008)
            return
        await run_in_threadpool(authorize, token, target)
        registry[socket] = (target, token)
        await socket.send_json({"type": "READY", key: target})

        while True:
            message = await asyncio.wait_for(socket.receive_json(), timeout=45)
            await run_in_threadpool(authorize, token, target)
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
        registry.pop(socket, None)
