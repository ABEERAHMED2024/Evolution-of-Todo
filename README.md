# Evolution of Todo - Phase IV: Local Kubernetes Deployment

This document describes the containerization and orchestration of the Evolution of Todo application using Docker, Kubernetes (Minikube), and Helm Charts.

## Architecture Overview

The application consists of three main services:

1. **Backend**: FastAPI application serving the API
2. **Frontend**: Next.js application serving the UI
3. **Agent**: AI agent service for conversational interactions
4. **Database**: PostgreSQL for persistent storage

## Prerequisites

- Docker installed and running
- Minikube installed and configured
- kubectl installed
- Helm installed
- kubectl-ai plugin (optional, for AI operations)

## Deployment Steps

### 1. Start Minikube

```bash
minikube start
```

### 2. Build Docker Images

```bash
# Set Docker environment to Minikube
eval $(minikube docker-env)

# Build all images
docker build -f docker/backend.Dockerfile -t evolution-of-todo-backend:latest .
docker build -f docker/frontend.Dockerfile -t evolution-of-todo-frontend:latest .
docker build -f docker/agent.Dockerfile -t evolution-of-todo-agent:latest .
```

### 3. Deploy with Helm

```bash
# Install/upgrade the application using development values
helm upgrade --install evolution-of-todo ./helm -f ./helm/values-dev.yaml
```

### 4. Access the Application

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

## Configuration

The application can be configured using Helm values files:

- `values.yaml`: Default values
- `values-dev.yaml`: Development-specific overrides

Key configurable parameters include:

- Replica counts for each service
- Resource limits and requests
- Image repositories and tags
- Service types and ports
- Database configuration

## Persistent Storage

The application uses PersistentVolumeClaims for database storage. In the development configuration, persistence is disabled to simplify local development. For production deployments, persistence should be enabled.

## Security

The deployment implements:

- RBAC (Role-Based Access Control) for service permissions
- Network policies to control traffic between services
- Security contexts for containers and pods
- Secrets for sensitive configuration

## Monitoring and Observability

The application includes health checks and readiness probes. For full monitoring capabilities, Prometheus and Grafana can be enabled in the values file.

## Troubleshooting

- If images don't load properly: Run `minikube cache reload`
- If services don't start: Check resource limits with `kubectl describe pod <pod-name>`
- If ingress doesn't work: Verify addon is enabled with `minikube addons list | grep ingress`
- If security policies block access: Check RBAC and NetworkPolicy configurations

## Scaling

Horizontal Pod Autoscaling can be enabled by setting `autoscaling.enabled=true` in the values file for each service. Configure the minimum and maximum replica counts and target CPU/memory utilization percentages as needed.
