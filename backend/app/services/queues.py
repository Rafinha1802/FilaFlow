"""Fornece dados demonstrativos de filas em memória, sem consultar banco."""

from app.core.config import get_database_url
from app.repositories import queue_store
from app.schemas.queues import QueueSummary


def list_queues() -> list[QueueSummary]:
    if url := get_database_url():
        return queue_store.list_queues(url)
    # Cada consulta cria sua própria lista; ainda não há estado persistente.
    return [
        QueueSummary(
            id="clinica-vida",
            companyName="Clínica Vida",
            unitName="Unidade Centro",
            attendantName="Dr. Carlos Mendes",
            room="Consultório 04",
            serviceName="Consulta Oftalmologia Geral",
        )
    ]
