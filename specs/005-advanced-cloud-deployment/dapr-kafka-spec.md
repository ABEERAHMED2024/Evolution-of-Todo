# Feature Specification: Phase V - Dapr + Kafka Event-Driven Architecture

**Feature Branch**: `005-advanced-cloud-deployment-dapr-kafka`  
**Created**: 2026-03-26  
**Status**: Draft  
**Parent Spec**: `specs/005-advanced-cloud-deployment/spec.md`  
**Input**: Hackathon II Analysis - Gap #2: Dapr + Kafka Real Implementation (Phase V, 300 points)

---

## Purpose

This specification defines the **Dapr + Kafka event-driven architecture** required for Phase V of the Evolution of Todo project. It replaces the simulated event-driven architecture with real Dapr sidecars and Redpanda (Kafka-compatible) event streaming.

**Why this spec**: The Hackathon II requirements (Pages 24-36) mandate "Use Full Dapr: Pub/Sub, State, Bindings (cron), Secrets, Service Invocation" and "Implement event-driven architecture with Kafka". This spec addresses the identified gap where the current implementation uses JavaScript simulation instead of real infrastructure.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Event-Driven Task Management (Priority: P0)

As a system architect, I want services to communicate via events published to Kafka through Dapr so that services are decoupled and can scale independently.

**Why this priority**: This is the foundational architecture change for Phase V. Event-driven architecture enables scalability, resilience, and loose coupling between services.

**Independent Test**: When a task operation occurs (create, update, delete, complete), an event should be published to Kafka via Dapr Pub/Sub, and interested services should consume and process the event.

**Acceptance Scenarios**:

1. **Given** a task is created via the backend, **When** the operation completes, **Then** a `task.created` event is published to the `task-events` Kafka topic via Dapr
2. **Given** a task is updated, **When** the update completes, **Then** a `task.updated` event is published and the notification service receives it
3. **Given** a task with a due date is created, **When** the due date approaches, **Then** a reminder event is published to the `reminders` topic
4. **Given** multiple services subscribe to task events, **When** an event is published, **Then** all subscribed services receive and process the event independently

---

### User Story 2 - Dapr Sidecar Deployment (Priority: P0)

As a DevOps engineer, I want Dapr sidecars deployed alongside each service so that infrastructure concerns (pub/sub, state management, secrets) are abstracted from application code.

**Why this priority**: Dapr sidecars provide the infrastructure abstraction that enables services to be cloud-native and portable across platforms.

**Independent Test**: Each Kubernetes pod should have a Dapr sidecar container injected, and services should communicate with infrastructure via Dapr APIs (HTTP/gRPC).

**Acceptance Scenarios**:

1. **Given** a Kubernetes deployment for the backend service, **When** deployed with Dapr, **Then** the pod has two containers: app container and Dapr sidecar
2. **Given** a service needs to publish an event, **When** it calls the Dapr Pub/Sub API, **Then** Dapr handles the Kafka communication transparently
3. **Given** a service needs to store state, **When** it calls the Dapr State API, **Then** Dapr persists to the configured state store (PostgreSQL)
4. **Given** a service needs secrets, **When** it calls the Dapr Secrets API, **Then** Dapr retrieves from Kubernetes Secrets securely

---

### User Story 3 - Kafka Event Streaming with Redpanda (Priority: P1)

As a platform engineer, I want Redpanda deployed as the Kafka-compatible event streaming platform so that we have a Zookeeper-free, high-performance event backbone.

**Why this priority**: Redpanda provides Kafka compatibility without Zookeeper complexity, making it ideal for Kubernetes deployment and learning.

**Independent Test**: Redpanda should be deployed on Kubernetes, create topics for task events, reminders, and task updates, and handle event publishing/subscribing.

**Acceptance Scenarios**:

1. **Given** Redpanda is deployed on Kubernetes, **When** topics are created, **Then** `task-events`, `reminders`, and `task-updates` topics exist
2. **Given** a producer publishes to a topic, **When** consumers subscribe, **Then** events are delivered with <100ms latency
3. **Given** high event volume (1000 events/sec), **When** Redpanda processes events, **Then** no events are lost and ordering is maintained per partition

---

### User Story 4 - Dapr Components Configuration (Priority: P1)

As a developer, I want Dapr components configured via Kubernetes YAML so that infrastructure can be changed without code modifications.

**Why this priority**: Dapr's declarative component configuration enables infrastructure changes via YAML, not code changes.

**Independent Test**: Dapr components (pubsub.kafka, state.postgresql, secretstores.kubernetes) should be defined as Kubernetes Custom Resources and applied via kubectl.

**Acceptance Scenarios**:

1. **Given** a pubsub.kafka component YAML, **When** applied to Kubernetes, **Then** Dapr can publish/subscribe via Kafka
2. **Given** a state.postgresql component YAML, **When** applied, **Then** Dapr State API persists to PostgreSQL
3. **Given** a secretstores.kubernetes component, **When** configured, **Then** Dapr Secrets API retrieves from K8s Secrets
4. **Given** component configuration needs to change, **When** YAML is updated and reapplied, **Then** no code changes are required

