# Deployment Guide

## Overview

This guide provides detailed instructions for deploying the Evolution of Todo application in various environments, from local development to production.

## Prerequisites

Before deploying the application, ensure you have the following tools installed:

- **Kubernetes** (v1.20 or higher)
- **Helm** (v3.0 or higher)
- **kubectl** (matching your Kubernetes version)
- **Dapr CLI** (for local development)
- **Docker** (if building custom images)

## Local Development Deployment

### 1. Set Up Local Kubernetes

Choose one of the following local Kubernetes solutions:

#### Option A: Minikube
```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --disk-size=40g

# Enable ingress addon
minikube addons enable ingress
```

#### Option B: Docker Desktop Kubernetes
Enable Kubernetes in Docker Desktop settings.

#### Option C: Kind (Kubernetes in Docker)
```bash
# Install kind and create cluster
kind create cluster --name todo-cluster --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```

### 2. Install Dapr

```bash
# Install Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr on your Kubernetes cluster
dapr init -k

# Verify Dapr is running
dapr status -k
```

### 3. Deploy Supporting Services

#### Deploy Kafka
```bash
# Add Confluent Helm repository
helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
helm repo update

# Deploy Kafka
helm install kafka confluentinc/cp-helm-charts \
  --set cp-zookeeper.enabled=true \
  --set cp-kafka.enabled=true \
  --set cp-kafka.replicas=1 \
  --set cp-schema-registry.enabled=false \
  --set cp-kafka-rest.enabled=false \
  --set cp-kafka-connect.enabled=false
```

#### Deploy PostgreSQL (Neon DB alternative for local)
```bash
# Deploy PostgreSQL
helm install postgresql oci://registry-1.docker.io/bitnamicharts/postgresql \
  --set auth.postgresPassword=secretpassword \
  --set auth.database=todoapp
```

#### Deploy Redis
```bash
# Deploy Redis
helm install redis oci://registry-1.docker.io/bitnamicharts/redis \
  --set auth.password=secretpassword
```

### 4. Configure Secrets

Create a secret file for your local environment:

```bash
# Create local secrets
kubectl create secret generic todo-secrets \
  --from-literal=neon-db-connection-string="postgresql://postgres:secretpassword@postgresql:5432/todoapp" \
  --from-literal=neon-db-username="postgres" \
  --from-literal=neon-db-password="secretpassword" \
  --from-literal=openai-api-key="your-test-openai-key"
```

### 5. Deploy the Application

```bash
# Deploy using development values
helm install todo-app ./helm -f helm/values-dev.yaml

# Wait for all pods to be ready
kubectl get pods -w
```

### 6. Access the Application

```bash
# Get the external IP of the ingress
minikube tunnel  # In a separate terminal for Minikube

# Or port forward for testing
kubectl port-forward svc/todo-frontend 3000:80
kubectl port-forward svc/todo-backend 8000:80
```

## Production Deployment

### 1. Set Up DigitalOcean Kubernetes

```bash
# Install doctl
curl -fsSL https://repos.insomnia.rest/get-insomnia.sh | bash

# Authenticate with DigitalOcean
doctl auth init

# Create a Kubernetes cluster
doctl kubernetes cluster create todo-prod \
  --region sfo3 \
  --node-pool "name=default;size=s-2vcpu-4gb;count=3" \
  --auto-upgrade
```

### 2. Connect to the Cluster

```bash
# Get credentials for the cluster
doctl kubernetes cluster kubeconfig save todo-prod

# Verify connection
kubectl cluster-info
```

### 3. Install Dapr in Production

```bash
# Install Dapr with production configuration
dapr init -k --runtime-version=1.10.7

# Verify Dapr is running
dapr status -k
```

### 4. Deploy Production Infrastructure

#### Deploy Kafka for Production
```bash
# Deploy Kafka with production settings
helm install kafka confluentinc/cp-helm-charts \
  --namespace kafka \
  --create-namespace \
  --set cp-zookeeper.servers="zookeeper:2181" \
  --set cp-kafka.brokers=3 \
  --set cp-kafka.heapOpts="-Xmx2048m -Xms2048m" \
  --set global.storageClass="do-block-storage"
```

