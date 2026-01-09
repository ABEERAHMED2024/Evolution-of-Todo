#!/bin/bash

# Script to build and deploy the Evolution of Todo application to Minikube

set -e  # Exit on any error

echo "Starting Evolution of Todo deployment to Minikube..."

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo "Starting Minikube..."
    minikube start
fi

# Set Docker environment to Minikube
eval $(minikube docker-env)

echo "Building Docker images..."

# Build backend image
echo "Building backend image..."
docker build -f docker/backend.Dockerfile -t evolution-of-todo-backend:latest .

# Build frontend image
echo "Building frontend image..."
docker build -f docker/frontend.Dockerfile -t evolution-of-todo-frontend:latest .

# Build agent image
echo "Building agent image..."
docker build -f docker/agent.Dockerfile -t evolution-of-todo-agent:latest .

echo "Docker images built successfully!"

# Check if Helm is available
if ! command -v helm &> /dev/null; then
    echo "Helm is not installed. Please install Helm to proceed."
    exit 1
fi

echo "Installing/Upgrading the Evolution of Todo application..."

# Install or upgrade the application
helm upgrade --install evolution-of-todo ./helm -f ./helm/values-dev.yaml

echo "Application deployed successfully!"
echo "Access the application at: $(minikube service evolution-of-todo-frontend --url)"
echo "Backend API available at: $(minikube service evolution-of-todo-backend --url)"
echo "Agent API available at: $(minikube service evolution-of-todo-agent --url)"

echo "To view all services: kubectl get svc"
echo "To view all pods: kubectl get pods"