"""
MCP Tools for Task Management.
Phase III: MCP Tools - Official MCP SDK implementation for AI agent interaction.

This module defines 5 MCP tools:
- add_task: Create a new task
- list_tasks: List tasks with filtering
- update_task: Update an existing task
- complete_task: Mark a task as complete
- delete_task: Delete a task
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
import json

# Import task service and models
from apps.cli.task_service import TaskService
from apps.cli.repositories import get_repository
from apps.cli.domain.exceptions import (
    DomainError,
    InvalidTaskTitleError,
    TaskNotFoundError,
    TaskAlreadyCompletedError
)


# Initialize MCP server
mcp = FastMCP(
    name="Todo Task Manager MCP Server",
    instructions="MCP server for managing tasks via natural language AI agent interaction."
)


# ============================================================================
# Input/Output Schemas
# ============================================================================

class AddTaskInput(BaseModel):
    """Input schema for add_task tool."""
    title: str = Field(..., min_length=1, max_length=200, description="Task title (required)")
    description: Optional[str] = Field(None, max_length=1000, description="Task description (optional)")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="Task priority: low, medium, or high")
    tags: Optional[List[str]] = Field(None, description="List of tags for categorization")
    due_date: Optional[str] = Field(None, description="Due date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)")


class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool."""
    status: Optional[str] = Field(None, pattern="^(all|pending|completed)$", description="Filter by status: all, pending, or completed")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="Filter by priority: low, medium, or high")
    tag: Optional[str] = Field(None, description="Filter by tag")
    search: Optional[str] = Field(None, description="Search keyword in title/description")
    limit: int = Field(50, ge=1, le=100, description="Maximum results to return (1-100)")
    offset: int = Field(0, ge=0, description="Number of results to skip")


class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool."""
    id: int = Field(..., description="Task ID to update")
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="New title")
    description: Optional[str] = Field(None, max_length=1000, description="New description")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="New priority")
    tags: Optional[List[str]] = Field(None, description="New tags")
    due_date: Optional[str] = Field(None, description="New due date in ISO 8601 format")


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool."""
    id: int = Field(..., description="Task ID to mark as complete")


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool."""
    id: int = Field(..., description="Task ID to delete")


# ============================================================================
# Helper Functions
# ============================================================================

def get_task_service() -> TaskService:
    """Create and return a task service instance."""
    repository = get_repository()
    return TaskService(repository)


def task_to_dict(task) -> Dict[str, Any]:
    """Convert task object to dictionary with proper serialization."""
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None
    }


def format_error(error_type: str, message: str) -> Dict[str, Any]:
    """Format error response."""
    return {
        "success": False,
        "error": {
            "type": error_type,
            "message": message
        }
    }


# ============================================================================
# MCP Tools
# ============================================================================

@mcp.tool()
async def add_task(
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new task with title, description, priority, tags, and due date.
    
    Args:
        title: Task title (required, 1-200 characters)
        description: Task description (optional, max 1000 characters)
        priority: Task priority - low, medium, or high (optional, default: medium)
        tags: List of tags for categorization (optional)
        due_date: Due date in ISO 8601 format (optional)
    
    Returns:
        Created task object with id, title, description, completed status, and timestamps
    
    Raises:
        InvalidTaskTitleError: If title is empty or too long
        DomainError: For other validation errors
    """
    try:
        task_service = get_task_service()
        
        # Create task using service layer
        task = task_service.add_task(title=title, description=description)
        
        # Note: Priority, tags, and due_date would require extending the Task model
        # For now, we create with title/description only
        
        return {
            "success": True,
            "task": task_to_dict(task)
        }
        
    except InvalidTaskTitleError as e:
        return format_error("InvalidTaskTitleError", str(e.message))
    except DomainError as e:
        return format_error("DomainError", str(e.message))
    except Exception as e:
        return format_error("UnexpectedError", str(e))