#### Deploy PostgreSQL with Neon DB
```bash
# For production, use Neon DB directly
# Configure connection in secrets below
```

#### Deploy Redis for Production
```bash
# Deploy Redis with persistence
helm install redis oci://registry-1.docker.io/bitnamicharts/redis \
  --namespace redis \
  --create-namespace \
  --set architecture="replication" \
  --set auth.password="production-secure-password" \
  --set master.persistence.storageClass="do-block-storage" \
  --set master.persistence.size="10Gi"
```

### 5. Configure Production Secrets

```bash
# Create production secrets with real credentials
kubectl create secret generic todo-secrets \
  --from-literal=neon-db-connection-string="your-production-neon-db-uri" \
  --from-literal=neon-db-username="your-username" \
  --from-literal=neon-db-password="your-secure-password" \
  --from-literal=openai-api-key="your-production-openai-key" \
  --namespace=default
```

### 6. Deploy Application with Production Values

```bash
# Deploy with production configuration
helm install todo-app ./helm -f helm/values-prod.yaml

# Monitor deployment
kubectl get pods -w
kubectl get svc
```

### 7. Configure DNS and SSL

```bash
# Get the external IP of the load balancer
kubectl get svc todo-frontend

# Point your domain to the IP address
# Configure SSL with cert-manager
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Monitoring and Observability

### Deploy Monitoring Stack

```bash
# Add Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Deploy Prometheus and Grafana
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Access Monitoring Dashboards

```bash
# Port forward to access Grafana
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring

# Username: admin
# Password: prom-operator (default)
```

## Scaling and Performance

### Horizontal Pod Autoscaling

The application is configured for automatic scaling based on CPU and memory usage:

```bash
# Check HPA status
kubectl get hpa

# Describe specific HPA
kubectl describe hpa todo-backend
```

### Event Queue Depth Scaling

For Kafka-based scaling:

```bash
# Check Kafka topic lag
kubectl exec -it $(kubectl get pods -l app=kafka -o jsonpath='{.items[0].metadata.name}') -- kafka-run-class kafka.tools.GetOffsetShell --broker-list localhost:9092 --topic dapr-pubsub-topic
```

## Backup and Recovery

### Database Backups

```bash
# Create a backup job
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: postgres-backup
spec:
  template:
    spec:
      containers:
      - name: backup
        image: postgres:13
        command: ['sh', '-c', 'pg_dump -h postgresql -U postgres -d todoapp > /backup/backup-\$(date +%Y%m%d-%H%M%S).sql']
        env:
        - name: PGPASSWORD
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: neon-db-password
        volumeMounts:
        - name: backup-storage
          mountPath: /backup
      volumes:
      - name: backup-storage
        persistentVolumeClaim:
          claimName: backup-pvc
      restartPolicy: Never
  backoffLimit: 4
EOF
```

## Troubleshooting

### Common Issues

1. **Pods stuck in Pending state**:
   ```bash
   kubectl describe pods
   # Check resource quotas and node resources
   ```

2. **Services not accessible**:
   ```bash
   kubectl get svc
   kubectl describe svc todo-frontend
   ```

3. **Dapr sidecars not injected**:
   ```bash
   kubectl get pods --show-labels
   # Ensure pods have dapr.io/enabled=true label
   ```

4. **Kafka connectivity issues**:
   ```bash
   kubectl logs -l app=kafka
   kubectl exec -it <kafka-pod> -- kafka-topics --bootstrap-server localhost:9092 --list
   ```

### Useful Commands

```bash
# Check all resources
kubectl get all

# Check Dapr status
dapr status -k

# Check logs for specific service
kubectl logs -l app=todo-backend

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Debug a specific pod
kubectl debug -it <pod-name> --image=nicolaka/netshoot:latest -- bash
```

## Rollback Procedure

If you need to rollback to a previous version:

```bash
# List releases
helm list

# Rollback to previous release
helm rollback todo-app [revision-number]

# Verify rollback
kubectl get pods
```

## Cleanup

To remove the application:

```bash
# Uninstall Helm release
helm uninstall todo-app

# Remove Dapr
dapr uninstall -k

# Remove namespaces if created
kubectl delete namespace kafka redis monitoring
```