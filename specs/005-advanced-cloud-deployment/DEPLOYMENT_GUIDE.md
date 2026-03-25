# Dapr + Kafka Deployment Guide

**Phase V: Event-Driven Architecture with Dapr and Redpanda**

This guide provides step-by-step instructions for deploying Dapr and Kafka (Redpanda) to Kubernetes.

---

## Prerequisites

### Required Tools

1. **Docker Desktop** (with Kubernetes enabled) OR **Minikube**
2. **kubectl** - Kubernetes CLI
3. **Helm v3+** - Package manager for Kubernetes
4. **Dapr CLI** - For Dapr management

### Installation Commands

#### Windows (PowerShell as Administrator)

```powershell
# Install Helm
choco install kubernetes-helm

# Install Dapr CLI
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"

# Verify installations
helm version
dapr --version
kubectl version --client
```

#### Alternative: Download Directly

**Helm:**
```powershell
# Download Helm v3.13.0
Invoke-WebRequest -Uri "https://get.helm.sh/helm-v3.13.0-windows-amd64.zip" -OutFile "helm.zip"
Expand-Archive helm.zip -DestinationPath .\helm-install
Move-Item .\helm-install\windows-amd64\helm.exe C:\Program Files\Helm\
```

**Dapr CLI:**
```powershell
# Install Dapr CLI
Invoke-Expression -Command (Invoke-WebRequest -UseBasicParsing -Uri https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1).Content
```

---

## Step 1: Start Kubernetes Cluster

### Option A: Docker Desktop Kubernetes

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Enable Kubernetes
4. Click "Apply & Restart"
5. Verify: `kubectl cluster-info`

### Option B: Minikube

```powershell
# Start Minikube (allocate sufficient resources)
minikube start --cpus=4 --memory=8192 --disk-size=50gb

# Verify
kubectl cluster-info
kubectl get nodes
```

---

## Step 2: Install Dapr on Kubernetes

```powershell
# Initialize Dapr on Kubernetes
dapr init -k

# Or using Helm (recommended for production)
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update
helm upgrade --install dapr dapr/dapr `
  --version=1.12.0 `
  --namespace dapr-system `
  --create-namespace `
  --wait

# Verify Dapr installation
kubectl get pods -n dapr-system
helm list -n dapr-system
```

**Expected Output:**
```
NAME: dapr
NAMESPACE: dapr-system
STATUS: deployed
REVISION: 1
```

---

## Step 3: Install Redpanda (Kafka-compatible)

```powershell
# Add Redpanda Helm repository
helm repo add redpanda-data https://charts.redpanda.com
helm repo update

# Create namespace
kubectl create namespace redpanda

# Install Redpanda (single-node for local development)
helm install redpanda redpanda-data/redpanda `
  --namespace redpanda `
  --create-namespace `
  --set "resources.requests.cpu=1" `
  --set "resources.requests.memory=2Gi" `
  --set "statefulset.replicas=1" `
  --wait

# Verify Redpanda installation
kubectl get pods -n redpanda
kubectl get svc -n redpanda
```

**Expected Output:**
```
NAME: redpanda
NAMESPACE: redpanda
STATUS: deployed
```

---

## Step 4: Create Kafka Topics

```powershell
# Get Redpanda broker URL
$BROKER_URL = "redpanda-0.redpanda.redpanda.svc.cluster.local:9092"

# Create topics using kubectl exec
kubectl exec -n redpanda redpanda-0 -- rpk topic create task-events
kubectl exec -n redpanda redpanda-0 -- rpk topic create reminders
kubectl exec -n redpanda redpanda-0 -- rpk topic create task-updates

# Verify topics
kubectl exec -n redpanda redpanda-0 -- rpk topic list
```

**Expected Topics:**
```
task-events
reminders
task-updates
```

---

## Step 5: Create Dapr Components

### 5.1 Create Namespace

```powershell
kubectl create namespace todo-system
```

### 5.2 Create Kubernetes Secrets

```powershell
# Create secrets for database connection
kubectl create secret generic postgres-connection-string `
  --from-literal=value="Server=localhost;Database=todo;User Id=postgres;Password=postgres" `
  -n todo-system

# Create secrets for Redpanda (if using authentication)
# kubectl create secret generic redpanda-credentials `
#   --from-literal=username="user" `
#   --from-literal=password="password" `
#   -n todo-system
```

### 5.3 Apply Dapr Components

```powershell
# Create pubsub.kafka component
kubectl apply -f - <<EOF
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
EOF

# Create state.postgresql component
kubectl apply -f - <<EOF
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
    secretKeyRef:
      name: postgres-connection-string
      key: value