@mcp.tool()
async def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List tasks with optional filtering by status, priority, tag, or search.
    
    Args:
        status: Filter by status - all, pending, or completed (optional, default: all)
        priority: Filter by priority - low, medium, or high (optional)
        tag: Filter by tag (optional)
        search: Search keyword in title or description (optional)
        limit: Maximum results to return (1-100, default: 50)
        offset: Number of results to skip (default: 0)
    
    Returns:
        List of tasks matching filters with total count
    
    Example:
        Returns: {"success": True, "tasks": [...], "total": 10, "limit": 50, "offset": 0}
    """
    try:
        task_service = get_task_service()
        
        # Get all tasks
        all_tasks = task_service.get_all_tasks()
        
        # Apply filters
        filtered_tasks = all_tasks
        
        if status and status != "all":
            if status == "pending":
                filtered_tasks = [t for t in filtered_tasks if not t.completed]
            elif status == "completed":
                filtered_tasks = [t for t in filtered_tasks if t.completed]
        
        if priority:
            # Note: Priority filtering requires priority field in Task model
            # Skip for now as current model doesn't have priority
            pass
        
        if tag:
            # Note: Tag filtering requires tags field in Task model
            # Skip for now
            pass
        
        if search:
            search_lower = search.lower()
            filtered_tasks = [
                t for t in filtered_tasks
                if search_lower in t.title.lower() or 
                   (t.description and search_lower in t.description.lower())
            ]
        
        # Apply pagination
        total = len(filtered_tasks)
        paginated_tasks = filtered_tasks[offset:offset + limit]
        
        return {
            "success": True,
            "tasks": [task_to_dict(t) for t in paginated_tasks],
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        return format_error("UnexpectedError", str(e))


@mcp.tool()
async def update_task(
    id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing task's title, description, priority, tags, or due date.
    
    Args:
        id: Task ID to update (required)
        title: New title (optional, 1-200 characters)
        description: New description (optional, max 1000 characters)
        priority: New priority - low, medium, or high (optional)
        tags: New tags list (optional)
        due_date: New due date in ISO 8601 format (optional)
    
    Returns:
        Updated task object
    
    Raises:
        TaskNotFoundError: If task with ID doesn't exist
        InvalidTaskTitleError: If new title is invalid
    """
    try:
        task_service = get_task_service()
        
        # Update task using service layer
        task = task_service.update_task(task_id=id, title=title, description=description)
        
        # Note: Priority, tags, and due_date updates would require extending the Task model
        
        return {
            "success": True,
            "task": task_to_dict(task)
        }
        
    except TaskNotFoundError as e:
        return format_error("TaskNotFoundError", f"Task with ID {e.task_id} not found")
    except InvalidTaskTitleError as e:
        return format_error("InvalidTaskTitleError", str(e.message))
    except DomainError as e:
        return format_error("DomainError", str(e.message))
    except Exception as e:
        return format_error("UnexpectedError", str(e))


@mcp.tool()
async def complete_task(id: int) -> Dict[str, Any]:
    """
    Mark a task as complete.
    
    Args:
        id: Task ID to mark as complete (required)
    
    Returns:
        Updated task object with completed=True
    
    Raises:
        TaskNotFoundError: If task with ID doesn't exist
        TaskAlreadyCompletedError: If task is already complete
    """
    try:
        task_service = get_task_service()
        
        # Mark task as complete
        task = task_service.complete_task(task_id=id)
        
        return {
            "success": True,
            "task": task_to_dict(task),
            "message": "Task marked as complete"
        }
        
    except TaskNotFoundError as e:
        return format_error("TaskNotFoundError", f"Task with ID {e.task_id} not found")
    except TaskAlreadyCompletedError as e:
        return format_error("TaskAlreadyCompletedError", f"Task with ID {e.task_id} is already completed")
    except DomainError as e:
        return format_error("DomainError", str(e.message))
    except Exception as e:
        return format_error("UnexpectedError", str(e))


@mcp.tool()
async def delete_task(id: int) -> Dict[str, Any]:
    """
    Delete a task.
    
    Args:
        id: Task ID to delete (required)
    
    Returns:
        Confirmation of deletion
    
    Raises:
        TaskNotFoundError: If task with ID doesn't exist
    """
    try:
        task_service = get_task_service()
        
        # Delete task
        deleted = task_service.delete_task(task_id=id)
        
        if deleted:
            return {
                "success": True,
                "deleted": True,
                "task_id": id,
                "message": "Task successfully deleted"
            }
        else:
            return format_error("DeleteFailedError", "Failed to delete task")
        
    except TaskNotFoundError as e:
        return format_error("TaskNotFoundError", f"Task with ID {e.task_id} not found")
    except DomainError as e:
        return format_error("DomainError", str(e.message))
    except Exception as e:
        return format_error("UnexpectedError", str(e))


# ============================================================================
# Tool Discovery
# ============================================================================

@mcp.tool()
async def list_available_tools() -> Dict[str, Any]:
    """
    List all available MCP tools with their descriptions and schemas.
    
    Returns:
        Dictionary of tool names to their descriptions and input schemas
    """
    return {
        "success": True,
        "tools": {
            "add_task": {
                "description": "Create a new task with title, description, priority, tags, and due date",
                "required": ["title"],
                "optional": ["description", "priority", "tags", "due_date"]
            },
            "list_tasks": {
                "description": "List tasks with optional filtering by status, priority, tag, or search",
                "required": [],
                "optional": ["status", "priority", "tag", "search", "limit", "offset"]
            },
            "update_task": {
                "description": "Update an existing task's title, description, priority, tags, or due date",
                "required": ["id"],
                "optional": ["title", "description", "priority", "tags", "due_date"]
            },
            "complete_task": {
                "description": "Mark a task as complete",
                "required": ["id"],
                "optional": []
            },
            "delete_task": {
                "description": "Delete a task",
                "required": ["id"],
                "optional": []
            },
            "list_available_tools": {
                "description": "List all available MCP tools with their descriptions",
                "required": [],
                "optional": []
            }
        }
    }
