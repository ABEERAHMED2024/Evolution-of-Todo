# Implementation Plan: Phase V - Dapr + Kafka Event-Driven Architecture

**Branch**: `005-advanced-cloud-deployment-dapr-kafka` | **Date**: 2026-03-26 | **Spec**: `specs/005-advanced-cloud-deployment/dapr-kafka-spec.md`
**Input**: Feature specification from `/specs/005-advanced-cloud-deployment/dapr-kafka-spec.md`

---

## Summary

**Primary Requirement**: Deploy real Dapr sidecars and Redpanda (Kafka-compatible) event streaming platform to Kubernetes, replacing the simulated event-driven architecture.

**Technical Approach**: Use Helm charts for Dapr and Redpanda deployment, configure Dapr components via Kubernetes Custom Resources, update application code to use Dapr APIs for pub/sub, state management, and secrets.

---

## Technical Context

**Language/Version**: Python 3.11+, Kubernetes 1.25+, Helm 3+

**Primary Dependencies**:
- Dapr 1.12.0 (Helm chart)
- Redpanda 5.5.10 (Helm chart)
- FastAPI 0.104.1 (existing)
- SQLModel 0.0.16 (existing)
- httpx (for Dapr API calls)

**Storage**: 
- PostgreSQL for state store (Dapr state component)
- Redpanda for event streaming (Dapr pubsub component)
- Kubernetes Secrets for secrets management

**Testing**: pytest, integration tests with Dapr, end-to-end event flow tests

**Target Platform**: 
- Local: Minikube with 4 CPU, 8GB RAM
- Cloud: DigitalOcean Kubernetes (DOKS) or Azure AKS

**Project Type**: Infrastructure deployment + application integration

**Performance Goals**:
- Event processing latency: <100ms (p95)
- Event delivery success rate: >99%
- Throughput: 1000 events/second
- Dapr sidecar startup: <10 seconds

**Constraints**:
- Must work on Minikube locally (resource constraints)
- Must use Helm charts (no manual CLI installation per Hackathon II)
- Must be cloud-native and portable
- Backward compatible with existing MCP Tools

**Scale/Scope**:
- 1 Dapr deployment
- 1 Redpanda deployment (single-node for local)
- 4 Dapr components (pubsub, state, secrets, jobs)
- 3 Kafka topics
- 4 services with Dapr sidecars

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Compliance

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **Spec-Driven Development** | ✅ PASS | Spec created first (`dapr-kafka-spec.md`) |
| **No Manual Coding** | ✅ PASS | All code will be generated via Qwen Code |
| **Deterministic Behavior** | ✅ PASS | Event-driven with guaranteed delivery |
| **Single Source of Truth** | ✅ PASS | Spec is authoritative; plan derives from it |
| **Cloud-Native by Design** | ✅ PASS | Kubernetes, Helm, Dapr, event-driven |
| **Agentic Dev Stack** | ✅ PASS | Services decomposed into agents |
| **Phase Order Respect** | ✅ PASS | Phase V after Phase III (MCP Tools) |
| **Testability** | ✅ PASS | All components have acceptance criteria |
| **Backward Compatibility** | ✅ PASS | Integrates with existing MCP Tools |

**Result**: ✅ **PASS** - All constitution principles satisfied. Proceed to implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-cloud-deployment/
├── spec.md                      # Parent Phase V spec
├── dapr-kafka-spec.md           # This feature spec (created)
├── dapr-kafka-plan.md           # This file (created)
├── dapr-kafka-tasks.md          # Phase 2 output (TODO: create)
├── research.md                  # Dapr/Redpanda research (TODO: create)
├── data-model.md                # Event schemas (TODO: create)
├── quickstart.md                # Setup guide (TODO: create)
└── contracts/                   # API contracts (TODO: create)
    └── dapr-components-api.md
