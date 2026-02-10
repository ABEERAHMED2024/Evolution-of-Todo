@echo off
REM Evolution of Todo - Quick Start Script for Windows

echo 🚀 Evolution of Todo - Docker Setup
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

echo ✅ Docker is installed
echo.

REM Parse arguments
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

if /I "%ENVIRONMENT%"=="dev" goto dev
if /I "%ENVIRONMENT%"=="development" goto dev
if /I "%ENVIRONMENT%"=="prod" goto prod
if /I "%ENVIRONMENT%"=="production" goto prod

echo Usage: docker-start.bat [dev^|prod]
echo.
echo Examples:
echo   docker-start.bat dev   # Start in development mode
echo   docker-start.bat prod  # Start in production mode
exit /b 1

:dev
echo 🔧 Starting in DEVELOPMENT mode...
docker compose -f docker-compose.dev.yml up --build
goto end

:prod
echo 🚀 Starting in PRODUCTION mode...
docker compose up -d --build
echo.
echo ✅ Services are starting...
echo.
echo 📍 Access your services:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    Agent:     http://localhost:8001
echo.
echo 📊 View logs: docker compose logs -f
echo 🛑 Stop services: docker compose down
goto end

:end
