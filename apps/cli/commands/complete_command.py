"""
Complete task command.
"""
from typing import Optional

from apps.cli.task_service import TaskService
from apps.cli.models.task import Task


class CompleteCommand:
    """
    Command to mark a task as complete.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the complete command with a task service.
        
        Args:
            task_service: The task service to use for completing tasks
        """
        self.task_service = task_service
    
    def execute(self, task_id: int) -> str:
        """
        Execute the complete command.
        
        Args:
            task_id: The ID of the task to mark as complete
            
        Returns:
            A string representation of the result
        """
        try:
            # Complete the task using the task service
            task = self.task_service.complete_task(task_id)
            
            # Return a success message with task details
            return f"Task marked as complete:\n{task.to_dict()}"
        except Exception as e:
            # Return an error message if something goes wrong
            return f"Error completing task: {str(e)}"