"""Recebe emissões manuais somente de usuários autenticados."""

from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.schemas.tickets import ManualTicketRequest, Ticket
from app.services.tickets import create_manual_ticket

router = APIRouter(prefix="/api/tickets", tags=["Senhas"])


@router.post("/manual", response_model=Ticket, status_code=201,
             dependencies=[Depends(get_current_user)])
def issue_manual_ticket(data: ManualTicketRequest) -> Ticket:
    # A dependência valida o Bearer antes de permitir a emissão.
    return create_manual_ticket(data)
