@echo off
title Simulador ELITE - Servidor local
echo ==========================================
echo   Simulador ELITE - Servidor local
echo ==========================================
echo.
echo Iniciando servidor en:
echo http://localhost:8000
echo.
cd /d "%~dp0"
start http://localhost:8000
python -m http.server 8000
if errorlevel 1 (
    echo.
    echo No se pudo iniciar con "python". Intentando con "py"...
    py -m http.server 8000
)
echo.
echo Si ves este mensaje, revisa que Python este instalado.
pause
