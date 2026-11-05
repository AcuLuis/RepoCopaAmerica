@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Copa América 2024 - Servidor local
cd /d "%~dp0"

rem Uso: iniciar.bat [--sin-navegador]
set "ABRIR_NAVEGADOR=1"
if /i "%~1"=="--sin-navegador" set "ABRIR_NAVEGADOR="

echo.
echo  =============================================
echo    Copa América 2024 - Sitio web
echo  =============================================
echo.

rem ---- Buscar un puerto libre entre 8000 y 8010 ----
set "PUERTO="
for /l %%p in (8000,1,8010) do (
    if not defined PUERTO (
        netstat -ano | findstr /r /c:":%%p .*LISTENING" >nul
        if errorlevel 1 set "PUERTO=%%p"
    )
)
if not defined PUERTO (
    echo  No hay puertos libres entre 8000 y 8010.
    echo  Cierra otros servidores e intenta de nuevo.
    goto :fin
)

set "URL=http://localhost:%PUERTO%/"

rem ---- Elegir con qué servir el sitio: Python o Node.js ----
set "SERVIDOR="
python --version >nul 2>&1 && set "SERVIDOR=python -m http.server %PUERTO% --bind 127.0.0.1"
if not defined SERVIDOR (
    py -3 --version >nul 2>&1 && set "SERVIDOR=py -3 -m http.server %PUERTO% --bind 127.0.0.1"
)
if not defined SERVIDOR (
    node --version >nul 2>&1 && set "SERVIDOR=node servidor.js %PUERTO%"
)

if not defined SERVIDOR (
    echo  No se encontró Python ni Node.js en este equipo.
    echo.
    echo  Se abrirá el sitio directamente como archivo. Todo funciona,
    echo  pero los videos se abrirán en YouTube en lugar de dentro del sitio.
    echo.
    echo  Para la experiencia completa instala Python ^(https://www.python.org^)
    echo  o Node.js ^(https://nodejs.org^), ambos gratuitos, y vuelve a ejecutar este archivo.
    start "" "%~dp0index.html"
    goto :fin
)

echo  Sitio disponible en: %URL%
if defined ABRIR_NAVEGADOR echo  El navegador se abrirá en unos segundos.
echo.
echo  Para detener el servidor cierra esta ventana o presiona Ctrl + C.
echo.

rem Abrir el navegador cuando el servidor ya esté escuchando.
if defined ABRIR_NAVEGADOR start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%URL%'"

%SERVIDOR%

:fin
echo.
pause
endlocal
