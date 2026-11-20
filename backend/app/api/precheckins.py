"""Expõe pré-check-in do cliente e confirmação da recepção."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response
from starlette.concurrency import run_in_threadpool

from app.api.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.precheckins import ConfirmPrecheckinRequest, PrecheckinRequest, PrecheckinTicket
from app.services import precheckins
from app.services.events import notify_queue

router = APIRouter(prefix="/api/pre-checkins", tags=["Pré-check-in"])
CurrentUser = Annotated[AuthUser, Depends(get_current_user)]


@router.post("", response_model=PrecheckinTicket)
def create_precheckin(data: PrecheckinRequest, user: CurrentUser, response: Response):
    response.headers["Cache-Control"] = "no-store"
    return precheckins.create(data, user.id)


@router.get("/me", response_model=list[PrecheckinTicket])
def read_my_precheckins(user: CurrentUser, response: Response):
    response.headers["Cache-Control"] = "no-store"
    return precheckins.list_mine(user.id)


@router.get("", response_model=list[PrecheckinTicket])
def read_pending_precheckins(
    user: CurrentUser, response: Response, queue_id: str = Query(min_length=1, max_length=100),
):
    response.headers["Cache-Control"] = "no-store"
    return precheckins.list_pending(queue_id, user.id)


@router.post("/{ticket_id}/confirm", response_model=PrecheckinTicket)
async def confirm_precheckin(
    data: ConfirmPrecheckinRequest, user: CurrentUser, response: Response,
    ticket_id: int = Path(gt=0),
):
    response.headers["Cache-Control"] = "no-store"
    ticket = await run_in_threadpool(precheckins.confirm, ticket_id, user.id, data.is_priority)
    await notify_queue(ticket.queue_id, "QUEUE_UPDATED")
    return ticket
