@echo off
setlocal enabledelayedexpansion

REM Evolution of Todo - Docker Startup Script (Windows)
REM This script helps you get the Todo application running with Docker on Windows

echo 🚀 Evolution of Todo - Docker Setup
echo ====================================

REM Check if Docker is installed and running
echo [INFO] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is installed and running

REM Create environment file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from template...
    (
        echo # Evolution of Todo - Environment Variables
        echo.
        echo # OpenAI Configuration ^(Optional - for AI features^)
        echo # Get your API key from: https://platform.openai.com/api-keys
        echo OPENAI_API_KEY=
        echo.
        echo # Backend Configuration
        echo BACKEND_URL=http://localhost:8000
        echo BACKEND_HOST=0.0.0.0
        echo BACKEND_PORT=8000
        echo.
        echo # Agent Configuration
        echo AGENT_HOST=0.0.0.0
        echo AGENT_PORT=8001
        echo.
        echo # Frontend Configuration ^(if using^)
        echo FRONTEND_HOST=0.0.0.0
        echo FRONTEND_PORT=3000
        echo REACT_APP_BACKEND_URL=http://localhost:8000
        echo REACT_APP_AGENT_URL=http://localhost:8001
        echo.
        echo # Database Configuration ^(for production^)
        echo DATABASE_URL=sqlite:///./data/todo.db
        echo.
        echo # Application Environment
        echo NODE_ENV=production
        echo PYTHONUNBUFFERED=1
        echo LOG_LEVEL=info
    ) > .env
    echo [SUCCESS] Created .env file
    echo [WARNING] Please edit .env file and add your OpenAI API key if you want AI features
) else (
    echo [SUCCESS] Environment file already exists
)

REM Handle command line arguments
set COMMAND=%1
set OPTION=%2

if "%COMMAND%"=="start" goto start
if "%COMMAND%"=="stop" goto stop
if "%COMMAND%"=="restart" goto restart
if "%COMMAND%"=="logs" goto logs
if "%COMMAND%"=="status" goto status
if "%COMMAND%"=="clean" goto clean
if "%COMMAND%"=="help" goto help
if "%COMMAND%"=="" goto help

echo [ERROR] Unknown command: %COMMAND%
goto help

:start
echo [INFO] Setting up environment variables...

if "%OPTION%"=="full" (
    set PROFILE=--profile full-stack
    echo [INFO] Starting full stack ^(backend + agent + frontend^)...
) else (
    set PROFILE=
    echo [INFO] Starting core services ^(backend + agent^)...
)

echo [INFO] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build images
    pause
    exit /b 1
)

echo [INFO] Starting services...
docker-compose up -d !PROFILE!
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [INFO] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service health
echo [INFO] Checking service health...

curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] ✅ Backend service is healthy ^(http://localhost:8000^)
) else (
    echo [WARNING] ⚠️  Backend service might not be ready yet
)

curl -f http://localhost:8001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] ✅ Agent service is healthy ^(http://localhost:8001^)
) else (
    echo [WARNING] ⚠️  Agent service might not be ready yet
)

if "%OPTION%"=="full" (
    curl -f http://localhost:3000 >nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] ✅ Frontend service is healthy ^(http://localhost:3000^)
    )
)

echo.
echo 🌐 Service URLs:
echo ==================
echo 📚 Backend API:    http://localhost:8000
echo 🤖 AI Agent API:   http://localhost:8001
echo 📊 API Docs:       http://localhost:8000/docs ^(if using Python backend^)
if "%OPTION%"=="full" (
    echo 🌍 Frontend Web:   http://localhost:3000
)
echo.
echo 🔧 Quick Tests:
echo ================
echo curl http://localhost:8000/health
echo curl http://localhost:8001/health
echo curl -X POST http://localhost:8000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Test Task\"}"
echo.

echo [SUCCESS] Evolution of Todo is now running! 🎉
pause
exit /b 0

:stop
echo [INFO] Stopping all services...
docker-compose down
echo [SUCCESS] All services stopped
pause
exit /b 0

:restart
echo [INFO] Restarting services...
docker-compose down
docker-compose up -d
echo [SUCCESS] Services restarted
pause
exit /b 0

:logs
docker-compose logs -f
pause
exit /b 0

:status
echo [INFO] Service status:
docker-compose ps
echo.
echo [INFO] Checking service health...

curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] ✅ Backend service is healthy ^(http://localhost:8000^)
) else (
    echo [WARNING] ⚠️  Backend service might not be ready yet
)

curl -f http://localhost:8001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] ✅ Agent service is healthy ^(http://localhost:8001^)
) else (
    echo [WARNING] ⚠️  Agent service might not be ready yet
)

pause
exit /b 0

:clean
echo [WARNING] This will stop all services and remove containers and images
set /p CONFIRM="Are you sure? (y/N): "
if /i "!CONFIRM!"=="y" (
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    echo [SUCCESS] Cleanup completed
) else (
    echo [INFO] Cleanup cancelled
)
pause
exit /b 0

:help
echo Usage: %0 [command] [options]
echo.
echo Commands:
echo   start          Start core services ^(backend + agent^)
echo   start full     Start all services including frontend
echo   stop           Stop all services
echo   restart        Restart all services
echo   logs           Show service logs
echo   status         Check service status
echo   clean          Stop services and remove containers/images
echo   help           Show this help message
echo.
echo Examples:
echo   %0 start       # Start backend and agent only
echo   %0 start full  # Start all services
echo   %0 logs        # View logs
echo   %0 stop        # Stop all services
echo.
pause
exit /b 0
