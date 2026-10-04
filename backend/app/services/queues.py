"""Fornece dados demonstrativos de filas em memória, sem consultar banco."""

from app.schemas.queues import QueueSummary


def list_queues() -> list[QueueSummary]:
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
