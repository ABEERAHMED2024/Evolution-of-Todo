# Kubernetes API Contracts for Evolution of Todo

## Deployment Resources

### Backend Deployment
- **Resource Type**: Deployment
- **API Version**: apps/v1
- **Purpose**: Runs the FastAPI backend service
- **Replicas**: Configurable via Helm values
- **Environment Variables**: Database connection, API keys
- **Health Checks**: Liveness and readiness probes on /health endpoint

### Frontend Deployment
- **Resource Type**: Deployment
- **API Version**: apps/v1
- **Purpose**: Runs the Next.js frontend service
- **Replicas**: Configurable via Helm values
- **Environment Variables**: API endpoints, configuration
- **Health Checks**: Liveness and readiness probes on /health endpoint

### Agent Deployment
- **Resource Type**: Deployment
- **API Version**: apps/v1
- **Purpose**: Runs the AI agent service
- **Replicas**: Configurable via Helm values
- **Environment Variables**: OpenAI API key, backend endpoint
- **Health Checks**: Liveness and readiness probes on /health endpoint

## Service Resources

### Backend Service
- **Resource Type**: Service
- **API Version**: v1
- **Type**: ClusterIP
- **Ports**: 8000 (backend API)
- **Selector**: app=evolution-of-todo-backend

### Frontend Service
- **Resource Type**: Service
- **API Version**: v1
- **Type**: ClusterIP or LoadBalancer
- **Ports**: 3000 (frontend UI)
- **Selector**: app=evolution-of-todo-frontend

### Agent Service
- **Resource Type**: Service
- **API Version**: v1
- **Type**: ClusterIP
- **Ports**: 8001 (agent API)
- **Selector**: app=evolution-of-todo-agent

## Persistent Storage

### Database PersistentVolumeClaim
- **Resource Type**: PersistentVolumeClaim
- **API Version**: v1
- **Storage Class**: Standard or hostPath for local
- **Size**: Configurable via Helm values
- **Access Mode**: ReadWriteOnce
- **Purpose**: Persistent storage for the database

## Network Configuration

### Ingress
- **Resource Type**: Ingress
- **API Version**: networking.k8s.io/v1
- **Rules**: Route traffic to frontend service
- **TLS**: Configurable via Helm values

### Network Policies
- **Resource Type**: NetworkPolicy
- **API Version**: networking.k8s.io/v1
- **Purpose**: Control traffic between services
- **Rules**: Allow traffic between related services, restrict external access

## Security Configuration

### RBAC Resources
- **Resources**: Roles, RoleBindings, ServiceAccounts
- **API Version**: rbac.authorization.k8s.io/v1
- **Purpose**: Define permissions for services
- **Rules**: Principle of least privilege

## Monitoring Configuration

### ServiceMonitors
- **Resource Type**: ServiceMonitor (Prometheus Operator)
- **API Version**: monitoring.coreos.com/v1
- **Purpose**: Configure Prometheus to scrape metrics
- **Endpoints**: Metrics endpoints on each service