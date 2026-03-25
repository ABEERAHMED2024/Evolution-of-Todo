# Implementation Plan: MCP Tools for Phase III AI Chatbot

**Branch**: `003-ai-chatbot-mcp-tools` | **Date**: 2026-03-26 | **Spec**: `specs/003-ai-chatbot/mcp-tools-spec.md`
**Input**: Feature specification from `/specs/003-ai-chatbot/mcp-tools-spec.md`

---

## Summary

**Primary Requirement**: Implement MCP (Model Context Protocol) server with 5 tools (add_task, list_tasks, update_task, complete_task, delete_task) to enable AI agent interaction with the task management backend.

**Technical Approach**: Build Python MCP server using Official MCP SDK, integrate with existing task service layer, implement stateless conversation architecture with database storage, and ensure robust input validation and error handling.

---

## Technical Context

**Language/Version**: Python 3.11+

**Primary Dependencies**:
- `mcp>=1.0.0` - Official MCP SDK (new)
- `fastapi==0.104.1` - Existing backend framework
- `sqlmodel==0.0.16` - ORM for database operations
- `uvicorn==0.24.0` - ASGI server
- `pydantic==2.5.0` - Data validation

**Storage**: SQLite database (existing) with new Conversation model

**Testing**: pytest for unit tests, integration tests for MCP tools

**Target Platform**: Linux/Windows/macOS server, Kubernetes deployment (Phase IV/V)

**Project Type**: Single backend service (MCP server)

**Performance Goals**:
- Tool invocation latency: <500ms average (excluding AI processing)
- Concurrent invocations: Support 100+ simultaneous requests
- Input validation: 100% of invalid requests caught before DB operations

**Constraints**:
- Must integrate with existing task service (apps/cli/task_service.py)
- Must use Official MCP SDK (Hackathon II requirement)
- Must implement stateless architecture (conversations in DB)
- Backward compatible with existing Phase III implementation

**Scale/Scope**:
- 5 MCP tools
- 1 conversation model
- 1 MCP server
- Full test coverage required

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Compliance

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **Spec-Driven Development** | ✅ PASS | Spec created first (`mcp-tools-spec.md`) |
| **No Manual Coding** | ✅ PASS | All code will be generated via Qwen Code |
| **Deterministic Behavior** | ✅ PASS | Tools have deterministic inputs/outputs |
| **Single Source of Truth** | ✅ PASS | Spec is authoritative; plan derives from it |
| **Cloud-Native by Design** | ✅ PASS | Stateless architecture enables K8s deployment |
| **Agentic Dev Stack** | ✅ PASS | MCP tools enable agent decomposition |
| **Phase Order Respect** | ✅ PASS | Phase III before Phase V (Dapr/Kafka later) |
| **Testability** | ✅ PASS | All tools have acceptance criteria |
| **Backward Compatibility** | ✅ PASS | Integrates with existing backend |

**Result**: ✅ **PASS** - All constitution principles satisfied. Proceed to implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot/
├── spec.md                  # Parent Phase III spec
├── mcp-tools-spec.md        # This feature spec (created)
├── mcp-tools-plan.md        # This file (created)
├── mcp-tools-tasks.md       # Phase 2 output (TODO: create)
├── research.md              # MCP SDK research (TODO: create)
├── data-model.md            # Conversation model (TODO: create)
├── quickstart.md            # Setup guide (TODO: create)
└── contracts/               # API contracts (TODO: create)
    └── mcp-tools-api.md
```

### Source Code (repository structure)

```text
backend/
├── mcp_server.py            # MCP server entry point (NEW)
├── mcp/
│   ├── __init__.py
│   ├── tools.py             # Tool definitions and handlers (NEW)
│   └── schemas.py           # Pydantic schemas for tools (NEW)
├── models/
│   ├── __init__.py
│   ├── task.py              # Existing Task model
│   └── conversation.py      # Conversation model (NEW)
├── services/
│   ├── __init__.py
│   ├── task_service.py      # Existing (or import from apps/cli)
│   └── conversation_service.py  # Conversation CRUD (NEW)
└── tests/
    ├── __init__.py
    ├── test_mcp_tools.py    # MCP tool tests (NEW)
    └── test_conversation.py # Conversation tests (NEW)

apps/cli/
└── task_service.py          # Existing - will be reused/extended
```

**Structure Decision**: Single project structure with MCP server as new module in backend/. Reuse existing task service from apps/cli to avoid duplication.

---

## Architecture Overview

### MCP Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Agent                                │
│              (OpenAI Agents SDK / Qwen Code)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tool Router                                          │   │
│  │  - add_task                                           │   │
│  │  - list_tasks                                         │   │
│  │  - update_task                                        │   │
│  │  - complete_task                                      │   │
│  │  - delete_task                                        │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  Validation Layer (Pydantic)                          │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  Task Service (apps/cli/task_service.py)              │   │
│  └──────────────────┬───────────────────────────────────┘   │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  SQLite Database                             │
│  - tasks table (existing)                                    │
│  - conversations table (new)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Stateless Conversation Flow

```
1. User sends message
         │
         ▼