```

### Infrastructure as Code

```text
helm/
├── dapr/
│   └── values.yaml              # Dapr Helm chart values
├── redpanda/
│   └── values.yaml              # Redpanda Helm chart values
└── todo-app/
    ├── backend/
    │   └── deployment.yaml      # Backend with Dapr sidecar
    ├── frontend/
    │   └── deployment.yaml      # Frontend with Dapr sidecar
    └── agent/
        └── deployment.yaml      # Agent with Dapr sidecar

dapr/
├── components/
│   ├── pubsub-kafka.yaml        # Dapr pubsub.kafka component
│   ├── state-postgres.yaml      # Dapr state.postgresql component
│   ├── secrets-k8s.yaml         # Dapr secrets.kubernetes component
│   └── jobs-api.yaml            # Dapr Jobs API configuration
└── configurations/
    └── dapr-config.yaml         # Dapr configuration (tracing, etc.)

kubernetes/
├── namespaces/
│   └── todo-system.yaml         # Namespace definition
├── secrets/
│   └── todo-secrets.yaml        # Kubernetes secrets
└── topics/
    └── kafka-topics.yaml        # Redpanda topic definitions
```

### Source Code Updates

```text
backend/
├── services/
│   ├── event_publisher.py       # Publish events via Dapr (NEW)
│   └── dapr_client.py           # Dapr API client (NEW)
├── mcp/
│   └── tools.py                 # Update to publish events (MODIFY)
└── tests/
    └── test_dapr_integration.py # Dapr integration tests (NEW)
```

---

## Architecture Overview

### Dapr + Kafka Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DAPR CONTROL PLANE (dapr-system namespace)              │   │
│  │  - Dapr Operator                                         │   │
│  │  - Dapr Placement                                        │   │
│  │  - Dapr Sentry                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REDPANDA CLUSTER (redpanda namespace)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ Redpanda   │  │ Redpanda   │  │ Redpanda   │         │   │
│  │  │ Broker 0   │  │ Broker 1   │  │ Broker 2   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  Topics: task-events, reminders, task-updates            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TODO APPLICATION (todo-system namespace)                │   │
│  │                                                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐               │   │
│  │  │  Backend Pod    │  │   Agent Pod     │               │   │
│  │  │  ┌───────────┐  │  │  ┌───────────┐  │               │   │
│  │  │  │   App     │  │  │  │   App     │  │               │   │
│  │  │  │ Container │  │  │  │ Container │  │               │   │
│  │  │  └─────┬─────┘  │  │  └─────┬─────┘  │               │   │
│  │  │  ┌─────▼─────┐  │  │  ┌─────▼─────┐  │               │   │
│  │  │  │   Dapr    │  │  │  │   Dapr    │  │               │   │
│  │  │  │  Sidecar  │  │  │  │  Sidecar  │  │               │   │
│  │  │  └─────┬─────┘  │  │  └─────┬─────┘  │               │   │
│  │  └────────┼────────┘  └────────┼────────┘               │   │
│  │           │                     │                         │   │
│  │           └──────────┬──────────┘                         │   │
│  │                      │                                     │   │
│  │           ┌──────────▼──────────┐                         │   │
│  │           │  DAPR COMPONENTS    │                         │   │
│  │           │  - pubsub.kafka     │                         │   │
│  │           │  - state.postgresql │                         │   │
│  │           │  - secrets.k8s      │                         │   │
│  │           │  - jobs             │                         │   │
│  │           └──────────┬──────────┘                         │   │
│  └──────────────────────┼────────────────────────────────────┘   │
│                          │                                         │
│  ┌───────────────────────▼──────────────────────────────────┐    │
│  │  EXTERNAL SERVICES                                        │    │
│  │  - PostgreSQL Database (state store)                     │    │
│  │  - Kubernetes Secrets (secrets store)                    │    │
│  └───────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

### Event Flow Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│   Backend (FastAPI + MCP)       │
│                                 │
│  1. Receive request             │
│  2. Execute business logic      │
│  3. Persist to database         │
│  4. Publish event via Dapr ─────┼──────────────┐
└─────────────────────────────────┘              │
                                                  │ Dapr Pub/Sub
                                                  ▼
                                       ┌─────────────────────┐
                                       │   Redpanda (Kafka)  │
                                       │  ┌───────────────┐  │
                                       │  │ task-events   │  │
                                       │  │ reminders     │  │
                                       │  │ task-updates  │  │
                                       │  └───────────────┘  │
                                       └──────────┬──────────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     │                            │                            │
                     ▼                            ▼                            ▼
          ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
          │ Notification     │        │ Audit            │        │ Recurring Task   │
          │ Service          │        │ Service          │        │ Service          │
          │                  │        │                  │        │                  │
          │ Consume events   │        │ Store audit log  │        │ Create next      │
          │ Send reminders   │        │ Track history    │        │ occurrence       │
          └──────────────────┘        └──────────────────┘        └──────────────────┘
```

