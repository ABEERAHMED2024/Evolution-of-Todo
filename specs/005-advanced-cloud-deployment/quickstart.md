# Quickstart Guide: Phase V Advanced Cloud Deployment

## Prerequisites
- DigitalOcean account with API access
- kubectl installed and configured
- Helm installed
- Dapr CLI installed
- kubectl-ai plugin installed
- Docker installed

## Setup Instructions

### 1. Install Dapr on your Kubernetes cluster
```bash
# Initialize Dapr in your Kubernetes cluster
dapr init --kubernetes
```

### 2. Set up DigitalOcean Kubernetes (DOKS)
```bash
# Create a DigitalOcean Kubernetes cluster via the control panel or CLI
doctl kubernetes cluster create advanced-todo-cluster --region sfo3 --node-pool "name=default-node-pool;size=s-2vcpu-4gb;count=3"

# Configure kubectl to use the DOKS cluster
doctl kubernetes cluster kubeconfig save advanced-todo-cluster
```

### 3. Deploy Kafka to the cluster
```bash
# Add the Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Deploy Kafka
helm install kafka bitnami/kafka --set replicaCount=3 --set zookeeper.enabled=true
```

### 4. Configure DigitalOcean managed secrets
```bash
# Create a secret for the Neon DB connection
kubectl create secret generic neon-db-secret --from-literal=connection-string="your-neon-db-connection-string"

# Create a secret for the OpenAI API key
kubectl create secret generic openai-api-key --from-literal=apiKey="your-openai-api-key"
```

### 5. Deploy the application with Helm
```bash
# Add the Dapr annotation to enable Dapr sidecars
kubectl annotate namespace default dapr.io/enabled=true

# Install the application using Helm
helm install evolution-of-todo ./helm-chart --values ./values-production.yaml
```

### 6. Verify the deployment
```bash
# Check that all pods are running
kubectl get pods

# Check Dapr sidecars are injected
kubectl get pods -l app=evolution-of-todo-backend -o yaml | grep dapr

# Verify Kafka connectivity
kubectl run kafka-test --image=bitnami/kafka:latest --rm -it --restart=Never -- bin/kafka-broker-api-versions.sh --bootstrap-server kafka:9092
```

## Voice Command Integration
```bash
# To test voice command functionality, use the provided API endpoint
curl -X POST "http://your-app-url/voice-command" \
  -H "Content-Type: audio/wav" \
  -d "@path/to/audio/file.wav"
```

## Urdu Language Support
```bash
# To test Urdu language support, send a request with Urdu text
curl -X POST "http://your-app-url/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "کل کے لیے ایک کام شامل کریں"}'
```

## AI Operations with kubectl-ai
```bash
# Scale the frontend using kubectl-ai
kubectl ai scale deployment evolution-of-todo-frontend --replicas=5

# Check service health with AI assistance
kubectl ai get pods --selector=app=evolution-of-todo-frontend

# Troubleshoot issues with AI assistance
kubectl ai describe pod --selector=app=evolution-of-todo-backend
```

## Monitoring and Observability
```bash
# Access Dapr dashboard
dapr dashboard -k

# Check distributed tracing with Jaeger
kubectl port-forward -n istio-system svc/tracing 16686:80

# Monitor application metrics
kubectl port-forward svc/prometheus-server 9090:80
```

## Troubleshooting
- If Dapr sidecars are not injected: Verify the namespace has the dapr.io/enabled=true annotation
- If Kafka is not accessible: Check that the Kafka cluster is properly deployed and services are running
- If voice commands fail: Verify that the speech recognition service is properly configured and accessible
- If Urdu text processing fails: Check that the NLP model supports Urdu language
- If secrets are not accessible: Verify that the secret names match those referenced in the deployment manifests