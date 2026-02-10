# 🐳 Docker Quick Reference

## Start Services

```bash
# Production (Windows)
docker-start.bat prod

# Production (Linux/Mac)
./docker-start.sh prod

# Development
docker-start.bat dev
# or
./docker-start.sh dev

# Using Make
make up          # Start
make down        # Stop
make logs        # View logs
```

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Agent**: http://localhost:8001

## Common Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f backend    # Specific service

# Restart services
docker compose restart

# Stop services
docker compose down

# Stop & remove volumes
docker compose down -v

# Rebuild images
docker compose build
docker compose up -d --build

# Health check
docker-health.bat          # Windows
./docker-health.sh         # Linux/Mac
```

## Debugging

```bash
# Enter container
docker compose exec backend sh

# View container logs
docker compose logs backend

# Inspect container
docker inspect todo-backend

# Check resource usage
docker stats
```

## Cleanup

```bash
# Stop all containers
docker compose down

# Remove everything
make clean

# Docker system cleanup
docker system prune -af
docker volume prune -f
```

## File Structure

```
.
├── backend/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Frontend container
│   └── .dockerignore
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Development
├── Dockerfile.agent            # Agent container
├── .dockerignore               # Global ignore
└── .env.example               # Environment template
```

## Environment Setup

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings

3. Start services:
   ```bash
   docker compose up -d
   ```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Change port in docker-compose.yml or stop conflicting service |
| Build fails | Run `docker compose build --no-cache` |
| Service unhealthy | Check logs: `docker compose logs [service]` |
| Slow builds | Check .dockerignore, prune Docker cache |
| Container won't start | Check environment variables in .env |

## Make Targets

```bash
make help          # Show all commands
make build         # Build images
make up            # Start services
make down          # Stop services
make logs          # View logs
make ps            # List containers
make clean         # Remove everything
make health        # Check service health
```

## Development Tips

1. **Hot Reload**: Use `docker-compose.dev.yml` for development
2. **Debug Mode**: Ports 9229-9230 are exposed for Node.js debugging
3. **Volumes**: Source code is mounted in dev mode for instant updates
4. **Logs**: Use `docker compose logs -f` to watch logs in real-time

## Production Tips

1. **Environment**: Always set `NODE_ENV=production`
2. **Secrets**: Never commit `.env` files
3. **Updates**: Rebuild images after dependency changes
4. **Monitoring**: Use health endpoints for monitoring
5. **Backups**: Backup `todo-data` volume regularly

## Performance

- **Build Cache**: Leverage layer caching by not changing package.json unnecessarily
- **Image Size**: Use `docker images` to check image sizes
- **Resources**: Monitor with `docker stats`
- **Cleanup**: Regular `docker system prune` to free space

## Security

- ✅ All services run as non-root users
- ✅ Alpine base images for minimal attack surface
- ✅ Health checks enabled
- ✅ Network isolation with Docker networks
- ✅ Volume permissions properly set

---

**Need Help?** Check [DOCKER.md](DOCKER.md) or [DOCKER_BEST_PRACTICES.md](DOCKER_BEST_PRACTICES.md)
