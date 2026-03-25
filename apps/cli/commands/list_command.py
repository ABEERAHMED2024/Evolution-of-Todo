"""
List tasks command.
Phase III: Deterministic output with ISO 8601 timestamps.
"""
from typing import List

from apps.cli.task_service import TaskService


class ListCommand:
    """
    Command to list all tasks.
    Phase III: Ensures deterministic output with ISO 8601 timestamps.
    """

    def __init__(self, task_service: TaskService):
        """Initialize the list command with a task service."""
        self.task_service = task_service

    def execute(self) -> str:
        """
        Execute the list command.
        Returns tasks sorted by ID ascending with ISO 8601 timestamps.

        Returns:
            A string representation of all tasks with deterministic formatting
        """
        try:
            # Get all tasks from the task service (already sorted by ID ASC)
            tasks = self.task_service.get_all_tasks()

            if not tasks:
                return "No tasks found."

            # Format the tasks for display with deterministic output
            result_lines = []
            result_lines.append(f"Found {len(tasks)} task(s):\n")

            for task in tasks:
                # Use to_dict() for consistent ISO 8601 timestamp formatting
                task_dict = task.to_dict()
                result_lines.append(f"ID: {task_dict['id']}")
                result_lines.append(f"Title: {task_dict['title']}")
                result_lines.append(f"Description: {task_dict['description'] or 'N/A'}")
                result_lines.append(f"Completed: {task_dict['completed']}")
                result_lines.append(f"Created: {task_dict['created_at']}")
                result_lines.append(f"Updated: {task_dict['updated_at']}")
                result_lines.append("-" * 30)

            return "\n".join(result_lines)
        except Exception as e:
            return f"Error listing tasks: {str(e)}"
