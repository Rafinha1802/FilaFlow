"""Coordena o pré-check-in persistido e sua confirmação."""

from fastapi import HTTPException

from app.core.config import get_database_url
from app.repositories import precheckin_store
from app.schemas.precheckins import PrecheckinRequest, PrecheckinTicket


def database_url() -> str:
    url = get_database_url()
    if not url:
        raise HTTPException(503, "Pré-check-in requer o banco de dados configurado.")
    return url


def create(data: PrecheckinRequest, account_id: str) -> PrecheckinTicket:
    return precheckin_store.create(database_url(), data, account_id)


def list_mine(account_id: str) -> list[PrecheckinTicket]:
    return precheckin_store.list_mine(database_url(), account_id)


def list_pending(queue_id: str, account_id: str) -> list[PrecheckinTicket]:
    return precheckin_store.list_pending(database_url(), queue_id, account_id)


def confirm(ticket_id: int, account_id: str, is_priority: bool) -> PrecheckinTicket:
    return precheckin_store.confirm(database_url(), ticket_id, account_id, is_priority)


def get_mine(ticket_id: int, account_id: str) -> PrecheckinTicket:
    return precheckin_store.get_mine(database_url(), ticket_id, account_id)
