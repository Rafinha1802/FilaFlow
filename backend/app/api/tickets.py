"""Expõe emissão, consulta e chamada de senhas para usuários autenticados."""

from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.schemas.tickets import ManualTicketRequest, NextTicketResponse, QueueState, Ticket
from app.services.tickets import call_next_ticket, create_manual_ticket, get_queue_state
from app.services.events import notify_queue

router = APIRouter(prefix="/api/tickets", tags=["Senhas"])


@router.post("/manual", response_model=Ticket, status_code=201,
             dependencies=[Depends(get_current_user)])
async def issue_manual_ticket(data: ManualTicketRequest) -> Ticket:
    # A dependência valida o Bearer antes de permitir a emissão.
    ticket = create_manual_ticket(data)
    await notify_queue(data.queue_id, "QUEUE_UPDATED")
    return ticket


@router.get("", response_model=QueueState, dependencies=[Depends(get_current_user)])
def read_queue_state(queue_id: str = Query(min_length=1, max_length=100)) -> QueueState:
    return get_queue_state(queue_id)


@router.post("/next", response_model=NextTicketResponse,
             dependencies=[Depends(get_current_user)])
async def call_next(queue_id: str = Query(min_length=1, max_length=100)) -> NextTicketResponse:
    result = call_next_ticket(queue_id)
    if result.called_ticket is not None:
        await notify_queue(queue_id, "TICKET_CALLED")
    return result
