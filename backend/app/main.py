"""Cria a aplicação FastAPI e disponibiliza a verificação de funcionamento."""

from fastapi import FastAPI

app = FastAPI(title="FilaFlow API")


@app.get("/api/health")
def health() -> dict[str, str]:
    # Verifica apenas se a API responde; não acessa banco ou serviços externos.
    return {"status": "ok"}
