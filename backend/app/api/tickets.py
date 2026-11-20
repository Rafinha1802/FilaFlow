"""Expõe emissão, consulta e chamada de senhas para usuários autenticados."""

from typing import Annotated

from starlette.concurrency import run_in_threadpool

from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.tickets import ManualTicketRequest, NextTicketResponse, QueueState, Ticket
from app.services.tickets import call_next_ticket, create_manual_ticket, finish_current_ticket, get_queue_state
from app.services.events import notify_queue

router = APIRouter(prefix="/api/tickets", tags=["Senhas"])
CurrentUser = Annotated[AuthUser, Depends(get_current_user)]


@router.post("/manual", response_model=Ticket, status_code=201)
async def issue_manual_ticket(data: ManualTicketRequest, user: CurrentUser) -> Ticket:
    ticket = await run_in_threadpool(create_manual_ticket, data, user.id)
    await notify_queue(data.queue_id, "QUEUE_UPDATED")
    return ticket


@router.get("", response_model=QueueState)
def read_queue_state(user: CurrentUser, queue_id: str = Query(min_length=1, max_length=100)) -> QueueState:
    return get_queue_state(queue_id, user.id)


@router.post("/next", response_model=NextTicketResponse)
async def call_next(user: CurrentUser, queue_id: str = Query(min_length=1, max_length=100)) -> NextTicketResponse:
    result = await run_in_threadpool(call_next_ticket, queue_id, user.id)
    if result.called_ticket is not None:
        await notify_queue(queue_id, "TICKET_CALLED")
    return result


@router.post("/finish", response_model=QueueState)
async def finish(
    user: CurrentUser,
    queue_id: str = Query(min_length=1, max_length=100),
    ticket_number: str = Query(min_length=2, max_length=24),
) -> QueueState:
    result = await run_in_threadpool(finish_current_ticket, queue_id, ticket_number, user.id)
    await notify_queue(queue_id, "QUEUE_UPDATED")
    return result
