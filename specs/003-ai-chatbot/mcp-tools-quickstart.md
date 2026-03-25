# MCP Tools Quickstart Guide

**Phase III: MCP Tools for AI Chatbot**  
**Status**: Implementation Complete  
**Spec**: `specs/003-ai-chatbot/mcp-tools-spec.md`

---

## Overview

This guide shows you how to set up and use the MCP (Model Context Protocol) Tools for task management. These tools enable AI agents to interact with the Todo system via natural language.

---

## What You Get

✅ **5 MCP Tools**:
- `add_task` - Create new tasks
- `list_tasks` - List and filter tasks
- `update_task` - Update existing tasks
- `complete_task` - Mark tasks complete
- `delete_task` - Delete tasks

✅ **Stateless Architecture**: Conversations stored in database  
✅ **Official MCP SDK**: Hackathon II compliant  
✅ **Full Test Coverage**: pytest test suite included

---

## Prerequisites

- Python 3.11+
- Existing Evolution of Todo backend setup
- MCP SDK (install below)

---

## Installation

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `mcp>=1.0.0` - Official MCP SDK
- `pytest==7.4.3` - Testing framework
- `pytest-asyncio==0.21.1` - Async test support

### Step 2: Verify Installation

```bash
python -c "from mcp.server.fastmcp import FastMCP; print('MCP SDK installed ✓')"
```

---

## Running the MCP Server

### Option 1: Direct Execution (Development)

```bash
cd backend
python mcp_server.py
```

**Output**:
```
2026-03-26 10:00:00 - INFO - Starting Todo MCP Server...
2026-03-26 10:00:00 - INFO - Available tools: add_task, list_tasks, update_task, complete_task, delete_task
```

### Option 2: Uvicorn (Production)

```bash
cd backend
uvicorn mcp_server:app --host 0.0.0.0 --port 8002 --reload
```

Access at: `http://localhost:8002`

### Option 3: Docker

```bash
docker build -f backend/Dockerfile -t todo-mcp-server .
docker run -p 8002:8002 todo-mcp-server
```

---

## Using MCP Tools

### Via AI Agent (Recommended)

The MCP server is designed to work with AI agents using the MCP protocol:

```python
# Example: AI agent workflow
from mcp import Client

async with Client() as client:
    # List available tools
    tools = await client.call_tool("list_available_tools")
    
    # Add a task
    result = await client.call_tool(
        "add_task",
        arguments={
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "priority": "high"
        }
    )
    
    # List all tasks
    tasks = await client.call_tool("list_tasks", arguments={"status": "all"})
    
    # Complete a task
    await client.call_tool("complete_task", arguments={"id": 1})
```

### Direct Function Calls (Testing)

```python
import asyncio
from backend.mcp.tools import add_task, list_tasks, complete_task

async def demo():
    # Add task
    result = await add_task(
        title="Learn MCP",
        description="Study Model Context Protocol"
    )
    print(result)
    # Output: {"success": True, "task": {...}}
    
    # List tasks
    tasks = await list_tasks(status="pending", limit=10)
    print(tasks)
    # Output: {"success": True, "tasks": [...], "total": 5}
    
    # Complete task
    result = await complete_task(id=1)
    print(result)
    # Output: {"success": True, "task": {...}, "message": "Task marked as complete"}

asyncio.run(demo())
```

---

## Tool Reference

### add_task

**Purpose**: Create a new task

**Parameters**:
- `title` (required, string): Task title (1-200 chars)
- `description` (optional, string): Task description (max 1000 chars)
- `priority` (optional, string): "low", "medium", or "high"
- `tags` (optional, array): List of tag strings
- `due_date` (optional, string): ISO 8601 format (YYYY-MM-DDTHH:MM:SS)

**Example**:
```python
result = await add_task(
    title="Prepare quarterly report",
    description="Q4 financial summary",
    priority="high",
    due_date="2026-03-31T17:00:00Z"
)
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Prepare quarterly report",
    "description": "Q4 financial summary",
    "completed": false,
    "created_at": "2026-03-26T10:00:00Z",
    "updated_at": "2026-03-26T10:00:00Z"
  }
}
```

### list_tasks

**Purpose**: List tasks with filtering

