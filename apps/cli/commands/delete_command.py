"""
Delete task command with validation.
"""
from typing import Optional

from apps.cli.task_service import TaskService


class DeleteCommand:
    """
    Command to delete a task with validation.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the delete command with a task service.
        
        Args:
            task_service: The task service to use for deleting tasks
        """
        self.task_service = task_service
    
    def execute(self, task_id: int) -> str:
        """
        Execute the delete command.
        
        Args:
            task_id: The ID of the task to delete
            
        Returns:
            A string representation of the result
        """
        try:
            # Delete the task using the task service
            success = self.task_service.delete_task(task_id)
            
            if success:
                # Return a success message
                return f"Task with ID {task_id} deleted successfully."
            else:
                # Return a failure message
                return f"Failed to delete task with ID {task_id}."
        except Exception as e:
            # Return an error message if something goes wrong
            return f"Error deleting task: {str(e)}"