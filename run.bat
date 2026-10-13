@echo off
setlocal
title Orivanta PIM — Production-Grade Product Information Management

echo ===============================================================================
echo   ORIVANTA PIM — PRODUCT INFORMATION MANAGEMENT PLATFORM
echo   Integrated with WooCommerce and Gemini-Powered Agentic AI
echo ===============================================================================
echo.

REM 1. Check if node_modules exist, install if missing
if not exist "node_modules\" (
    echo [Step 1/3] Installing dependencies across workspaces...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo [Step 1/3] Dependencies verified.
)

REM 2. Ensure local database schema is migrated
echo [Step 2/3] Checking SQLite database migrations and schema...
call npm run db:migrate --workspace=backend
if errorlevel 1 (
    echo [ERROR] Database migration failed.
    pause
    exit /b 1
)

REM 3. Launch Backend API and Frontend Dev Server
echo [Step 3/3] Starting Orivanta PIM Services...
echo.
echo   -------------------------------------------------------------------------
echo   - Backend API:       http://localhost:5000/api
echo   - Frontend UI:       http://localhost:3000
echo   - Database:          Local SQLite (./data/orivanta.sqlite)
echo   - Integration Mode:  Configured via .env (Live WooCommerce / Mock)
echo   - Demo Admin Login:  demo@orivanta.local / OrivantaDemo2026!
echo   -------------------------------------------------------------------------
echo.

REM Launch backend in a separate terminal window
start "Orivanta PIM — Backend API (Port 5000)" cmd /k "npm run dev --workspace=backend"

REM Launch frontend in the current or dedicated terminal window
start "Orivanta PIM — Frontend UI (Port 3000)" cmd /k "npm run dev --workspace=frontend"

echo Services launched! You can access the platform at:
echo http://localhost:3000
echo.
echo Press any key to exit this launcher window...
pause >nul
