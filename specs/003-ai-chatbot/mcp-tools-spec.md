# Feature Specification: MCP Tools for Phase III AI Chatbot

**Feature Branch**: `003-ai-chatbot-mcp-tools`  
**Created**: 2026-03-26  
**Status**: Draft  
**Parent Spec**: `specs/003-ai-chatbot/spec.md`  
**Input**: Hackathon II Analysis - Gap #1: MCP Tools Implementation (Phase III)

---

## Purpose

This specification defines the **MCP (Model Context Protocol) Tools** required for the Phase III AI Chatbot to interact with the backend task management system. These tools provide a standardized interface for the AI agent to perform task operations via the Official MCP SDK.

**Why this spec**: The Hackathon II requirements (Page 19-21) mandate that "the chatbot must manage tasks through natural language via MCP tools" using the "Official MCP SDK". This spec addresses the identified gap in the current implementation.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MCP Tool-Based Task Management (Priority: P0)

As an AI agent, I want to invoke standardized MCP tools so that I can manage tasks on behalf of users through natural language conversations.

**Why this priority**: This is the core infrastructure that enables the AI chatbot to perform actual task operations. Without MCP tools, the AI cannot interact with the backend system.

**Independent Test**: The MCP server should expose 5 tools (add_task, list_tasks, update_task, complete_task, delete_task) that can be invoked by the AI agent and return deterministic results.

**Acceptance Scenarios**:

1. **Given** the MCP server is running, **When** the AI agent invokes `add_task` with title "Buy groceries", **Then** a task is created in the database and the tool returns the created task with ID
2. **Given** there are 10 tasks in the database, **When** the AI agent invokes `list_tasks` with status "pending", **Then** only incomplete tasks are returned with their details
3. **Given** a task with ID 5 exists, **When** the AI agent invokes `update_task` with id=5 and new title "Updated title", **Then** the task is updated and the updated task is returned
4. **Given** a pending task exists, **When** the AI agent invokes `complete_task` with the task ID, **Then** the task status is set to complete and confirmation is returned
5. **Given** a task exists, **When** the AI agent invokes `delete_task` with the task ID, **Then** the task is removed and deletion confirmation is returned

---

### User Story 2 - Stateless Conversation Architecture (Priority: P1)

As a system architect, I want conversations to be stored in the database so that the server is stateless and can scale horizontally.

**Why this priority**: The Hackathon document (Page 20) emphasizes "Stateless Server" architecture where "Server holds NO state (ready for next request)" and conversations are stored in the database.

**Independent Test**: After server restart, conversation history should be retrievable from the database, and any server instance should be able to continue any conversation.

**Acceptance Scenarios**:

1. **Given** a user has a conversation with 5 messages, **When** the server restarts, **Then** the conversation history is preserved and accessible
2. **Given** a conversation is stored in the database, **When** any server instance receives a request, **Then** it can fetch the conversation and continue seamlessly
3. **Given** high load with 100 concurrent conversations, **When** requests are routed to different server instances, **Then** all conversations maintain context correctly

---

### User Story 3 - Error Handling and Validation (Priority: P1)

As an AI agent, I want clear error messages when tool invocations fail so that I can communicate issues to users and retry appropriately.

**Why this priority**: Robust error handling is essential for production reliability and user trust.

**Independent Test**: Each MCP tool should validate inputs and return structured errors for common failure modes.

**Acceptance Scenarios**:

1. **Given** the AI invokes `add_task` with empty title, **When** validation runs, **Then** a clear error is returned: "Title is required and cannot be empty"
2. **Given** the AI invokes `update_task` with non-existent ID, **When** the operation runs, **Then** an error is returned: "Task with ID X not found"
3. **Given** the database is temporarily unavailable, **When** any tool is invoked, **Then** a graceful error is returned: "Service temporarily unavailable, please try again"

---

### Edge Cases

- What happens when two AI agents try to update the same task simultaneously?
- How does the system handle very long conversation histories (1000+ messages)?
- What occurs when MCP tool invocation times out (>30 seconds)?
- How does the system handle malformed tool arguments from the AI?
- What happens when the AI tries to invoke a tool that doesn't exist?

---

## Requirements *(mandatory)*

