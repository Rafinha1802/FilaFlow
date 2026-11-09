"""Expõe o login JSON e demonstra a proteção de uma rota com token Bearer."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import AuthUser, LoginRequest, LoginResponse
from app.services.auth import login, unauthorized, verify_token

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])
bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> AuthUser:
    # Esta dependência pode proteger outras rotas quando forem implementadas.
    if credentials is None:
        raise unauthorized()
    return verify_token(credentials.credentials)


@router.post("/login", response_model=LoginResponse)
def login_user(data: LoginRequest, response: Response) -> LoginResponse:
    response.headers["Cache-Control"] = "no-store"
    return login(data.email, data.password.get_secret_value())


@router.get("/me", response_model=AuthUser)
def read_current_user(
    user: Annotated[AuthUser, Depends(get_current_user)], response: Response,
) -> AuthUser:
    response.headers["Cache-Control"] = "no-store"
    return user
