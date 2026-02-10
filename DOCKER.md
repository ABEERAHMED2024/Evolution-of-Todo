# Evolution of Todo - Docker Setup

This project uses Docker and Docker Compose for containerization.

## Quick Start

```bash
# Build and start all services
make prod

# Or using docker compose directly
docker compose up -d --build
```

## Services

- **Backend API** - Port 8000 - Node.js/Express REST API
- **Frontend** - Port 3000 - Next.js web application  
- **AI Agent** - Port 8001 - Intelligent task management agent

## Available Commands

### Using Make (Recommended)

```bash
make build          # Build all images
make up            # Start all services
make down          # Stop all services
make logs          # View all logs
make clean         # Remove containers and volumes
make health        # Check service health
```

### Using Docker Compose

```bash
docker compose build              # Build images
docker compose up -d             # Start in background
docker compose down              # Stop services
docker compose logs -f           # Follow logs
docker compose ps                # List containers
```

## Docker Best Practices Implemented

✅ **Multi-stage builds** - Smaller final images  
✅ **Layer caching** - Faster rebuilds  
✅ **Non-root users** - Enhanced security  
✅ **Health checks** - Service monitoring  
✅ **Alpine base images** - Minimal size  
✅ **Dependency conditions** - Proper startup order  
✅ **Named volumes** - Persistent data  
✅ **.dockerignore** - Optimized build context  

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend
NODE_ENV=production
PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AGENT_API_URL=http://localhost:8001

# Agent
BACKEND_URL=http://backend:8000
```

## Accessing Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Agent: http://localhost:8001
- Health checks available at `/health` on each service

## Volume Persistence

Task data is persisted in the `todo-data` volume. To completely reset:

```bash
docker compose down -v
```

## Troubleshooting

**Services not starting?**
```bash
docker compose logs backend
docker compose ps
```

**Build issues?**
```bash
docker compose build --no-cache
```

**Reset everything?**
```bash
make clean
```
