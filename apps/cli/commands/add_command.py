"""
Add task command with validation.
"""
from typing import Optional

from apps.cli.task_service import TaskService
from apps.cli.models.task import Task


class AddCommand:
    """
    Command to add a new task with validation.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the add command with a task service.
        
        Args:
            task_service: The task service to use for adding tasks
        """
        self.task_service = task_service
    
    def execute(self, title: str, description: Optional[str] = None) -> str:
        """
        Execute the add command.
        
        Args:
            title: The title of the task to add
            description: The description of the task to add (optional)
            
        Returns:
            A string representation of the result
        """
        try:
            # Add the task using the task service
            task = self.task_service.add_task(title, description)
            
            # Return a success message with task details
            return f"Task added successfully:\n{task.to_dict()}"
        except Exception as e:
            # Return an error message if something goes wrong
            return f"Error adding task: {str(e)}"