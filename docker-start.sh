#!/bin/bash

# Evolution of Todo - Quick Start Script

set -e

echo "🚀 Evolution of Todo - Docker Setup"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Parse arguments
ENVIRONMENT=${1:-production}

case $ENVIRONMENT in
    dev|development)
        echo "🔧 Starting in DEVELOPMENT mode..."
        docker compose -f docker-compose.dev.yml up --build
        ;;
    prod|production)
        echo "🚀 Starting in PRODUCTION mode..."
        docker compose up -d --build
        echo ""
        echo "✅ Services are starting..."
        echo ""
        echo "📍 Access your services:"
        echo "   Frontend:  http://localhost:3000"
        echo "   Backend:   http://localhost:8000"
        echo "   Agent:     http://localhost:8001"
        echo ""
        echo "📊 View logs: docker compose logs -f"
        echo "🛑 Stop services: docker compose down"
        ;;
    *)
        echo "Usage: ./docker-start.sh [dev|prod]"
        echo ""
        echo "Examples:"
        echo "  ./docker-start.sh dev   # Start in development mode"
        echo "  ./docker-start.sh prod  # Start in production mode"
        exit 1
        ;;
esac
