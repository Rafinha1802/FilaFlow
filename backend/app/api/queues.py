"""Expõe a consulta pública de filas demonstrativas."""

from fastapi import APIRouter

from app.schemas.queues import QueueSummary
from app.services.queues import list_queues

router = APIRouter(prefix="/api/queues", tags=["Filas"])


@router.get("", response_model=list[QueueSummary])
def get_queues() -> list[QueueSummary]:
    # A rota cuida do HTTP; o serviço fornece os dados da resposta.
    return list_queues()
