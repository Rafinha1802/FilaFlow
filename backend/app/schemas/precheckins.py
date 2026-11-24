"""Contratos do pré-check-in e da confirmação pela recepção."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tickets import Ticket


class PrecheckinRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    queue_id: str = Field(min_length=1, max_length=100)
    request_id: UUID


class ConfirmPrecheckinRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_priority: bool = Field(default=False, strict=True)


class PrecheckinTicket(Ticket):
    id: int
    status: Literal["pending", "waiting", "active", "finished"]
    issued_at: datetime
    confirmed_at: datetime | None
    waiting_since: datetime | None
    called_at: datetime | None = None
    finished_at: datetime | None = None
