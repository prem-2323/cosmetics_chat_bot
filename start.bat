@echo off
title CosmoGPT Launcher
cd /d "%~dp0"

echo ================================
echo    CosmoGPT - Launching...
echo ================================
echo.

:: Start Backend
echo [1/2] Starting Backend (port 8001)...
start "CosmoGPT Backend" cmd /c "cd /d backend && uvicorn app:app --host 127.0.0.1 --port 8001 --reload"
if %errorlevel% neq 0 (
    echo [!] Backend failed to start
    pause
    exit /b 1
)

:: Wait for backend to be ready (poll health endpoint)
echo [1/2] Waiting for backend to be ready...
:poll
timeout /t 1 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 goto poll
echo [1/2] Backend is ready!

:: Start Frontend
echo [2/2] Starting Frontend (port 5173)...
start "CosmoGPT Frontend" cmd /c "cd /d frontend && npm run dev"
if %errorlevel% neq 0 (
    echo [!] Frontend failed to start
    pause
    exit /b 1
)

echo.
echo ================================
echo    Both services are starting.
echo    Backend:  http://127.0.0.1:8001
echo    Frontend: http://127.0.0.1:5173
echo ================================
echo.
echo Close this window to stop both services.
echo To stop individually, close each service window.
echo.
pause