---

## Dapr Components Configuration

### 1. PubSub Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: todo-system
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "redpanda-0.redpanda.redpanda.svc.cluster.local:9092"
  - name: consumerGroup
    value: "todo-services"
  - name: publishTopic
    value: "task-events"
  - name: authType
    value: "none"  # For local; use SASL for cloud
  - name: maxMessageBytes
    value: 1048576  # 1MB
```

### 2. State PostgreSQL Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-system
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: postgres-connection-string
      key: value
auth:
  secretStore: kubernetes-secrets
```

### 3. Secrets Kubernetes Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
  namespace: todo-system
spec:
  type: secretstores.kubernetes
  version: v1
```

### 4. Jobs API Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: dapr-jobs
  namespace: todo-system
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "0 * * * *"  # Every hour
  - name: direction
    value: "input"
```

---

## Implementation Strategy

### Phase 0: Research & Setup (Day 1)
- [ ] Research Dapr Helm chart configuration
- [ ] Research Redpanda Helm chart configuration
- [ ] Set up Minikube cluster (if not already running)
- [ ] Install Helm v3+
- [ ] Install Dapr CLI

### Phase 1: Deploy Infrastructure (Day 2)
- [ ] Create namespace: todo-system
- [ ] Deploy Dapr via Helm chart
- [ ] Deploy Redpanda via Helm chart (single-node for local)
- [ ] Create Kafka topics: task-events, reminders, task-updates
- [ ] Verify Dapr and Redpanda are running

### Phase 2: Configure Dapr Components (Day 3)
- [ ] Create pubsub.kafka component YAML
- [ ] Create state.postgresql component YAML
- [ ] Create secrets.kubernetes component YAML
- [ ] Create Kubernetes secrets
- [ ] Apply Dapr components to cluster
- [ ] Verify component discovery

### Phase 3: Update Application Code (Day 4-5)
- [ ] Create Dapr client (backend/services/dapr_client.py)
- [ ] Create event publisher (backend/services/event_publisher.py)
- [ ] Update MCP tools to publish events
- [ ] Update conversation service to use Dapr State API
- [ ] Update secrets access to use Dapr Secrets API
- [ ] Add error handling and retry logic

### Phase 4: Deploy Services with Dapr (Day 6)
- [ ] Create Kubernetes deployments with Dapr annotations
- [ ] Deploy backend with Dapr sidecar
- [ ] Deploy agent with Dapr sidecar
- [ ] Deploy frontend with Dapr sidecar
- [ ] Verify sidecar injection
- [ ] Test inter-service communication via Dapr

### Phase 5: Testing & Validation (Day 7)
- [ ] Test event publishing to Kafka via Dapr
- [ ] Test state management via Dapr State API
- [ ] Test secrets access via Dapr Secrets API
- [ ] Test reminder scheduling via Dapr Jobs API
- [ ] Run integration tests
- [ ] Measure event processing latency
- [ ] Verify observability (tracing, metrics)

