"""Define o resumo de fila retornado ao frontend existente."""

from typing import Literal

from pydantic import BaseModel


class QueueSummary(BaseModel):
    # Os nomes em camelCase preservam o contrato já consumido pelo React.
    id: str
    companyName: str
    unitName: str
    attendantName: str
    room: str
    serviceName: str


class OperationalQueue(QueueSummary):
    unitId: str | None
    role: Literal["admin", "reception", "professional"]