### Functional Requirements

#### MCP Server Requirements

- **FR-MCP-001**: System MUST implement an MCP server using the Official MCP SDK (Python)
- **FR-MCP-002**: System MUST expose exactly 5 MCP tools: `add_task`, `list_tasks`, `update_task`, `complete_task`, `delete_task`
- **FR-MCP-003**: System MUST define tool schemas using MCP SDK's tool definition format
- **FR-MCP-004**: System MUST validate all tool inputs before executing operations
- **FR-MCP-005**: System MUST return structured responses with success/failure status and data/errors
- **FR-MCP-006**: System MUST log all tool invocations with timestamps, arguments, and results
- **FR-MCP-007**: System MUST handle concurrent tool invocations safely with proper locking
- **FR-MCP-008**: System MUST implement timeouts for tool invocations (max 30 seconds)
- **FR-MCP-009**: System MUST support tool discovery (list available tools with descriptions)
- **FR-MCP-010**: System MUST integrate with the existing task service layer (apps/cli/task_service.py)

#### Tool-Specific Requirements

**add_task Tool:**
- **FR-TOOL-001**: MUST accept parameters: title (required), description (optional), priority (optional: low/medium/high), tags (optional: array), due_date (optional: ISO 8601)
- **FR-TOOL-002**: MUST return: task object with id, title, description, completed, created_at, updated_at
- **FR-TOOL-003**: MUST validate: title non-empty, max 200 characters; description max 1000 characters
- **FR-TOOL-004**: MUST handle: duplicate titles (allow), invalid priority (reject), invalid date format (reject)

**list_tasks Tool:**
- **FR-TOOL-005**: MUST accept parameters: status (optional: all/pending/completed), priority (optional: low/medium/high), tag (optional: string), search (optional: keyword)
- **FR-TOOL-006**: MUST return: array of task objects matching filters, sorted by created_at descending
- **FR-TOOL-007**: MUST support: pagination (limit, offset) for large result sets
- **FR-TOOL-008**: MUST handle: no results (return empty array), invalid filters (return error)

**update_task Tool:**
- **FR-TOOL-009**: MUST accept parameters: id (required), title (optional), description (optional), priority (optional), tags (optional), due_date (optional)
- **FR-TOOL-010**: MUST return: updated task object or error if not found
- **FR-TOOL-011**: MUST validate: task exists, at least one field to update provided
- **FR-TOOL-012**: MUST handle: partial updates (only update provided fields), concurrent updates (last-write-wins)

**complete_task Tool:**
- **FR-TOOL-013**: MUST accept parameters: id (required)
- **FR-TOOL-014**: MUST return: updated task object with completed=true
- **FR-TOOL-015**: MUST validate: task exists
- **FR-TOOL-016**: MUST handle: already completed tasks (return as-is with note)

**delete_task Tool:**
- **FR-TOOL-017**: MUST accept parameters: id (required)
- **FR-TOOL-018**: MUST return: confirmation object with deleted task ID
- **FR-TOOL-019**: MUST validate: task exists
- **FR-TOOL-020**: MUST handle: non-existent task (return error)

#### Conversation Storage Requirements

- **FR-CONV-001**: System MUST implement a Conversation model in the database
- **FR-CONV-002**: System MUST store: conversation_id, user_id, messages (array), created_at, updated_at
- **FR-CONV-003**: System MUST implement stateless request handling (no in-memory conversation state)
- **FR-CONV-004**: System MUST fetch conversation from database on each request
- **FR-CONV-005**: System MUST store user messages before AI processing
- **FR-CONV-006**: System MUST store assistant responses after AI processing
- **FR-CONV-007**: System MUST support conversation retrieval by user_id
- **FR-CONV-008**: System MUST implement conversation cleanup (archive/delete old conversations)

---

### Key Entities

#### MCP Tool
A standardized interface exposed by the MCP server that the AI agent can invoke. Each tool has:
- **name**: Unique identifier (e.g., "add_task")
- **description**: Human-readable purpose
- **inputSchema**: JSON Schema defining accepted parameters
- **handler**: Function that executes the tool logic

#### MCP Server
A Python service that:
- Hosts MCP tools
- Handles tool invocation requests
- Validates inputs
- Executes business logic via task service
- Returns structured responses