### Phase 6: Documentation & Handoff (Day 8)
- [ ] Create quickstart guide
- [ ] Document Dapr components
- [ ] Create troubleshooting guide
- [ ] Update architecture diagrams
- [ ] Record demo video (90 seconds)

---

## Data Model

### Event Schema (CloudEvents)

```python
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4

class CloudEvent:
    """CloudEvents 1.0 specification compliant event."""
    
    def __init__(
        self,
        event_type: str,
        data: Dict[str, Any],
        source: str = "todo-backend"
    ):
        self.specversion = "1.0"
        self.id = str(uuid4())
        self.type = event_type
        self.source = source
        self.time = datetime.utcnow().isoformat() + "Z"
        self.data = data
        self.datacontenttype = "application/json"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "specversion": self.specversion,
            "id": self.id,
            "type": self.type,
            "source": self.source,
            "time": self.time,
            "data": self.data,
            "datacontenttype": self.datacontenttype
        }

# Event Types
# - task.created
# - task.updated
# - task.completed
# - task.deleted
# - reminder.scheduled
# - reminder.due
```

---

## API Contracts

### Dapr Pub/Sub API

```python
# Publish event
POST http://localhost:3500/v1.0/publish/kafka-pubsub/task-events
Content-Type: application/json

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

### Dapr State API

```python
# Save state
POST http://localhost:3500/v1.0/state/statestore
Content-Type: application/json

[
  {
    "key": "conversation-conv-123",
    "value": {
      "messages": [...],
      "user_id": "user-123"
    }
  }
]

# Get state
GET http://localhost:3500/v1.0/state/statestore/conversation-conv-123
```

### Dapr Secrets API

```python
# Get secret
GET http://localhost:3500/v1.0/secrets/kubernetes-secrets/openai-api-key

Response:
{
  "openai-api-key": "sk-..."
}
```

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Dapr sidecar fails to inject | High | Low | Use annotations, verify with kubectl describe |
| Redpanda resource exhaustion | High | Medium | Start with single-node, monitor resources |
| Event ordering issues | Medium | Medium | Use partition keys for related events |
| Dapr component misconfiguration | High | Medium | Test components individually, use YAML validation |
| Network connectivity issues | Medium | Low | Use Kubernetes services, verify DNS |
| Secrets exposure | High | Low | Use Kubernetes Secrets, never commit plaintext |

---

## Definition of Done

- [ ] Dapr deployed to Kubernetes via Helm
- [ ] Redpanda deployed to Kubernetes via Helm
- [ ] 4 Dapr components configured and applied
- [ ] 3 Kafka topics created
- [ ] Backend publishes events via Dapr Pub/Sub
- [ ] Conversation service uses Dapr State API
- [ ] Secrets accessed via Dapr Secrets API
- [ ] All pods have Dapr sidecars injected
- [ ] Integration tests pass
- [ ] Event latency <100ms (p95)
- [ ] Documentation complete
- [ ] Demo video recorded (90 seconds)

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dapr deployment success | 100% | kubectl get pods -n dapr-system |
| Redpanda deployment success | 100% | kubectl get pods -n redpanda |
| Event publishing success | >99% | Application logs, Dapr metrics |
| Event latency (p95) | <100ms | Distributed tracing (Jaeger) |
| Sidecar injection success | 100% | kubectl describe pod |
| State API success rate | 100% | Application logs |
| Secrets API success rate | 100% | Application logs |

---

## Next Steps

1. **Create Tasks**: Break this plan into testable tasks (`/sp.tasks`)
2. **Deploy Infrastructure**: Execute Phase 1-2 (Dapr + Redpanda)
3. **Update Application**: Execute Phase 3 (code changes)
4. **Deploy Services**: Execute Phase 4 (Kubernetes deployments)
5. **Test & Validate**: Execute Phase 5 (integration tests)

---

**Status**: READY FOR TASKS GENERATION  
**Next Command**: `/sp.tasks` to create testable implementation tasks
