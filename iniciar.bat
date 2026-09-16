@echo off
title FilaFlow - Servidor Local
echo ========================================================
echo   Iniciando o FilaFlow (Vite Dev Server)...
echo   Acesse no navegador: http://localhost:5174/
echo ========================================================
echo.
if not exist "node_modules" (
    echo Instalando dependencias necessarias pela primeira vez...
    call npm install
)
call npm run dev
pause

