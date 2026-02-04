#!/bin/bash

# Evolution of Todo - Docker Startup Script
# This script helps you get the Todo application running with Docker

set -e

echo "🚀 Evolution of Todo - Docker Setup"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Create environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment variables..."

    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cat > .env << EOF
# Evolution of Todo - Environment Variables

# OpenAI Configuration (Optional - for AI features)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Backend Configuration
BACKEND_URL=http://localhost:8000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Agent Configuration
AGENT_HOST=0.0.0.0
AGENT_PORT=8001

# Frontend Configuration (if using)
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=3000
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_AGENT_URL=http://localhost:8001

# Database Configuration (for production)
DATABASE_URL=sqlite:///./data/todo.db

# Application Environment
NODE_ENV=production
PYTHONUNBUFFERED=1
LOG_LEVEL=info
EOF
        print_success "Created .env file"
        print_warning "Please edit .env file and add your OpenAI API key if you want AI features"
    else
        print_success "Environment file already exists"
    fi
}

# Build and start services
start_services() {
    local profile=""

    if [ "$1" = "full" ]; then
        profile="--profile full-stack"
        print_status "Starting full stack (backend + agent + frontend)..."
    else
        print_status "Starting core services (backend + agent)..."
    fi

    print_status "Building Docker images..."
    docker-compose build

    print_status "Starting services..."
    docker-compose up -d $profile

    print_status "Waiting for services to be healthy..."
    sleep 10
}

# Check service health
check_services() {
    print_status "Checking service health..."

    # Check backend
    if curl -f http://localhost:8000/health &> /dev/null; then
        print_success "✅ Backend service is healthy (http://localhost:8000)"
    else
        print_warning "⚠️  Backend service might not be ready yet"
    fi

    # Check agent
    if curl -f http://localhost:8001/health &> /dev/null; then
        print_success "✅ Agent service is healthy (http://localhost:8001)"
    else
        print_warning "⚠️  Agent service might not be ready yet"
    fi

    # Check frontend if running full stack
    if [ "$1" = "full" ] && curl -f http://localhost:3000 &> /dev/null; then
        print_success "✅ Frontend service is healthy (http://localhost:3000)"
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start          Start core services (backend + agent)"
    echo "  start full     Start all services including frontend"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  logs           Show service logs"
    echo "  status         Check service status"
    echo "  clean          Stop services and remove containers/images"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start       # Start backend and agent only"
    echo "  $0 start full  # Start all services"
    echo "  $0 logs        # View logs"
    echo "  $0 stop        # Stop all services"
}

# Show service URLs
show_urls() {
    echo ""
    echo "🌐 Service URLs:"
    echo "=================="
    echo "📚 Backend API:    http://localhost:8000"
    echo "🤖 AI Agent API:   http://localhost:8001"
    echo "📊 API Docs:       http://localhost:8000/docs (if using Python backend)"
    if [ "$1" = "full" ]; then
        echo "🌍 Frontend Web:   http://localhost:3000"
    fi
    echo ""
    echo "🔧 Quick Tests:"
    echo "================"
    echo "curl http://localhost:8000/health"
    echo "curl http://localhost:8001/health"
    echo "curl -X POST http://localhost:8000/tasks -H 'Content-Type: application/json' -d '{\"title\":\"Test Task\"}'"
    echo ""
}

# Main script logic
case "$1" in
    "start")
        check_docker
        setup_environment
        start_services "$2"
        sleep 5
        check_services "$2"
        show_urls "$2"
        print_success "Evolution of Todo is now running! 🎉"
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose down
        docker-compose up -d
        print_success "Services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        print_status "Service status:"
        docker-compose ps
        echo ""
        check_services
        ;;
    "clean")
        print_warning "This will stop all services and remove containers and images"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down --volumes --remove-orphans
            docker system prune -f
            print_success "Cleanup completed"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
