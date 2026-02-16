"""
Task business logic with validation and error handling.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from apps.cli.models.task import Task
from apps.cli.task_collection import TaskCollection
from apps.cli.utils.validators import validate_title, validate_description, validate_status
from apps.cli.utils.error_handlers import ValidationError, NotFoundError, handle_operation


class TaskService:
    """
    Task business logic with validation and error handling.
    
    This service handles all business logic related to tasks including:
    - Creating new tasks
    - Retrieving tasks
    - Updating tasks
    - Deleting tasks
    - Validating task data
    """
    
    def __init__(self):
        """Initialize the task service with an empty collection."""
        self.collection = TaskCollection()
    
    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Add a new task with the given title and description.
        
        Args:
            title: The title of the task (required)
            description: The description of the task (optional)
            
        Returns:
            The newly created task with assigned ID
            
        Raises:
            ValidationError: If the title is invalid
        """
        # Validate inputs
        validate_title(title)
        validate_description(description)
        
        # Create a new task
        task = Task(task_id=None, title=title, description=description, status="incomplete")
        
        # Add the task to the collection
        return self.collection.add(task)
    
    def get_task(self, task_id: int) -> Task:
        """
        Retrieve a task by its ID.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The task with the specified ID
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        return self.collection.get_by_id(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks in the collection.
        
        Returns:
            A list of all tasks in the collection
        """
        return self.collection.get_all()
    
    def update_task(self, task_id: int, title: Optional[str] = None, 
                    description: Optional[str] = None) -> Task:
        """
        Update a task with the given ID.
        
        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional)
            description: New description for the task (optional)
            
        Returns:
            The updated task
            
        Raises:
            NotFoundError: If no task with the given ID exists
            ValidationError: If the new title is invalid
        """
        # Validate inputs if provided
        if title is not None:
            validate_title(title)
        if description is not None:
            validate_description(description)
        
        # Prepare updates
        updates = {}
        if title is not None:
            updates['title'] = title
        if description is not None:
            updates['description'] = description
        
        # Update the task in the collection
        return self.collection.update(task_id, updates)
    
    def update_task_status(self, task_id: int, status: str) -> Task:
        """
        Update the status of a task with the given ID.
        
        Args:
            task_id: The ID of the task to update
            status: New status for the task ("incomplete" or "complete")
            
        Returns:
            The updated task
            
        Raises:
            NotFoundError: If no task with the given ID exists
            ValidationError: If the status is invalid
        """
        validate_status(status)
        
        # Update the task in the collection
        return self.collection.update(task_id, {'status': status})
    
    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task with the given ID.
        
        Args:
            task_id: The ID of the task to delete
            
        Returns:
            True if the task was successfully deleted, False otherwise
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        return self.collection.delete(task_id)
    
    def complete_task(self, task_id: int) -> Task:
        """
        Mark a task as complete.
        
        Args:
            task_id: The ID of the task to mark as complete
            
        Returns:
            The updated task marked as complete
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        return self.update_task_status(task_id, "complete")
    
    def incomplete_task(self, task_id: int) -> Task:
        """
        Mark a task as incomplete.
        
        Args:
            task_id: The ID of the task to mark as incomplete
            
        Returns:
            The updated task marked as incomplete
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        return self.update_task_status(task_id, "incomplete")
    
    def get_next_task_id(self) -> int:
        """
        Get the next available task ID.
        
        Returns:
            The next available task ID
        """
        # This is a simplified approach - in a real implementation, 
        # we'd need to access the collection's internal counter
        all_tasks = self.get_all_tasks()
        if not all_tasks:
            return 1
        return max(task.id for task in all_tasks) + 1