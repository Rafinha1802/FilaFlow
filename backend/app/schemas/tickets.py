"""Define os dados da emissão manual e a senha devolvida ao painel."""

from pydantic import BaseModel, ConfigDict, Field


class ManualTicketRequest(BaseModel):
    # Espaços nas extremidades são removidos antes da validação do tamanho.
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    queue_id: str = Field(min_length=1, max_length=100)
    customer_name: str = Field(min_length=1, max_length=150)
    service_name: str = Field(min_length=1, max_length=150)
    is_priority: bool = Field(default=False, strict=True)


class Ticket(BaseModel):
    model_config = ConfigDict(frozen=True)

    queue_id: str
    ticket_number: str
    customer_name: str
    service_name: str
    is_priority: bool
    estimated_wait_text: str = "Aguardando"
