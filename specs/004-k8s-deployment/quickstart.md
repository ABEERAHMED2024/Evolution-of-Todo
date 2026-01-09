# Quickstart Guide: Phase IV Local Kubernetes Deployment

## Prerequisites
- Docker installed and running
- Minikube installed and configured
- kubectl installed
- Helm installed
- kubectl-ai plugin (optional, for AI operations)

## Setup Instructions

### 1. Start Minikube
```bash
minikube start
```

### 2. Build Docker Images
```bash
# Build backend image
docker build -f docker/backend.Dockerfile -t evolution-of-todo-backend:latest .

# Build frontend image
docker build -f docker/frontend.Dockerfile -t evolution-of-todo-frontend:latest .

# Build agent image
docker build -f docker/agent.Dockerfile -t evolution-of-todo-agent:latest .
```

### 3. Load Images into Minikube
```bash
# Set Docker environment to Minikube
eval $(minikube docker-env)

# Rebuild images in Minikube context
docker build -f docker/backend.Dockerfile -t evolution-of-todo-backend:latest .
docker build -f docker/frontend.Dockerfile -t evolution-of-todo-frontend:latest .
docker build -f docker/agent.Dockerfile -t evolution-of-todo-agent:latest .
```

### 4. Deploy with Helm
```bash
cd helm
helm install evolution-of-todo -f values-dev.yaml .
```

### 5. Access the Application
```bash
# Get the frontend URL
minikube service evolution-of-todo-frontend --url

# Or enable ingress and access via configured hostname
minikube addons enable ingress
```

## AI Operations (Optional)
```bash
# Scale the frontend using kubectl-ai
kubectl ai scale deployment evolution-of-todo-frontend --replicas=3

# Check service health with AI assistance
kubectl ai get pods --selector=app=evolution-of-todo-frontend
```

## Monitoring and Observability
```bash
# Install Prometheus/Grafana stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# Access Grafana dashboard
minikube service prometheus-grafana
```

## Troubleshooting
- If images don't load properly: Run `minikube cache reload`
- If services don't start: Check resource limits with `kubectl describe pod <pod-name>`
- If ingress doesn't work: Verify addon is enabled with `minikube addons list | grep ingress`
- If security policies block access: Check RBAC and NetworkPolicy configurations