**Parameters**:
- `status` (optional, string): "all", "pending", or "completed"
- `priority` (optional, string): "low", "medium", or "high"
- `tag` (optional, string): Filter by tag
- `search` (optional, string): Search keyword
- `limit` (optional, int): Max results (1-100, default: 50)
- `offset` (optional, int): Results to skip (default: 0)

**Example**:
```python
result = await list_tasks(
    status="pending",
    priority="high",
    search="report",
    limit=10,
    offset=0
)
```

**Returns**:
```json
{
  "success": true,
  "tasks": [...],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

### update_task

**Purpose**: Update an existing task

**Parameters**:
- `id` (required, int): Task ID to update
- `title` (optional, string): New title
- `description` (optional, string): New description
- `priority` (optional, string): New priority
- `tags` (optional, array): New tags
- `due_date` (optional, string): New due date

**Example**:
```python
result = await update_task(
    id=1,
    title="Updated title",
    priority="medium"
)
```

### complete_task

**Purpose**: Mark a task as complete

**Parameters**:
- `id` (required, int): Task ID

**Example**:
```python
result = await complete_task(id=1)
```

### delete_task

**Purpose**: Delete a task

**Parameters**:
- `id` (required, int): Task ID

**Example**:
```python
result = await delete_task(id=1)
```

---

## Running Tests

### Run All Tests

```bash
cd backend
pytest tests/test_mcp_tools.py -v
```

### Run Specific Test

```bash
pytest tests/test_mcp_tools.py::TestMCPTools::test_add_task_success -v
```

### Run with Coverage

```bash
pytest tests/test_mcp_tools.py --cov=backend.mcp --cov-report=html
```

---

## Architecture

### Stateless Conversation Flow

```
User Message
    ↓
Fetch Conversation from DB
    ↓
Build Message Array (history + new)
    ↓
Store User Message in DB
    ↓
Run AI Agent with MCP Tools
    ↓
Agent Invokes MCP Tool(s)
    ↓
Store Assistant Response in DB
    ↓
Return Response to User
    ↓
Server holds NO state (ready for next request)
```

### Component Diagram

```
┌─────────────────┐
│   AI Agent      │
│ (MCP Client)    │
└────────┬────────┘
         │ MCP Protocol
         ↓
┌─────────────────────────┐
│   MCP Server            │
│  ┌──────────────────┐   │
│  │  Tool Router     │   │
│  │  - add_task      │   │
│  │  - list_tasks    │   │
│  │  - update_task   │   │
│  │  - complete_task │   │
│  │  - delete_task   │   │
│  └────────┬─────────┘   │
│           │             │
│  ┌────────▼─────────┐   │
│  │  Task Service    │   │
│  └────────┬─────────┘   │
└───────────┼─────────────┘
            │
            ↓
┌─────────────────────────┐
│   SQLite Database       │
│  - tasks table          │
│  - conversations table  │
└─────────────────────────┘
```

---

## Troubleshooting

### Issue: MCP SDK import error

**Solution**:
```bash
pip install --upgrade mcp
```

### Issue: Database not found

**Solution**: Ensure database is initialized:
```bash
python -c "from sqlmodel import SQLModel; from backend.database import engine; SQLModel.metadata.create_all(engine)"
```

### Issue: Tools not registering

**Solution**: Check that `backend/mcp/__init__.py` imports all tools correctly.

---

## Next Steps

1. ✅ **MCP Tools Complete** - Core functionality implemented
2. ⏳ **AI Agent Integration** - Connect MCP server to AI agent
3. ⏳ **Frontend ChatKit** - Update UI to use MCP tools
4. ⏳ **Deployment** - Deploy to Kubernetes with Helm charts

---

## Resources

- **Specification**: `specs/003-ai-chatbot/mcp-tools-spec.md`
- **Implementation Plan**: `specs/003-ai-chatbot/mcp-tools-plan.md`
- **MCP SDK Docs**: https://github.com/modelcontextprotocol/python-sdk
- **Hackathon II Doc**: `Hackathon II - Todo Spec-Driven Development.PDF` (Pages 19-21)
- **Analysis Report**: `docs/HACKATHON_II_ANALYSIS.md`

---

**Status**: ✅ READY FOR INTEGRATION  
**Last Updated**: 2026-03-26
