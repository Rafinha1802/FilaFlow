"""Guarda as senhas emitidas na memória de um único processo Python."""

from threading import Lock

from fastapi import HTTPException

from app.schemas.tickets import ManualTicketRequest, Ticket
from app.services.queues import list_queues

_tickets: list[Ticket] = []
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
