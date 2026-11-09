@echo off
setlocal
cd /d "%~dp0" || exit /b 1

if not exist "backend\app\main.py" (
    echo Backend ausente neste checkout.
    exit /b 1
)
if not exist "backend\.venv\Scripts\python.exe" (
    echo Crie o ambiente virtual conforme docs\desenvolvimento\ambiente-local.md.
    exit /b 1
)
"backend\.venv\Scripts\python.exe" -c "import uvicorn; import fastapi; import pwdlib; import jwt" || exit /b 1
if not exist "node_modules\.bin\vite.cmd" (
    echo Instale as dependencias na raiz com npm ci.
    exit /b 1
)

start "TemFyla Backend" /D "%CD%\backend" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" || exit /b 1
start "TemFyla Frontend" /D "%CD%" cmd /k "npm.cmd run dev -- --strictPort" || exit /b 1
echo Comandos enviados aos terminais. Confirme a inicializacao em cada janela.
