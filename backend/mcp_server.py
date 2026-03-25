#!/usr/bin/env python3
"""
MCP Server Entry Point.
Phase III: MCP Tools - Main server for Model Context Protocol.

This server exposes MCP tools for task management and enables
AI agents to interact with the todo system via natural language.

Usage:
    python mcp_server.py
    
Or with uvicorn for production:
    uvicorn mcp_server:app --host 0.0.0.0 --port 8002
"""
import asyncio
import logging
from typing import Any, Dict
from mcp.server.fastmcp import FastMCP

# Import tools
from backend.mcp_tools_local.tools import (
    add_task,
    list_tasks,
    update_task,
    complete_task,
    delete_task,
    list_available_tools
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Create MCP server instance
mcp_server = FastMCP(
    name="Todo MCP Server",
    instructions="""
    Todo Task Management MCP Server
    
    This server provides tools for managing tasks via natural language AI agents.
    Use these tools to help users create, view, update, and delete tasks.
    
    Available Tools:
    - add_task: Create a new task
    - list_tasks: List tasks with filtering
    - update_task: Update an existing task
    - complete_task: Mark a task as complete
    - delete_task: Delete a task
    - list_available_tools: Discover available tools
    
    Best Practices:
    1. Always confirm task creation/update with the user
    2. Ask clarifying questions when intent is ambiguous
    3. Show task details after modifications
    4. Handle errors gracefully and explain to users
    """
)


# Register tools with the server
# Note: Tools are auto-registered via @mcp.tool() decorator in tools.py
# This server just needs to run


def run_server():
    """
    Run the MCP server.
    
    The server runs using stdio transport by default,
    which is suitable for local AI agent integration.
    """
    logger.info("Starting Todo MCP Server...")
    logger.info("Available tools: add_task, list_tasks, update_task, complete_task, delete_task")
    
    # Run the MCP server
    mcp_server.run()


if __name__ == "__main__":
    run_server()