2. Fetch conversation from DB
         │
         ▼
3. Build message array (history + new message)
         │
         ▼
4. Store user message in DB
         │
         ▼
5. Run AI agent with MCP tools
         │
         ▼
6. Agent invokes MCP tool(s)
         │
         ▼
7. Store assistant response in DB
         │
         ▼
8. Return response to user
         │
         ▼
9. Server holds NO state (ready for next request)
```

---

## Data Model

### Conversation Model (New)

```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True)  # Identifies user
    messages: List[Message] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime, onupdate=datetime.utcnow))
```

### Message Schema

```python
class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[List[ToolCall]] = None
    tool_results: Optional[List[ToolResult]] = None
```

---

## API Contracts

### MCP Tool Schemas

#### add_task
```json
{
  "name": "add_task",
  "description": "Create a new task with title, description, priority, tags, and due date",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": {"type": "string", "minLength": 1, "maxLength": 200},
      "description": {"type": "string", "maxLength": 1000},
      "priority": {"type": "string", "enum": ["low", "medium", "high"]},
      "tags": {"type": "array", "items": {"type": "string"}},
      "due_date": {"type": "string", "format": "date-time"}
    },
    "required": ["title"]
  }
}
```

#### list_tasks
```json
{
  "name": "list_tasks",
  "description": "List tasks with optional filtering by status, priority, tag, or search",
  "inputSchema": {
    "type": "object",
    "properties": {
      "status": {"type": "string", "enum": ["all", "pending", "completed"]},
      "priority": {"type": "string", "enum": ["low", "medium", "high"]},
      "tag": {"type": "string"},
      "search": {"type": "string"},
      "limit": {"type": "integer", "default": 50},
      "offset": {"type": "integer", "default": 0}
    }
  }
}
```

#### update_task
```json
{
  "name": "update_task",
  "description": "Update an existing task's title, description, priority, tags, or due date",
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": {"type": "integer"},
      "title": {"type": "string", "minLength": 1, "maxLength": 200},
      "description": {"type": "string", "maxLength": 1000},
      "priority": {"type": "string", "enum": ["low", "medium", "high"]},
      "tags": {"type": "array", "items": {"type": "string"}},
      "due_date": {"type": "string", "format": "date-time"}
    },
    "required": ["id"]
  }
}
```

#### complete_task
```json
{
  "name": "complete_task",
  "description": "Mark a task as complete",
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": {"type": "integer"}
    },
    "required": ["id"]
  }
}
```

#### delete_task
```json
{
  "name": "delete_task",
  "description": "Delete a task",
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": {"type": "integer"}
    },
    "required": ["id"]
  }
}
```

---

## Implementation Strategy

### Phase 0: Research & Setup
- [ ] Research Official MCP SDK documentation
- [ ] Install MCP SDK dependency
- [ ] Create project structure

### Phase 1: Core Implementation
- [ ] Create Conversation model
- [ ] Create conversation service
- [ ] Implement MCP server skeleton
- [ ] Implement 5 MCP tools with validation

### Phase 2: Integration
- [ ] Integrate with existing task service
- [ ] Implement stateless conversation handling
- [ ] Add error handling and logging

### Phase 3: Testing
- [ ] Write unit tests for each tool
- [ ] Write integration tests
- [ ] Test conversation persistence

### Phase 4: Deployment
- [ ] Update Docker configuration
- [ ] Test on Minikube
- [ ] Document usage

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MCP SDK incompatibility | High | Low | Use official SDK, follow docs exactly |
| Performance issues with DB | Medium | Low | Add indexes, optimize queries |
| Concurrent update conflicts | Medium | Medium | Implement optimistic locking |
| AI agent integration complexity | High | Medium | Test tools independently first |

---

## Definition of Done

- [ ] All 5 MCP tools implemented and tested
- [ ] Conversation model and service complete
- [ ] 100% test coverage for MCP tools
- [ ] Integration with existing task service verified
- [ ] Stateless architecture validated (server restart test)
- [ ] Documentation complete (quickstart, API contracts)
- [ ] Docker configuration updated
- [ ] Hackathon II Phase III compliance achieved

---

## Next Steps

1. **Create Tasks**: Break this plan into testable tasks (`/sp.tasks`)
2. **Implement**: Execute tasks one by one via Qwen Code
3. **Test**: Run all tests and validate acceptance criteria
4. **Deploy**: Update deployment configuration

---

**Status**: READY FOR TASKS GENERATION  
**Next Command**: `/sp.tasks` to create testable implementation tasks
