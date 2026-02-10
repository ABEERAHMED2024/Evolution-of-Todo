#!/bin/bash

# Docker Health Check Script

echo "🏥 Evolution of Todo - Health Check"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if services are running
echo "📊 Service Status:"
echo ""
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    
    echo "🔍 Testing $name ($url)..."
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "✅ $name is healthy"
    else
        echo "⚠️ $name is not responding"
    fi
}

# Test services
check_service "Backend" "http://localhost:8000/health"
check_service "Agent" "http://localhost:8001/health"
check_service "Frontend" "http://localhost:3000"

echo ""
echo "📍 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   Agent:     http://localhost:8001"
echo ""