auth:
  secretStore: kubernetes-secrets
EOF

# Create secrets.kubernetes component
kubectl apply -f - <<EOF
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
  namespace: todo-system
spec:
  type: secretstores.kubernetes
  version: v1
EOF

# Verify components
kubectl get components -n todo-system
```

**Expected Components:**
```
NAME            AGE
kafka-pubsub    10s
statestore      10s
kubernetes-secrets  10s
```

---

## Step 6: Deploy Application with Dapr Sidecars

### 6.1 Create Backend Deployment

```yaml
# kubernetes/deployments/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: todo-system
  labels:
    app: backend
    app.dapr.io/type: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "backend-service"
        dapr.io/app-port: "8000"
        dapr.io/log-level: "info"
    spec:
      containers:
      - name: backend
        image: your-registry/todo-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-connection-string
              key: value
```

### 6.2 Deploy

```powershell
kubectl apply -f kubernetes/deployments/backend.yaml

# Verify deployment
kubectl get deployments -n todo-system
kubectl get pods -n todo-system

# Check Dapr sidecar injection
kubectl describe pod backend-xxxx -n todo-system | findstr "dapr"
```

---

## Step 7: Test Event Publishing

### 7.1 Publish Test Event via Dapr

```powershell
# Get a backend pod name
$POD_NAME = kubectl get pods -n todo-system -l app=backend -o jsonpath="{.items[0].metadata.name}"

# Publish test event via Dapr sidecar
kubectl exec -n todo-system $POD_NAME -- curl -X POST `
  http://localhost:3500/v1.0/publish/kafka-pubsub/task-events `
  -H "Content-Type: application/json" `
  -d '{
    "specversion": "1.0",
    "type": "task.created",
    "source": "test",
    "id": "test-123",
    "data": {
      "task_id": 1,
      "title": "Test task"
    }
  }'
```

### 7.2 Verify Event in Redpanda

```powershell
# Consume messages from topic (for testing)
kubectl exec -n redpanda redpanda-0 -- rpk topic consume task-events --from-beginning
```

---

## Step 8: Monitoring and Observability

### Check Dapr Health

```powershell
# Check Dapr sidecar health
kubectl get pods -n todo-system -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.annotations.dapr\.io/health-check}{"\n"}{end}'

# Check Dapr dashboard (if installed)
dapr dashboard -k
```

### Check Redpanda Console

```powershell
# Install Redpanda Console (optional)
helm install console redpanda-data/console `
  --namespace redpanda `
  --set kafka.brokers[0]="redpanda-0.redpanda.redpanda.svc.cluster.local:9092"

# Access console
kubectl port-forward svc/console 8080:80 -n redpanda
# Open http://localhost:8080
```

---

## Troubleshooting

### Issue: Dapr sidecar not injected

**Solution:**
```powershell
# Check annotations
kubectl describe pod backend-xxxx -n todo-system

# Verify Dapr operator is running
kubectl get pods -n dapr-system
```

### Issue: Cannot connect to Redpanda

**Solution:**
```powershell
# Check Redpanda pods
kubectl get pods -n redpanda

# Check service
kubectl get svc -n redpanda

# Test connectivity from backend
kubectl exec -n todo-system backend-xxxx -- nc -zv redpanda-0.redpanda.redpanda.svc.cluster.local 9092
```

### Issue: Component not found

**Solution:**
```powershell
# List components
kubectl get components -n todo-system

# Check component YAML for errors
kubectl apply -f dapr/components/pubsub-kafka.yaml --dry-run=client
```

---

## Cleanup

```powershell
# Remove Dapr
dapr uninstall -k

# Remove Redpanda
helm uninstall redpanda -n redpanda
helm uninstall console -n redpanda

# Remove namespace
kubectl delete namespace todo-system
kubectl delete namespace redpanda
kubectl delete namespace dapr-system
```

---

## Next Steps

1. **Update Application Code**: Integrate Dapr APIs into backend
2. **Deploy Notification Service**: Consume reminder events
3. **Set Up Monitoring**: Install Prometheus + Grafana
4. **Cloud Deployment**: Deploy to DigitalOcean/Azure/GKE

---

## Resources

- **Dapr Docs**: https://docs.dapr.io/
- **Redpanda Docs**: https://docs.redpanda.com/
- **Hackathon II Spec**: `specs/005-advanced-cloud-deployment/dapr-kafka-spec.md`
- **Implementation Plan**: `specs/005-advanced-cloud-deployment/dapr-kafka-plan.md`

---

**Status**: READY FOR DEPLOYMENT  
**Last Updated**: 2026-03-26
