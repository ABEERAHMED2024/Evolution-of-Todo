# Complete Deployment Script - Run this after Minikube download completes
# Open PowerShell as Administrator and run: .\deploy-everything.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hackathon II - Complete Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$minikubeDir = "$env:USERPROFILE\minikube"
$minikubeExe = "$minikubeDir\minikube.exe"

# Step 1: Verify Minikube
Write-Host "[1/6] Verifying Minikube installation..." -ForegroundColor Yellow
if (-not (Test-Path $minikubeExe)) {
    Write-Host "  ERROR: Minikube not found at $minikubeExe" -ForegroundColor Red
    Write-Host "  Please wait for download to complete" -ForegroundColor Yellow
    exit 1
}

try {
    & $minikubeExe version --short | Out-Null
    Write-Host "  ✓ Minikube verified" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Minikube executable may be corrupted" -ForegroundColor Red
    Write-Host "  Re-downloading..." -ForegroundColor Yellow
    Remove-Item $minikubeExe -Force
    Invoke-WebRequest -Uri "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe" -OutFile $minikubeExe
}

# Step 2: Start Minikube
Write-Host ""
Write-Host "[2/6] Starting Minikube cluster (this takes 3-5 minutes)..." -ForegroundColor Yellow
try {
    & $minikubeExe start --cpus=4 --memory=8192 --disk-size=50gb --driver=docker
    Write-Host "  ✓ Minikube started" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to start Minikube: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Verify Cluster
Write-Host ""
Write-Host "[3/6] Verifying Kubernetes cluster..." -ForegroundColor Yellow
kubectl cluster-info | Select-String "Kubernetes control plane"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Cluster accessible" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Cannot access cluster" -ForegroundColor Red
    exit 1
}

kubectl get nodes
Write-Host "  ✓ Nodes ready" -ForegroundColor Green

# Step 4: Install Helm
Write-Host ""
Write-Host "[4/6] Checking Helm installation..." -ForegroundColor Yellow
if (Get-Command helm -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ Helm already installed" -ForegroundColor Green
} else {
    Write-Host "  Installing Helm..." -ForegroundColor Yellow
    $helmUrl = "https://get.helm.sh/helm-v3.13.0-windows-amd64.zip"
    $helmZip = "$env:TEMP\helm.zip"
    $helmDir = "$env:USERPROFILE\helm"
    
    Invoke-WebRequest -Uri $helmUrl -OutFile $helmZip
    Expand-Archive -Path $helmZip -DestinationPath "$env:TEMP\helm-install" -Force
    
    New-Item -ItemType Directory -Force -Path $helmDir | Out-Null
    Copy-Item "$env:TEMP\helm-install\windows-amd64\helm.exe" -Destination "$helmDir\helm.exe" -Force
    
    $env:Path += ";$helmDir"
    [Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
    
    Write-Host "  ✓ Helm installed" -ForegroundColor Green
}

# Step 5: Install Dapr CLI
Write-Host ""
Write-Host "[5/6] Checking Dapr CLI installation..." -ForegroundColor Yellow
if (Get-Command dapr -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ Dapr CLI already installed" -ForegroundColor Green
} else {
    Write-Host "  Installing Dapr CLI..." -ForegroundColor Yellow
    powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install.ps1 | iex"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dapr CLI installed" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Dapr CLI installation may have failed" -ForegroundColor Yellow
    }
}

# Step 6: Deploy Dapr + Kafka
Write-Host ""
Write-Host "[6/6] Deploying Dapr + Kafka..." -ForegroundColor Yellow
Write-Host "  This will take 10-15 minutes..." -ForegroundColor Yellow

# Initialize Dapr
Write-Host "  Initializing Dapr on Kubernetes..." -ForegroundColor Yellow
dapr init -k

# Wait for Dapr pods
Start-Sleep -Seconds 30
kubectl get pods -n dapr-system

# Add Redpanda repo
helm repo add redpanda-data https://charts.redpanda.com
helm repo update

# Create namespace
kubectl create namespace redpanda

# Deploy Redpanda
Write-Host "  Deploying Redpanda (Kafka-compatible)..." -ForegroundColor Yellow
helm install redpanda redpanda-data/redpanda `
  --namespace redpanda `
  --create-namespace `
  --set "resources.requests.cpu=1" `
  --set "resources.requests.memory=2Gi" `
  --set "statefulset.replicas=1" `
  --wait --timeout 5m

# Wait for Redpanda
Start-Sleep -Seconds 10

# Create Kafka topics
Write-Host "  Creating Kafka topics..." -ForegroundColor Yellow
$topics = @("task-events", "reminders", "task-updates")
foreach ($topic in $topics) {
    kubectl exec -n redpanda redpanda-0 -- rpk topic create $topic
    Write-Host "    ✓ Created topic: $topic" -ForegroundColor Green
}

# Create todo-system namespace
kubectl create namespace todo-system

# Create Dapr components
Write-Host "  Creating Dapr components..." -ForegroundColor Yellow

# kafka-pubsub
@"
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: todo-system
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "redpanda-0.redpanda.redpanda.svc.cluster.local:9092"
  - name: consumerGroup
    value: "todo-services"
  - name: authType
    value: "none"
"@ | kubectl apply -f -
Write-Host "    ✓ Created kafka-pubsub" -ForegroundColor Green

# statestore
@"
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-system
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    value: "postgresql://localhost:5432/todo"
"@ | kubectl apply -f -
Write-Host "    ✓ Created statestore" -ForegroundColor Green

# kubernetes-secrets
@"
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
  namespace: todo-system
spec:
  type: secretstores.kubernetes
  version: v1
"@ | kubectl apply -f -
Write-Host "    ✓ Created kubernetes-secrets" -ForegroundColor Green

# Final Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification Commands:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n dapr-system" -ForegroundColor White
Write-Host "  kubectl get pods -n redpanda" -ForegroundColor White
Write-Host "  kubectl get components -n todo-system" -ForegroundColor White
Write-Host "  kubectl exec -n redpanda redpanda-0 -- rpk topic list" -ForegroundColor White
Write-Host "  minikube dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Next: Record your 90-second demo video!" -ForegroundColor Cyan
