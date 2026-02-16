"""
List tasks command.
"""
from typing import List

from apps.cli.task_service import TaskService
from apps.cli.models.task import Task


class ListCommand:
    """
    Command to list all tasks.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the list command with a task service.
        
        Args:
            task_service: The task service to use for retrieving tasks
        """
        self.task_service = task_service
    
    def execute(self) -> str:
        """
        Execute the list command.
        
        Returns:
            A string representation of all tasks
        """
        try:
            # Get all tasks from the task service
            tasks = self.task_service.get_all_tasks()
            
            if not tasks:
                return "No tasks found."
            
            # Format the tasks for display
            result_lines = []
            result_lines.append(f"Found {len(tasks)} task(s):\n")
            
            for task in tasks:
                result_lines.append(f"ID: {task.id}")
                result_lines.append(f"Title: {task.title}")
                result_lines.append(f"Description: {task.description or 'N/A'}")
                result_lines.append(f"Status: {task.status}")
                result_lines.append(f"Created: {task.created_at}")
                result_lines.append(f"Updated: {task.updated_at}")
                result_lines.append("-" * 30)  # Separator between tasks
            
            return "\n".join(result_lines)
        except Exception as e:
            # Return an error message if something goes wrong
            return f"Error listing tasks: {str(e)}"