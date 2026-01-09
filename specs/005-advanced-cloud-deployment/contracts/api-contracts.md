# API Contracts: Phase V Advanced Cloud Deployment

## Event-Driven Architecture Contracts

### Kafka Topics
- **Topic Name**: `todo-events`
- **Purpose**: Publish all task-related events
- **Partitions**: Configurable based on load
- **Replication Factor**: 3 for high availability
- **Message Format**: JSON with schema validation
- **Retention Policy**: 7 days or 1GB whichever comes first

### Dapr Component Definitions

#### Pub/Sub Component (Kafka)
- **Component Type**: pubsub.kafka
- **Version**: v1
- **Metadata**:
  - brokers: List of Kafka broker addresses
  - consumerGroup: Consumer group for the service
  - authRequired: true for secure connections
  - saslUsername: Username for SASL authentication
  - saslPassword: Password for SASL authentication

#### State Store Component
- **Component Type**: state.redis
- **Version**: v1
- **Metadata**:
  - redisHost: Redis server address
  - redisPassword: Password for Redis authentication
  - actorStateStore: true for actor pattern support

#### Secret Store Component
- **Component Type**: secretstores.kubernetes
- **Version**: v1
- **Metadata**: None required (uses Kubernetes service account)

## Service API Contracts

### Backend Service API
- **Endpoint**: `/v1/tasks`
- **Methods**: GET, POST, PUT, DELETE
- **Authentication**: Bearer token via Dapr
- **Rate Limiting**: 1000 requests per minute per client
- **Response Format**: JSON with standardized error format

### Frontend Service API
- **Endpoint**: `/api/tasks`
- **Methods**: GET, POST, PUT, DELETE
- **Authentication**: Session-based with CSRF protection
- **Response Format**: JSON with standardized error format

### Agent Service API
- **Endpoint**: `/v1/chat`, `/v1/voice-command`
- **Methods**: POST
- **Authentication**: Bearer token via Dapr
- **Response Format**: JSON with standardized error format
- **Special Handling**: Supports streaming responses for chat

## Event Schema Contracts

### Task Created Event
```json
{
  "eventId": "string",
  "eventType": "task.created",
  "source": "frontend",
  "timestamp": "ISO 8601 datetime",
  "data": {
    "taskId": "string",
    "title": "string",
    "description": "string",
    "priority": "high|medium|low",
    "dueDate": "ISO 8601 date",
    "userId": "string"
  }
}
```

### Task Updated Event
```json
{
  "eventId": "string",
  "eventType": "task.updated",
  "source": "frontend|agent",
  "timestamp": "ISO 8601 datetime",
  "data": {
    "taskId": "string",
    "updates": {
      "status": "complete|incomplete",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "dueDate": "ISO 8601 date"
    },
    "userId": "string"
  }
}
```

### Task Deleted Event
```json
{
  "eventId": "string",
  "eventType": "task.deleted",
  "source": "frontend|agent",
  "timestamp": "ISO 8601 datetime",
  "data": {
    "taskId": "string",
    "userId": "string"
  }
}
```

## Voice Command Processing Contract

### Input Format
- **Audio Format**: WAV, MP3, or FLAC
- **Sample Rate**: 16kHz recommended
- **Bit Depth**: 16-bit
- **Channels**: Mono

### Processing Result Format
```json
{
  "commandId": "string",
  "transcription": "string",
  "confidence": "float (0.0-1.0)",
  "intent": "string",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

## Urdu Language Processing Contract

### Input Format
- **Encoding**: UTF-8
- **Normalization**: NFKC normalization applied
- **Maximum Length**: 1000 characters

### Processing Result Format
```json
{
  "inputText": "string",
  "processedText": "string",
  "detectedIntent": "string",
  "extractedEntities": [
    {
      "entity": "string",
      "value": "string",
      "confidence": "float (0.0-1.0)"
    }
  ],
  "confidenceScore": "float (0.0-1.0)"
}
```

## Security and Authorization Contracts

### Dapr Authorization
- **Middleware**: Built-in Dapr authorization
- **Policy**: Role-based access control (RBAC)
- **Token Validation**: JWT token validation with public key
- **Scopes**: Per-service access scopes defined

### Secrets Management
- **Provider**: DigitalOcean managed secrets
- **Encryption**: AES-256 encryption at rest
- **Access Control**: IAM-based access control
- **Rotation**: Automatic rotation every 90 days