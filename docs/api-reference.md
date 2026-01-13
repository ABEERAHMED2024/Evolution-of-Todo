# API Reference

## Overview

The Evolution of Todo project exposes a comprehensive REST API through the backend service. The API is built using FastAPI, which automatically generates OpenAPI documentation.

## Base URL

The API is served from the backend service at:
`http://<backend-host>:<backend-port>/api/v1`

## Authentication

Most endpoints require authentication using API keys. Include your API key in the request header:

```
Authorization: Bearer <api-key>
```

## Endpoints

### Todos

#### GET /todos
Retrieve a list of todos.

**Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `limit` (int, optional): Maximum number of records to return (default: 100)
- `status` (string, optional): Filter by status (all, pending, completed)

**Response:**
```json
{
  "todos": [
    {
      "id": "uuid-string",
      "title": "Todo title",
      "description": "Todo description",
      "status": "pending|completed",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST /todos
Create a new todo.

**Request Body:**
```json
{
  "title": "Todo title",
  "description": "Todo description"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "description": "Todo description",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### GET /todos/{todo_id}
Retrieve a specific todo by ID.

**Response:**
```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "description": "Todo description",
  "status": "pending|completed",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### PUT /todos/{todo_id}
Update a specific todo by ID.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "pending|completed"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

#### DELETE /todos/{todo_id}
Delete a specific todo by ID.

**Response:**
Status: 204 No Content

#### PATCH /todos/{todo_id}/complete
Mark a todo as completed.

**Response:**
```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "description": "Todo description",
  "status": "completed",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### Users

#### GET /users/me
Get current user information.

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "created_at": "2023-01-01T00:00:00Z"
}
```

#### POST /users
Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Exceeding the rate limit will result in a `429 Too Many Requests` response.

## Health Check

Check the health of the backend service at:
`GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T00:00:00Z"
}
```