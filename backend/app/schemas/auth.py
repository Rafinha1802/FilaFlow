"""Define o JSON de login e as respostas públicas, sem expor senha ou hash."""

from typing import Literal

from pydantic import BaseModel, Field, SecretStr


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=254)
    password: SecretStr = Field(min_length=1, max_length=1024)


class AuthUser(BaseModel):
    id: str = "demo-company"
    email: str
    role: Literal["company"] = "company"


class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: AuthUser