---

### User Story 5 - Event-Driven Reminders and Notifications (Priority: P2)

As a user, I want to receive reminders for tasks with due dates so that I never miss important deadlines.

**Why this priority**: This demonstrates a real use case for event-driven architecture with scheduled events.

**Independent Test**: When a task with a due date is created, a reminder should be scheduled and sent at the appropriate time via the notification service.

**Acceptance Scenarios**:

1. **Given** a task is created with due date "tomorrow at 9 AM", **When** the task is saved, **Then** a reminder event is scheduled
2. **Given** a reminder event is scheduled, **When** the due time approaches, **Then** the notification service sends a reminder
3. **Given** multiple tasks have reminders, **When** reminder time arrives, **Then** each reminder is processed independently

---

### Edge Cases

- What happens when Kafka/Redpanda is temporarily unavailable during event publishing?
- How does the system handle duplicate events (at-least-once delivery)?
- What occurs when Dapr sidecar fails to initialize?
- How does the system handle event ordering when multiple events affect the same task?
- What happens when a consumer service is down when events are published?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Dapr Infrastructure Requirements

- **FR-DAPR-001**: System MUST deploy Dapr to Kubernetes cluster using Helm chart
- **FR-DAPR-002**: System MUST inject Dapr sidecar into application pods (backend, frontend, agent, notification service)
- **FR-DAPR-003**: System MUST configure Dapr Pub/Sub component with Kafka (Redpanda) broker
- **FR-DAPR-004**: System MUST configure Dapr State component with PostgreSQL database
- **FR-DAPR-005**: System MUST configure Dapr Secrets component with Kubernetes Secrets store
- **FR-DAPR-006**: System MUST configure Dapr Jobs API for scheduled reminders (or Cron Bindings as alternative)
- **FR-DAPR-007**: System MUST enable Dapr service invocation for inter-service communication
- **FR-DAPR-008**: System MUST configure Dapr observability (tracing, metrics, health checks)

#### Kafka/Redpanda Requirements

- **FR-KAFKA-001**: System MUST deploy Redpanda to Kubernetes cluster (single-node for local, multi-node for cloud)
- **FR-KAFKA-002**: System MUST create Kafka topics: `task-events`, `reminders`, `task-updates`
- **FR-KAFKA-003**: System MUST configure topic partitions (minimum 3 partitions per topic for scalability)
- **FR-KAFKA-004**: System MUST configure retention policy (7 days for events, 30 days for reminders)
- **FR-KAFKA-005**: System MUST enable authentication for Redpanda (SASL/SCRAM)
- **FR-KAFKA-006**: System MUST configure consumer groups for each service subscription

#### Event Publishing Requirements

- **FR-EVENT-001**: System MUST publish `task.created` event when a task is created
- **FR-EVENT-002**: System MUST publish `task.updated` event when a task is updated
- **FR-EVENT-003**: System MUST publish `task.completed` event when a task is completed
- **FR-EVENT-004**: System MUST publish `task.deleted` event when a task is deleted
- **FR-EVENT-005**: System MUST publish `reminder.scheduled` event when a reminder is scheduled
- **FR-EVENT-006**: System MUST publish `reminder.due` event when a reminder is triggered
- **FR-EVENT-007**: System MUST include event metadata: event_id, event_type, timestamp, source, task_id, user_id
- **FR-EVENT-008**: System MUST use CloudEvents specification for event format

#### Event Consumption Requirements

- **FR-CONSUME-001**: Notification service MUST subscribe to `reminders` topic
- **FR-CONSUME-002**: Audit service MUST subscribe to `task-events` topic
- **FR-CONSUME-003**: Recurring task service MUST subscribe to `task.completed` events
- **FR-CONSUME-004**: Real-time sync service MUST subscribe to `task-updates` topic
- **FR-CONSUME-005**: Consumers MUST handle duplicate events (idempotency)
- **FR-CONSUME-006**: Consumers MUST implement error handling and retry logic

#### State Management Requirements

- **FR-STATE-001**: System MUST use Dapr State API for conversation state storage
- **FR-STATE-002**: System MUST use Dapr State API for user session management
- **FR-STATE-003**: System MUST configure state store with PostgreSQL database
- **FR-STATE-004**: System MUST implement state consistency (strong consistency for critical data)

#### Secrets Management Requirements

- **FR-SECRETS-001**: System MUST store database credentials in Kubernetes Secrets
- **FR-SECRETS-002**: System MUST store API keys (OpenAI, etc.) in Kubernetes Secrets
- **FR-SECRETS-003**: System MUST store Redpanda credentials in Kubernetes Secrets
- **FR-SECRETS-004**: System MUST access secrets via Dapr Secrets API (not environment variables)

---

### Key Entities

