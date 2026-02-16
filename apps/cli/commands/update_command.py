"""
Update task command with validation.
"""
from typing import Optional

from apps.cli.task_service import TaskService
from apps.cli.models.task import Task


class UpdateCommand:
    """
    Command to update a task with validation.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the update command with a task service.
        
        Args:
            task_service: The task service to use for updating tasks
        """
        self.task_service = task_service
    
    def execute(self, task_id: int, title: Optional[str] = None, 
                description: Optional[str] = None) -> str:
        """
        Execute the update command.
        
        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional)
            description: New description for the task (optional)
            
        Returns:
            A string representation of the result
        """
        try:
            # Update the task using the task service
            task = self.task_service.update_task(task_id, title, description)
            
            # Return a success message with task details
            return f"Task updated successfully:\n{task.to_dict()}"
        except Exception as e:
            # Return an error message if something goes wrong
            return f"Error updating task: {str(e)}"