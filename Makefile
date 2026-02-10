# Makefile for Evolution of Todo

.PHONY: help build up down restart logs clean test

help: ## Show this help message
	@echo "Evolution of Todo - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker compose build

build-backend: ## Build backend image only
	docker compose build backend

build-frontend: ## Build frontend image only
	docker compose build frontend

build-agent: ## Build agent image only
	docker compose build agent

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-frontend: ## View frontend logs
	docker compose logs -f frontend

logs-agent: ## View agent logs
	docker compose logs -f agent

ps: ## List running containers
	docker compose ps

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all

prune: ## Remove unused Docker resources
	docker system prune -af --volumes

test: ## Run tests (if available)
	@echo "Running tests..."
	docker compose run --rm backend npm test || true

dev: ## Start services in development mode
	docker compose up

prod: build up ## Build and start services in production mode

health: ## Check health status of all services
	@echo "Checking service health..."
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
