"""Cria a aplicação FastAPI, registra suas rotas e oferece o endpoint de saúde."""

from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.queues import router as queues_router
from app.api.tickets import router as tickets_router
from app.api.websocket import router as websocket_router

app = FastAPI(title="FilaFlow API")

# Inclui as rotas de filas para que o servidor possa receber suas requisições.
app.include_router(queues_router)
app.include_router(auth_router)
app.include_router(tickets_router)
app.include_router(websocket_router)


@app.get("/api/health")
def health() -> dict[str, str]:
    # Verifica apenas se a API responde; não acessa banco ou serviços externos.
    return {"status": "ok"}
