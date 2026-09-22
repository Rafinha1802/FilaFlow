@echo off
title FilaFlow - Servidor Local
echo ========================================================
echo   Iniciando o FilaFlow (Vite Dev Server)...
echo   Acesse no navegador: http://localhost:5174/
echo ========================================================
echo.

:: Libera a porta 5174 caso tenha ficado presa anteriormente
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

if not exist "node_modules" (
    echo Instalando dependencias necessarias pela primeira vez...
    call npm install
)
call npm run dev
pause
