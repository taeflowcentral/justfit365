@echo off
title BioCore365 - Fitness ^& Nutricion Inteligente
echo.
echo  ================================================
echo   BioCore365 - Fitness ^& Nutricion Inteligente
echo   Iniciando servidor en http://localhost:3001
echo  ================================================
echo.
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs
timeout /t 3 /nobreak >nul
start http://localhost:3001
call npm run dev
pause
