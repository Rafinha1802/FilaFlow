@echo off
chcp 65001 >nul
title FilaFlow - Servidor Integrado (Backend Python + Frontend Vite)
color 0A

echo ======================================================================
echo          FILAFLOW - INICIALIZADOR UNIFICADO (BACK + FRONT)
echo ======================================================================
echo.
echo  [1/4] Verificando ambiente Python e Node.js...

set SCRIPT_DIR=%~dp0

:: Detecta diretório do Backend
if exist "%SCRIPT_DIR%app\main.py" (
    set "BACK_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%..\FilaFlow_back\FilaFlow_back\app\main.py" (
    set "BACK_DIR=%SCRIPT_DIR%..\FilaFlow_back\FilaFlow_back\"
) else if exist "%SCRIPT_DIR%..\FilaFlow_back\app\main.py" (
    set "BACK_DIR=%SCRIPT_DIR%..\FilaFlow_back\"
) else (
    set "BACK_DIR=%SCRIPT_DIR%"
)

:: Detecta diretório do Frontend
if exist "%SCRIPT_DIR%package.json" (
    set "FRONT_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%..\FilaFlow\package.json" (
    set "FRONT_DIR=%SCRIPT_DIR%..\FilaFlow\"
) else (
    set "FRONT_DIR=%SCRIPT_DIR%"
)

:: Libera a porta 5174 caso tenha ficado presa anteriormente
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

if not exist "%BACK_DIR%.venv\Scripts\python.exe" (
    echo  Ambiente virtual não encontrado em %BACK_DIR%. Criando .venv...
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
