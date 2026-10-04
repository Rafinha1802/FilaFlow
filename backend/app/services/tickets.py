"""Guarda as senhas emitidas na memória de um único processo Python."""

from threading import Lock

from fastapi import HTTPException

from app.schemas.tickets import ManualTicketRequest, NextTicketResponse, QueueState, Ticket
from app.services.queues import list_queues

_tickets: list[Ticket] = []
_active_tickets: dict[str, Ticket] = {}
# O painel demonstrativo já utiliza as senhas até #48.
_next_ticket_number = 49
_ticket_lock = Lock()


def create_manual_ticket(data: ManualTicketRequest) -> Ticket:
    global _next_ticket_number

    if not any(queue.id == data.queue_id for queue in list_queues()):
        raise HTTPException(404, "Fila não encontrada.")

    # Número e armazenamento mudam juntos, mesmo com requisições simultâneas.
    with _ticket_lock:
        ticket = Ticket(
            queue_id=data.queue_id,
            ticket_number=f"#{_next_ticket_number}",
            customer_name=data.customer_name,
            service_name=data.service_name,
            is_priority=data.is_priority,
        )
        _tickets.append(ticket)
        _next_ticket_number += 1
    return ticket


def _waiting_tickets(queue_id: str) -> list[Ticket]:
    # A ordenação é estável: preserva a chegada dentro de cada grupo.
    # Usada somente enquanto o bloqueio está adquirido.
    return sorted(
        (ticket for ticket in _tickets if ticket.queue_id == queue_id),
        key=lambda ticket: not ticket.is_priority,
    )


def get_queue_state(queue_id: str) -> QueueState:
    if not any(queue.id == queue_id for queue in list_queues()):
        raise HTTPException(404, "Fila não encontrada.")
    with _ticket_lock:
        return QueueState(
            active_ticket=_active_tickets.get(queue_id),
            remaining_queue=_waiting_tickets(queue_id),
        )


def call_next_ticket(queue_id: str) -> NextTicketResponse:
    if not any(queue.id == queue_id for queue in list_queues()):
        raise HTTPException(404, "Fila não encontrada.")
    # Escolha, retirada e atualização são uma única operação protegida.
    with _ticket_lock:
        waiting = _waiting_tickets(queue_id)
        called = waiting[0] if waiting else None
        if called is not None:
            _tickets.remove(called)
            _active_tickets[queue_id] = called
        return NextTicketResponse(
            called_ticket=called,
            active_ticket=_active_tickets.get(queue_id),
            remaining_queue=waiting[1:] if called is not None else [],
        )
