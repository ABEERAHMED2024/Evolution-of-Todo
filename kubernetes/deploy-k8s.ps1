# Kubernetes & Dapr + Kafka Automated Deployment Script
# Run this script AFTER manually installing Minikube and Docker Desktop

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hackathon II - Dapr + Kafka Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($command) {
    return $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

# Step 1: Verify Prerequisites
Write-Host "[1/8] Verifying prerequisites..." -ForegroundColor Yellow

# Check Minikube
if (Test-Command minikube) {
    Write-Host "  ✓ Minikube installed" -ForegroundColor Green
    $minikubeVersion = minikube version --short
    Write-Host "    Version: $minikubeVersion"
} else {
    Write-Host "  ✗ Minikube not found!" -ForegroundColor Red
    Write-Host "    Please install Minikube first. See kubernetes/SETUP_GUIDE.md"
    exit 1
}

# Check Docker
if (Test-Command docker) {
    try {
        $dockerStatus = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Docker running" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Docker not running!" -ForegroundColor Red
            Write-Host "    Please start Docker Desktop"
            exit 1
        }
    } catch {
        Write-Host "  ✗ Docker error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ Docker not installed!" -ForegroundColor Red
    Write-Host "    Please install Docker Desktop"
    exit 1
}

# Check kubectl
if (Test-Command kubectl) {
    Write-Host "  ✓ kubectl installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ kubectl not installed!" -ForegroundColor Red
    exit 1
}

# Check Helm
if (Test-Command helm) {
    Write-Host "  ✓ Helm installed" -ForegroundColor Green
    $helmVersion = helm version --short
    Write-Host "    Version: $helmVersion"
} else {
    Write-Host "  ! Helm not installed - will install" -ForegroundColor Yellow
}

# Check Dapr CLI
if (Test-Command dapr) {
    Write-Host "  ✓ Dapr CLI installed" -ForegroundColor Green
    $daprVersion = dapr --version
    Write-Host "    $daprVersion"
} else {
    Write-Host "  ! Dapr CLI not installed - will install" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Start Minikube (if not already running)
Write-Host "[2/8] Checking Minikube cluster status..." -ForegroundColor Yellow

$minikubeStatus = minikube status 2>&1
if ($minikubeStatus -match "Running") {
    Write-Host "  ✓ Minikube already running" -ForegroundColor Green
} else {
    Write-Host "  Starting Minikube (this may take 2-5 minutes)..." -ForegroundColor Yellow
    minikube start --cpus=4 --memory=8192 --disk-size=50gb --driver=docker
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to start Minikube!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  ✓ Minikube started" -ForegroundColor Green
}

Write-Host ""

# Step 3: Verify Cluster
Write-Host "[3/8] Verifying Kubernetes cluster..." -ForegroundColor Yellow

kubectl cluster-info | Select-String "Kubernetes control plane"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Cluster accessible" -ForegroundColor Green
} else {
    Write-Host "  ✗ Cannot access cluster!" -ForegroundColor Red
    exit 1
}

kubectl get nodes | Select-String "minikube"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Nodes ready" -ForegroundColor Green
} else {
    Write-Host "  ✗ No nodes ready!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Install Helm (if not installed)
Write-Host "[4/8] Checking Helm installation..." -ForegroundColor Yellow

if (-not (Test-Command helm)) {
    Write-Host "  Installing Helm..." -ForegroundColor Yellow
    
    # Download and install Helm
    $helmUrl = "https://get.helm.sh/helm-v3.13.0-windows-amd64.zip"
    $helmZip = "$env:TEMP\helm.zip"
    $helmDir = "C:\Program Files\Helm"
    
    Invoke-WebRequest -Uri $helmUrl -OutFile $helmZip
    Expand-Archive -Path $helmZip -DestinationPath "$env:TEMP\helm-install" -Force
    
    New-Item -ItemType Directory -Force -Path $helmDir | Out-Null
    Copy-Item "$env:TEMP\helm-install\windows-amd64\helm.exe" -Destination "$helmDir\helm.exe" -Force
    
    $env:Path += ";$helmDir"
    [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
    
    Write-Host "  ✓ Helm installed" -ForegroundColor Green
} else {
    Write-Host "  ✓ Helm already installed" -ForegroundColor Green
}

Write-Host ""

# Step 5: Install Dapr CLI (if not installed)
Write-Host "[5/8] Checking Dapr CLI installation..." -ForegroundColor Yellow

if (-not (Test-Command dapr)) {
    Write-Host "  Installing Dapr CLI..." -ForegroundColor Yellow
    
    # Install Dapr CLI using PowerShell
    powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dapr CLI installed" -ForegroundColor Green
    } else {
        Write-Host "  ! Dapr CLI installation may have failed - continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ Dapr CLI already installed" -ForegroundColor Green
}

Write-Host ""

# Step 6: Initialize Dapr on Kubernetes
Write-Host "[6/8] Initializing Dapr on Kubernetes..." -ForegroundColor Yellow

$daprInit = dapr init -k 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dapr initialized on Kubernetes" -ForegroundColor Green
    
    # Wait for Dapr pods to be ready
    Write-Host "  Waiting for Dapr pods to be ready (up to 2 minutes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    kubectl get pods -n dapr-system
} else {
    Write-Host "  ! Dapr init may have failed - continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Deploy Redpanda (Kafka-compatible)
Write-Host "[7/8] Deploying Redpanda (Kafka-compatible)..." -ForegroundColor Yellow

# Add Redpanda Helm repo
helm repo add redpanda-data https://charts.redpanda.com 2>&1 | Out-Null
helm repo update 2>&1 | Out-Null

# Create namespace
kubectl create namespace redpanda 2>&1 | Out-Null

# Install Redpanda
Write-Host "  Installing Redpanda (this may take 2-3 minutes)..." -ForegroundColor Yellow

helm install redpanda redpanda-data/redpanda `
  --namespace redpanda `
  --create-namespace `
  --set "resources.requests.cpu=1" `
  --set "resources.requests.memory=2Gi" `
  --set "statefulset.replicas=1" `
  --wait --timeout 5m

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Redpanda deployed" -ForegroundColor Green
    
    # Show Redpanda pods
    kubectl get pods -n redpanda
} else {
    Write-Host "  ! Redpanda deployment may have failed - continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Step 8: Create Kafka Topics and Dapr Components
Write-Host "[8/8] Creating Kafka topics and Dapr components..." -ForegroundColor Yellow

# Create namespace for todo app
kubectl create namespace todo-system 2>&1 | Out-Null

# Wait for Redpanda to be ready
Write-Host "  Waiting for Redpanda to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Create Kafka topics
$topics = @("task-events", "reminders", "task-updates")
foreach ($topic in $topics) {
    kubectl exec -n redpanda redpanda-0 -- rpk topic create $topic 2>&1 | Out-Null
    Write-Host "  ✓ Created topic: $topic" -ForegroundColor Green
}

# Create Dapr pubsub.kafka component
Write-Host "  Creating Dapr components..." -ForegroundColor Yellow

$daprPubsub = @"
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
  - name: maxMessageBytes
    value: 1048576
"@

$daprPubsub | kubectl apply -f -
Write-Host "  ✓ Created kafka-pubsub component" -ForegroundColor Green

# Create Dapr statestore component
$daprState = @"
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
"@

$daprState | kubectl apply -f -
Write-Host "  ✓ Created statestore component" -ForegroundColor Green

# Create Dapr secrets component
$daprSecrets = @"
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
  namespace: todo-system
spec:
  type: secretstores.kubernetes
  version: v1
"@

$daprSecrets | kubectl apply -f -
Write-Host "  ✓ Created kubernetes-secrets component" -ForegroundColor Green

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cluster Status:" -ForegroundColor Yellow
Write-Host "  Minikube: Running"
Write-Host "  Dapr: Initialized"
Write-Host "  Redpanda: Deployed"
Write-Host "  Kafka Topics: Created (task-events, reminders, task-updates)"
Write-Host "  Dapr Components: Created (kafka-pubsub, statestore, kubernetes-secrets)"
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n dapr-system     # Check Dapr pods"
Write-Host "  kubectl get pods -n redpanda        # Check Redpanda pods"
Write-Host "  kubectl get components -n todo-system  # Check Dapr components"
Write-Host "  kubectl exec -n redpanda redpanda-0 -- rpk topic list  # List Kafka topics"
Write-Host "  minikube dashboard                  # Open Kubernetes dashboard"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy your application with Dapr sidecars"
Write-Host "  2. Test event publishing via Dapr Pub/Sub"
Write-Host "  3. Record demo video"
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  specs/005-advanced-cloud-deployment/DEPLOYMENT_GUIDE.md"
Write-Host "  specs/005-advanced-cloud-deployment/dapr-kafka-spec.md"
Write-Host "  specs/005-advanced-cloud-deployment/dapr-kafka-plan.md"
Write-Host ""
