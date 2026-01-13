# Prompt History Records (PHR) Index

This directory contains all Prompt History Records for the Evolution of Todo project, organized by feature/phase.

## Directory Structure

```
history/prompts/
├── 001-todo-cli-app/          # Phase I: In-Memory CLI App
├── 002-fullstack-web-app/     # Phase II: Full-Stack Web App
├── 003-ai-chatbot/            # Phase III: AI Chatbot
├── 004-k8s-deployment/        # Phase IV: Kubernetes Deployment
├── 005-advanced-cloud-deployment/ # Phase V: Advanced Cloud Deployment
├── constitution/              # Constitution-related prompts
└── general/                   # General project prompts
```

## Phase I: In-Memory CLI App (001-todo-cli-app/)
- Contains all PHRs related to the initial Python CLI application
- Core todo functionality implementation
- In-memory storage patterns

## Phase II: Full-Stack Web App (002-fullstack-web-app/)
- Contains all PHRs related to the Next.js/FastAPI web application
- Database integration with Neon DB
- API development and frontend implementation

## Phase III: AI Chatbot (003-ai-chatbot/)
- Contains all PHRs related to AI integration
- OpenAI ChatKit and Agents SDK implementation
- Conversational interface development

## Phase IV: Kubernetes Deployment (004-k8s-deployment/)
- Contains all PHRs related to containerization and Kubernetes
- Docker configurations
- Helm charts and Minikube deployment

## Phase V: Advanced Cloud Deployment (005-advanced-cloud-deployment/)
- Contains all PHRs related to production cloud deployment
- Dapr and Kafka integration
- DigitalOcean Kubernetes Service deployment
- Advanced features (Urdu support, voice commands, agent skills)

## Constitution (constitution/)
- Project constitution development and updates
- Governance and architectural decisions

## General (general/)
- General project management prompts
- Cross-cutting concerns
- Infrastructure decisions

Each subdirectory contains numbered PHR files that document the specific prompts and responses that drove the implementation of that phase or feature.