@echo off
title BioCore365
cd /d "C:\Users\Laura\Desktop\biocore"
set PATH=C:\Program Files\nodejs;%PATH%
echo Iniciando BioCore365 en http://localhost:3001 ...
start "" http://localhost:3001
npx vite --port 3001
pause
