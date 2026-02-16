"""
Utility functions for the task manager application.
"""
from typing import List
from datetime import datetime

from apps.cli.models.task import Task


def format_task_display(task: Task) -> str:
    """
    Format a single task for display.
    
    Args:
        task: The task to format
        
    Returns:
        A formatted string representation of the task
    """
    return (
        f"ID: {task.id}\n"
        f"Title: {task.title}\n"
        f"Description: {task.description or 'N/A'}\n"
        f"Status: {task.status}\n"
        f"Created: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Updated: {task.updated_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
    )


def format_tasks_list(tasks: List[Task]) -> str:
    """
    Format a list of tasks for display.
    
    Args:
        tasks: The list of tasks to format
        
    Returns:
        A formatted string representation of the tasks list
    """
    if not tasks:
        return "No tasks found."
    
    result_lines = [f"Found {len(tasks)} task(s):\n"]
    
    for i, task in enumerate(tasks):
        result_lines.append(format_task_display(task))
        if i < len(tasks) - 1:  # Don't add separator after the last task
            result_lines.append("-" * 40)  # Separator between tasks
    
    return "\n".join(result_lines)


def format_task_summary(task: Task) -> str:
    """
    Format a brief summary of a task for compact display.
    
    Args:
        task: The task to format
        
    Returns:
        A formatted string summary of the task
    """
    status_icon = "✓" if task.status == "complete" else "○"
    return f"{status_icon} [{task.id}] {task.title}"


def format_tasks_summary(tasks: List[Task]) -> str:
    """
    Format a list of task summaries for compact display.
    
    Args:
        tasks: The list of tasks to format
        
    Returns:
        A formatted string of task summaries
    """
    if not tasks:
        return "No tasks found."
    
    return "\n".join([format_task_summary(task) for task in tasks])


def is_valid_task_status(status: str) -> bool:
    """
    Check if a status is valid.
    
    Args:
        status: The status to check
        
    Returns:
        True if the status is valid, False otherwise
    """
    return status in ["incomplete", "complete"]


def sanitize_input(text: str) -> str:
    """
    Sanitize user input by stripping leading/trailing whitespace.
    
    Args:
        text: The input text to sanitize
        
    Returns:
        The sanitized text
    """
    if text is None:
        return None
    return text.strip()


def truncate_text(text: str, max_length: int = 50) -> str:
    """
    Truncate text to a maximum length with ellipsis.
    
    Args:
        text: The text to truncate
        max_length: The maximum length (default 50)
        
    Returns:
        The truncated text with ellipsis if needed
    """
    if not text or len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."