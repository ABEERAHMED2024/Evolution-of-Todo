@echo off
REM Docker Health Check Script for Windows

echo 🏥 Evolution of Todo - Health Check
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Check if services are running
echo 📊 Service Status:
echo.
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo.

REM Test backend health
echo 🔍 Testing Backend (http://localhost:8000)...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ⚠️ Backend is not responding
)

REM Test agent health
echo 🔍 Testing Agent (http://localhost:8001)...
curl -s http://localhost:8001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Agent is healthy
) else (
    echo ⚠️ Agent is not responding
)

REM Test frontend
echo 🔍 Testing Frontend (http://localhost:3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
) else (
    echo ⚠️ Frontend is not responding
)

echo.
echo 📍 Service URLs:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    Agent:     http://localhost:8001
echo.