#### Dapr Component
Kubernetes Custom Resource defining infrastructure capabilities:
- **pubsub.kafka**: Kafka pub/sub configuration
- **state.postgresql**: PostgreSQL state store configuration
- **secretstores.kubernetes**: Kubernetes secrets integration
- **bindings.cron** or **jobs**: Scheduled task triggers

#### Kafka Topic
Event category with partitions for parallel processing:
- **task-events**: All task CRUD operations
- **reminders**: Scheduled reminder triggers
- **task-updates**: Real-time sync events

#### Event (CloudEvents Format)
Standardized event structure:
```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "todo-backend",
  "id": "evt-123456",
  "time": "2026-03-26T10:00:00Z",
  "data": {
    "task_id": 1,
    "user_id": "user-123",
    "title": "Buy groceries",
    "action": "created"
  }
}
```

#### Dapr Sidecar
Companion container providing infrastructure APIs:
- Runs alongside each application container
- Exposes HTTP/gRPC APIs for pub/sub, state, secrets
- Handles retries, circuit breaking, observability

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dapr deployed to Kubernetes with all 4 components configured (pubsub, state, secrets, jobs)
- **SC-002**: Redpanda deployed and running with 3 topics created
- **SC-003**: All task operations publish events to Kafka via Dapr
- **SC-004**: Event processing latency <100ms (p95)
- **SC-005**: Event delivery success rate >99%
- **SC-006**: Services communicate via Dapr APIs (no direct Kafka client code)
- **SC-007**: Secrets accessed via Dapr Secrets API (zero plaintext in code)
- **SC-008**: State stored via Dapr State API (PostgreSQL backend)
- **SC-009**: Reminder scheduling works via Dapr Jobs API
- **SC-010**: System handles 1000 events/second without data loss
- **SC-011**: All pods have Dapr sidecars injected
- **SC-012**: Observability enabled (distributed tracing, metrics, health checks)

---

## Out of Scope

- Migrating existing MCP Tools to event-driven architecture (future phase)
- Implementing all 4 consumer services (Notification, Audit, Recurring Task, Real-time Sync) in full
- Multi-cluster Kafka deployment
- Advanced Kafka features (exactly-once semantics, transactions)
- Production-grade Redpanda tuning (reserved for cloud deployment)

---

## Integration Points

### Existing Systems

| System | Integration Method | Notes |
|--------|-------------------|-------|
| MCP Tools (backend/mcp/tools.py) | Dapr Pub/Sub API | Publish events on task operations |
| Task Service (apps/cli/task_service.py) | Dapr Pub/Sub API | Event publishing integration |
| Conversation Service | Dapr State API | Store conversations via Dapr |
| Kubernetes Cluster | Dapr Components | Deploy components as K8s Custom Resources |

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Dapr Helm Chart | helm/dapr/ | Dapr control plane deployment |
| Redpanda Helm Chart | helm/redpanda/ | Event streaming platform |
| Dapr Components | dapr/components/ | pubsub.kafka, state.postgresql, secrets.kubernetes |
| Event Publisher | backend/services/event_publisher.py | Publish events via Dapr |
| Notification Service | services/notification/ | Consume reminder events |

---

## Dependencies

### Required Tools

```bash
# Dapr CLI
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | bash

# Helm (if not installed)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# kubectl (if not installed)
```

### Helm Charts

```yaml
# Dapr
dapr/dapr: 1.12.0

# Redpanda
redpanda-data/redpanda: 5.5.10
```

### Infrastructure

- Kubernetes cluster (Minikube for local, DOKS/AKS/GKE for cloud)
- PostgreSQL database (existing or new)
- Helm v3+
- kubectl configured for cluster access

---

## Migration from Current State

### Current State
- ⚠️ Event simulation in `backend-with-dapr-simulation.js`
- ⚠️ No real Dapr sidecars
- ⚠️ No Kafka/Redpanda deployment
- ⚠️ Direct database calls (no Dapr State API)
- ⚠️ Secrets in environment variables

### Target State
- ✅ Real Dapr sidecars on Kubernetes
- ✅ Redpanda for event streaming
- ✅ Events published via Dapr Pub/Sub
- ✅ State managed via Dapr State API
- ✅ Secrets accessed via Dapr Secrets API

### Migration Steps

1. Deploy Dapr to Kubernetes
2. Deploy Redpanda to Kubernetes
3. Create Dapr components (YAML)
4. Update backend to use Dapr APIs
5. Deploy services with Dapr sidecars
6. Test event publishing/consuming
7. Verify state management and secrets

---

## Prompt Text

```
$ARGUMENTS
```

---

## Related Documents

- **Parent Spec**: `specs/005-advanced-cloud-deployment/spec.md`
- **Hackathon II Doc**: `Hackathon II - Todo Spec-Driven Development.PDF` (Pages 24-36)
- **Dapr Docs**: https://docs.dapr.io/
- **Redpanda Docs**: https://docs.redpanda.com/
- **Analysis Report**: `docs/HACKATHON_II_ANALYSIS.md`

---

**Next Step**: Generate architecture plan with `/sp.plan` command
