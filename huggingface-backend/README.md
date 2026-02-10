# Evolution of Todo Backend - Hugging Face Space

This is the backend API for the Evolution of Todo application, deployed as a Hugging Face Space.

## Overview

This FastAPI application serves as the backend for the Evolution of Todo project, providing:

- Task management APIs (create, read, update, delete)
- Filtering and sorting capabilities
- Task statistics and analytics
- SQLite database for persistent storage

## API Endpoints

### Health Checks

- `GET /` - Main endpoint with service information
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint

### Task Management

- `GET /tasks/` - Get all tasks with optional filtering
- `POST /tasks/` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a specific task
- `DELETE /tasks/{task_id}` - Delete a specific task
- `GET /tasks/stats` - Get task statistics

## Environment Variables

- `DB_PATH` - Path to the SQLite database file (default: "todo.db")

## Local Development

To run this application locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn app:app --reload
```

The application will be available at `http://localhost:8000`.

## Hugging Face Space Deployment

This application is designed to run on Hugging Face Spaces with Docker. The application listens on port 7860 as required by Hugging Face Spaces.

## Architecture

- **Framework**: FastAPI
- **Database**: SQLite (persistent storage)
- **API Protocol**: REST API
- **Container**: Docker (for Hugging Face Spaces)

## Features

- Full CRUD operations for tasks
- Advanced filtering and sorting
- Task statistics and analytics
- Persistent storage with SQLite
- Health and readiness checks
- Proper error handling

## Integration

This backend service is designed to work with:

- The Evolution of Todo frontend application
- The AI agent service for natural language processing
- Various client applications via REST API

## Security

- Input validation and sanitization
- Proper error handling without exposing internal details
- Secure database queries using parameterized statements