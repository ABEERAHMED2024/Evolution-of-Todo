#!/bin/bash

# Evolution of Todo - Manual Docker Run Script
# Alternative to docker-compose when there are connectivity issues

set -e

echo "🚀 Evolution of Todo - Manual Docker Setup"
echo "========================================="

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

# Network name
NETWORK_NAME="todo-network"

# Container names
BACKEND_CONTAINER="todo-backend-manual"
AGENT_CONTAINER="todo-agent-manual"

# Create Docker network
create_network() {
    print_status "Creating Docker network..."
    if docker network ls | grep -q "$NETWORK_NAME"; then
        print_status "Network $NETWORK_NAME already exists"
    else
        docker network create $NETWORK_NAME
        print_success "Created network: $NETWORK_NAME"
    fi
}

# Build backend image
build_backend() {
    print_status "Building backend image..."

    # Navigate to backend directory and build image
    cd backend

    # Create a simple Dockerfile that avoids the pipe issue
    cat > Dockerfile.manual << 'EOF'
FROM node:18-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Install dependencies
RUN npm install --production

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]
EOF

    # Build with explicit context
    docker build -f Dockerfile.manual -t todo-backend-manual .

    if [ $? -eq 0 ]; then
        print_success "Backend image built successfully"
    else
        print_error "Failed to build backend image"
        exit 1
    fi

    cd ..
}

# Build agent image
build_agent() {
    print_status "Building agent image..."

    cd agent

    # Create a simple Dockerfile that avoids the pipe issue
    cat > Dockerfile.manual << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Start the agent service
CMD ["python", "main.py"]
EOF

    # Build with explicit context
    docker build -f Dockerfile.manual -t todo-agent-manual .

    if [ $? -eq 0 ]; then
        print_success "Agent image built successfully"
    else
        print_warning "Failed to build agent image (AI features may not work)"
    fi

    cd ..
}

# Run backend container
run_backend() {
    print_status "Starting backend container..."

    # Stop existing container if running
    docker stop $BACKEND_CONTAINER 2>/dev/null || true
    docker rm $BACKEND_CONTAINER 2>/dev/null || true

    # Run the backend container
    docker run -d \
        --name $BACKEND_CONTAINER \
        --network $NETWORK_NAME \
        -p 8000:8000 \
        -v "$(pwd)/backend/data:/app/data" \
        -e NODE_ENV=production \
        -e PORT=8000 \
        --restart unless-stopped \
        todo-backend-manual

    if [ $? -eq 0 ]; then
        print_success "Backend container started"
    else
        print_error "Failed to start backend container"
        exit 1
    fi
}

# Run agent container
run_agent() {
    print_status "Starting agent container..."

    # Stop existing container if running
    docker stop $AGENT_CONTAINER 2>/dev/null || true
    docker rm $AGENT_CONTAINER 2>/dev/null || true

    # Get OpenAI API key from environment or prompt
    OPENAI_KEY=${OPENAI_API_KEY:-""}
    if [ -z "$OPENAI_KEY" ]; then
        print_warning "No OpenAI API key found. AI features will be limited."
    fi

    # Run the agent container
    docker run -d \
        --name $AGENT_CONTAINER \
        --network $NETWORK_NAME \
        -p 8001:8001 \
        -e PYTHONUNBUFFERED=1 \
        -e PORT=8001 \
        -e BACKEND_URL=http://$BACKEND_CONTAINER:8000 \
        -e OPENAI_API_KEY="$OPENAI_KEY" \
        --restart unless-stopped \
        todo-agent-manual 2>/dev/null || {
        print_warning "Agent container failed to start. Continuing with backend only..."
        return 0
    }

    print_success "Agent container started"
}

# Check service health
check_services() {
    print_status "Waiting for services to be ready..."
    sleep 10

    # Check backend
    print_status "Checking backend health..."
    for i in {1..30}; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            print_success "✅ Backend is healthy at http://localhost:8000"
            break
        elif [ $i -eq 30 ]; then
            print_warning "⚠️ Backend health check timeout"
            break
        else
            echo -n "."
            sleep 2
        fi
    done

    # Check agent
    print_status "Checking agent health..."
    for i in {1..15}; do
        if curl -f http://localhost:8001/health >/dev/null 2>&1; then
            print_success "✅ Agent is healthy at http://localhost:8001"
            break
        elif [ $i -eq 15 ]; then
            print_warning "⚠️ Agent not responding (AI features disabled)"
            break
        else
            echo -n "."
            sleep 2
        fi
    done
}

# Show service information
show_info() {
    echo ""
    echo "🌐 Services Information:"
    echo "========================"
    echo "📚 Backend API:     http://localhost:8000"
    echo "🤖 AI Agent API:    http://localhost:8001"
    echo ""
    echo "🔧 Quick Tests:"
    echo "================"
    echo "# Test backend health"
    echo "curl http://localhost:8000/health"
    echo ""
    echo "# Create a test task"
    echo "curl -X POST http://localhost:8000/tasks \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"title\":\"My First Task\",\"priority\":\"high\"}'"
    echo ""
    echo "# List all tasks"
    echo "curl http://localhost:8000/tasks"
    echo ""
    echo "# Test AI agent (if available)"
    echo "curl -X POST http://localhost:8001/chat \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"message\":\"Create a task to learn Docker\"}'"
    echo ""
    echo "🐳 Container Management:"
    echo "========================"
    echo "# View logs"
    echo "docker logs $BACKEND_CONTAINER"
    echo "docker logs $AGENT_CONTAINER"
    echo ""
    echo "# Stop services"
    echo "./docker-manual.sh stop"
    echo ""
    echo "# Restart services"
    echo "./docker-manual.sh restart"
    echo ""
}

# Stop services
stop_services() {
    print_status "Stopping services..."

    docker stop $AGENT_CONTAINER 2>/dev/null || true
    docker stop $BACKEND_CONTAINER 2>/dev/null || true

    docker rm $AGENT_CONTAINER 2>/dev/null || true
    docker rm $BACKEND_CONTAINER 2>/dev/null || true

    print_success "Services stopped"
}

# Show logs
show_logs() {
    echo "Backend logs:"
    echo "============="
    docker logs --tail 50 $BACKEND_CONTAINER 2>/dev/null || echo "Backend container not running"

    echo ""
    echo "Agent logs:"
    echo "==========="
    docker logs --tail 50 $AGENT_CONTAINER 2>/dev/null || echo "Agent container not running"
}

# Show status
show_status() {
    echo "Container Status:"
    echo "=================="
    docker ps -a --filter "name=todo-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "Network Status:"
    echo "==============="
    docker network ls --filter "name=$NETWORK_NAME"

    echo ""
    check_services
}

# Clean up everything
cleanup() {
    print_warning "This will remove all containers, images, and networks"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_services
        docker rmi todo-backend-manual todo-agent-manual 2>/dev/null || true
        docker network rm $NETWORK_NAME 2>/dev/null || true
        rm -f backend/Dockerfile.manual agent/Dockerfile.manual
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show service logs"
    echo "  status    Show service status"
    echo "  clean     Remove all containers and images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Build and start services"
    echo "  $0 logs     # View service logs"
    echo "  $0 status   # Check service status"
    echo "  $0 stop     # Stop all services"
}

# Main script logic
case "$1" in
    "start")
        create_network
        build_backend
        build_agent
        run_backend
        run_agent
        check_services
        show_info
        print_success "Evolution of Todo is now running! 🎉"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        run_backend
        run_agent
        check_services
        print_success "Services restarted"
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        cleanup
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
