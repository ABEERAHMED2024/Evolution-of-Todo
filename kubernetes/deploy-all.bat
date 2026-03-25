@echo off
REM =========================================
REM Hackathon II - Full Deployment Script
REM =========================================
REM This script will:
REM 1. Check if Docker Desktop is running
REM 2. Install Minikube
REM 3. Start Minikube cluster
REM 4. Deploy Dapr + Kafka

echo ========================================
echo Hackathon II - Dapr + Kafka Deployment
echo ========================================
echo.

REM Step 1: Check Docker
echo [1/5] Checking Docker Desktop...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop first:
    echo 1. Press Windows Key
    echo 2. Search for "Docker Desktop"
    echo 3. Open Docker Desktop
    echo 4. Wait for whale icon to be steady (not animated)
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)
echo   ✓ Docker Desktop is running
echo.

REM Step 2: Check/Install Minikube
echo [2/5] Checking Minikube...
where minikube >nul 2>&1
if %errorlevel% neq 0 (
    echo   Installing Minikube...
    
    REM Create directory
    if not exist "C:\Program Files\Minikube" mkdir "C:\Program Files\Minikube"
    
    REM Download Minikube
    echo   Downloading Minikube (this may take 2-3 minutes)...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe' -OutFile 'C:\Program Files\Minikube\minikube.exe'"
    
    REM Add to PATH (temporary for this session)
    set "PATH=%PATH%;C:\Program Files\Minikube"
    
    echo   ✓ Minikube installed
) else (
    echo   ✓ Minikube already installed
)
echo.

REM Step 3: Check Minikube status
echo [3/5] Checking Minikube cluster status...
minikube status | findstr "Running" >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Minikube already running
) else (
    echo   Starting Minikube cluster (this may take 3-5 minutes)...
    echo   This will download Kubernetes components...
    minikube start --cpus=4 --memory=8192 --disk-size=50gb --driver=docker
    
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to start Minikube!
        echo Please check Docker Desktop is running properly.
        pause
        exit /b 1
    )
    echo   ✓ Minikube started
)
echo.

REM Step 4: Verify cluster
echo [4/5] Verifying Kubernetes cluster...
kubectl cluster-info | findstr "Kubernetes control plane" >nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: Cannot access Kubernetes cluster!
    pause
    exit /b 1
)
echo   ✓ Cluster accessible

kubectl get nodes | findstr "minikube" >nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: No nodes ready!
    pause
    exit /b 1
)
echo   ✓ Nodes ready
echo.

REM Step 5: Run PowerShell deployment script
echo [5/5] Running Dapr + Kafka deployment...
echo   This will take 10-15 minutes...
echo.

powershell -ExecutionPolicy Bypass -File "kubernetes\deploy-k8s.ps1"

if %errorlevel% neq 0 (
    echo.
    echo WARNING: Deployment script encountered issues.
    echo Check the output above for details.
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Verify pods: kubectl get pods -n dapr-system
echo 2. Verify pods: kubectl get pods -n redpanda
echo 3. List topics: kubectl exec -n redpanda redpanda-0 -- rpk topic list
echo 4. Open dashboard: minikube dashboard
echo.
echo Record your 90-second demo video and submit!
echo.

pause
