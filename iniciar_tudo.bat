@echo off
chcp 65001 >nul
title FilaFlow - Servidor Integrado (Backend Python + Frontend Vite)
color 0A

echo ======================================================================
echo          FILAFLOW - INICIALIZADOR UNIFICADO (BACK + FRONT)
echo ======================================================================
echo.
echo  [1/4] Verificando ambiente Python...

set BACK_DIR=%~dp0
set FRONT_DIR=%~dp0..\FilaFlow

if not exist "%BACK_DIR%.venv\Scripts\python.exe" (
    echo  Ambiente virtual não encontrado. Criando .venv...
    python -m venv "%BACK_DIR%.venv"
    echo  Instalando dependências do backend...
    "%BACK_DIR%.venv\Scripts\pip.exe" install -r "%BACK_DIR%requirements.txt"
)

echo  [2/4] Iniciando Backend Python (FastAPI na porta 8000)...
start "FilaFlow - Backend (FastAPI)" cmd /k "cd /d %BACK_DIR% && color 0B && title FilaFlow Backend && echo === FilaFlow FastAPI Backend === && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo  [3/4] Iniciando Frontend React (Vite na porta 5174)...
start "FilaFlow - Frontend (Vite)" cmd /k "cd /d %FRONT_DIR% && color 0D && title FilaFlow Frontend && echo === FilaFlow Vite Frontend === && npm.cmd run dev"

echo  [4/4] Aguardando inicialização dos servidores...
timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo      SISTEMAS INICIADOS COM SUCESSO!
echo ======================================================================
echo   - Frontend:       http://localhost:5174/
echo   - Painel Empresa: http://localhost:5174/empresa/dashboard
echo   - App do Cliente: http://localhost:5174/app
echo   - Backend API:    http://127.0.0.1:8000/
echo   - Documentação:   http://127.0.0.1:8000/docs (Swagger Interativo)
echo ======================================================================
echo.
echo  Abrindo o FilaFlow no seu navegador padrão...
start http://localhost:5174/

echo.
echo  Pressione qualquer tecla nesta janela para encerrar ou feche os terminais.
pause >nul