#### Conversation
Represents a user session with the AI agent:
- **id**: UUID, primary key
- **user_id**: String, identifies the user
- **messages**: Array of message objects (role, content, timestamp)
- **created_at**: DateTime, when conversation started
- **updated_at**: DateTime, last message timestamp

#### Message
A single exchange in a conversation:
- **role**: "user" | "assistant" | "system"
- **content**: String, the message text
- **timestamp**: DateTime, when message was added
- **tool_calls**: Optional array of tool invocations (for assistant messages)
- **tool_results**: Optional array of tool results (for tool responses)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-MCP-001**: All 5 MCP tools are implemented and pass unit tests with 100% code coverage
- **SC-MCP-002**: MCP server starts successfully and registers all tools with MCP SDK
- **SC-MCP-003**: Tool invocations complete within 500ms average (excluding AI processing time)
- **SC-MCP-004**: Input validation catches 100% of invalid requests before database operations
- **SC-MCP-005**: Conversation storage and retrieval works correctly after server restarts
- **SC-MCP-006**: System handles 100 concurrent tool invocations without errors
- **SC-MCP-007**: Error messages are clear and actionable for all failure modes
- **SC-MCP-008**: MCP server integrates successfully with AI agent (OpenAI Agents SDK)
- **SC-MCP-009**: All tool schemas are documented and discoverable
- **SC-MCP-010**: Stateless architecture allows horizontal scaling (any server can handle any request)

---

## Integration Points

### Existing Systems

| System | Integration Method | Notes |
|--------|-------------------|-------|
| Task Service (apps/cli/task_service.py) | Direct import | Reuse existing business logic |
| Database (SQLite via SQLModel) | SQLModel models | Use existing Task model |
| Frontend (OpenAI ChatKit) | MCP server endpoint | AI agent invokes tools |
| OpenAI Agents SDK | MCP client | Agent discovers and calls tools |

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| MCP Server | `backend/mcp_server.py` | Host MCP tools |
| Tool Definitions | `backend/mcp/tools.py` | Define tool schemas and handlers |
| Conversation Model | `backend/models/conversation.py` | Store conversations |
| Conversation Service | `backend/services/conversation_service.py` | Manage conversation CRUD |

---

## Out of Scope

- AI agent implementation (uses existing advanced-agent.js or new Python agent)
- Frontend ChatKit UI changes (uses existing chat interface)
- Voice command processing (separate feature)
- Urdu language processing (separate feature)
- Dapr/Kafka integration (Phase V)

---

## Dependencies

### Required Libraries

```python
# MCP SDK
mcp>=1.0.0  # Official MCP SDK

# Existing dependencies (already in requirements.txt)
fastapi>=0.100.0
sqlmodel>=0.0.8
uvicorn>=0.23.0
pydantic>=2.0.0
```

### Infrastructure

- Python 3.11+
- SQLite database (existing)
- Port 8000 (existing backend) or new port 8002 (MCP server)

---

## Migration from Current State

### Current State
- ⚠️ Natural language processing in `advanced-agent.js` (Node.js)
- ⚠️ Direct API calls to backend endpoints
- ⚠️ No MCP SDK integration
- ⚠️ Conversations stored in-memory (not persistent)

### Target State
- ✅ MCP server in Python with Official MCP SDK
- ✅ AI agent invokes tools via MCP protocol
- ✅ Conversations stored in database
- ✅ Stateless server architecture

### Migration Steps
1. Create MCP server with tool definitions
2. Implement conversation model and storage
3. Test MCP tools independently
4. Update AI agent to use MCP tools (or create new Python agent)
5. Deploy and integrate with frontend

---

## Prompt Text

```
$ARGUMENTS
```

---

## Related Documents

- **Parent Spec**: `specs/003-ai-chatbot/spec.md`
- **Hackathon II Doc**: `Hackathon II - Todo Spec-Driven Development.PDF` (Pages 19-21)
- **MCP SDK Docs**: https://github.com/modelcontextprotocol/python-sdk
- **Analysis Report**: `docs/HACKATHON_II_ANALYSIS.md`

---

**Next Step**: Generate architecture plan with `/sp.plan` command
