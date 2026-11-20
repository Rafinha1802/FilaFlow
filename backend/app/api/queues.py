"""Expõe a consulta pública de filas demonstrativas."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response

from app.api.auth import get_current_user
from app.core.config import get_database_url
from app.repositories.identity_store import allowed_queues
from app.schemas.auth import AuthUser

from app.schemas.queues import OperationalQueue, QueueSummary
from app.services.queues import list_queues

router = APIRouter(prefix="/api/queues", tags=["Filas"])


@router.get("", response_model=list[QueueSummary])
def get_queues() -> list[QueueSummary]:
    # A rota cuida do HTTP; o serviço fornece os dados da resposta.
    return list_queues()


@router.get("/me", response_model=list[OperationalQueue])
def get_my_queues(
    user: Annotated[AuthUser, Depends(get_current_user)], response: Response,
) -> list[OperationalQueue]:
    response.headers["Cache-Control"] = "no-store"
    if url := get_database_url():
        return allowed_queues(url, user.id)
    return [OperationalQueue(**queue.model_dump(), unitId=None, role="admin") for queue in list_queues()]
