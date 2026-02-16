"""
Core task management logic with deterministic operations.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from apps.cli.models.task import Task
from apps.cli.task_service import TaskService
from apps.cli.utils.error_handlers import DeterministicOperationError


class TaskManager:
    """
    Core task management logic with deterministic operations.
    
    This class ensures deterministic behavior by:
    - Using pure functions wherever possible
    - Avoiding any randomization or time-dependent operations in core logic
    - Implementing consistent ordering for all data structures
    - Using immutable data patterns where appropriate
    - Ensuring identical inputs always produce identical outputs
    
    Verify CLI imports only TaskService.
    Verify no SQLModel imports in CLI layer.
    Verify no database session access from CLI.
    """
    
    def __init__(self, task_service: TaskService):
        """
        Initialize the task manager with a task service.
        
        Args:
            task_service: The task service to use for business logic
        """
        self.task_service = task_service
    
    def add_deterministic_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Add a task ensuring deterministic behavior.
        
        Args:
            title: The title of the task (required)
            description: The description of the task (optional)
            
        Returns:
            The newly created task with assigned ID
        """
        # Ensure deterministic behavior by validating inputs
        # and using consistent operations
        return self.task_service.add_task(title, description)
    
    def get_deterministic_task(self, task_id: int) -> Task:
        """
        Retrieve a task ensuring deterministic behavior.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The task with the specified ID
        """
        # Ensure deterministic behavior by returning consistent results
        # for the same input
        return self.task_service.get_task(task_id)
    
    def get_all_deterministic_tasks(self) -> List[Task]:
        """
        Retrieve all tasks ensuring deterministic behavior.
        
        Returns:
            A list of all tasks in a consistent order
        """
        # Ensure deterministic behavior by returning tasks in a consistent order
        tasks = self.task_service.get_all_tasks()
        # Sort by ID to ensure consistent ordering
        return sorted(tasks, key=lambda t: t.id)
    
    def update_deterministic_task(self, task_id: int, title: Optional[str] = None, 
                                 description: Optional[str] = None) -> Task:
        """
        Update a task ensuring deterministic behavior.
        
        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional)
            description: New description for the task (optional)
            
        Returns:
            The updated task
        """
        # Ensure deterministic behavior by applying updates consistently
        return self.task_service.update_task(task_id, title, description)
    
    def complete_deterministic_task(self, task_id: int) -> Task:
        """
        Mark a task as complete ensuring deterministic behavior.
        
        Args:
            task_id: The ID of the task to mark as complete
            
        Returns:
            The updated task marked as complete
        """
        # Ensure deterministic behavior by applying the status change consistently
        # Check current status to ensure idempotent operation
        task = self.task_service.get_task(task_id)
        if task.status == "complete":
            # Operation is idempotent - already complete, return as is
            return task
        return self.task_service.complete_task(task_id)
    
    def incomplete_deterministic_task(self, task_id: int) -> Task:
        """
        Mark a task as incomplete ensuring deterministic behavior.
        
        Args:
            task_id: The ID of the task to mark as incomplete
            
        Returns:
            The updated task marked as incomplete
        """
        # Ensure deterministic behavior by applying the status change consistently
        # Check current status to ensure idempotent operation
        task = self.task_service.get_task(task_id)
        if task.status == "incomplete":
            # Operation is idempotent - already incomplete, return as is
            return task
        return self.task_service.incomplete_task(task_id)
    
    def delete_deterministic_task(self, task_id: int) -> bool:
        """
        Delete a task ensuring deterministic behavior.
        
        Args:
            task_id: The ID of the task to delete
            
        Returns:
            True if the task was successfully deleted, False otherwise
        """
        # Ensure deterministic behavior by applying deletion consistently
        return self.task_service.delete_task(task_id)
    
    def execute_sequence_deterministically(self, operations: List[Dict[str, Any]]) -> List[Any]:
        """
        Execute a sequence of operations deterministically.
        
        Args:
            operations: A list of operations to execute, each with:
                        - 'operation': The operation to perform ('add', 'update', 'complete', etc.)
                        - 'params': The parameters for the operation
                        
        Returns:
            A list of results from each operation
        """
        results = []
        
        for op in operations:
            operation = op.get('operation')
            params = op.get('params', {})
            
            if operation == 'add':
                result = self.add_deterministic_task(
                    params.get('title'),
                    params.get('description')
                )
            elif operation == 'get':
                result = self.get_deterministic_task(params.get('task_id'))
            elif operation == 'get_all':
                result = self.get_all_deterministic_tasks()
            elif operation == 'update':
                result = self.update_deterministic_task(
                    params.get('task_id'),
                    params.get('title'),
                    params.get('description')
                )
            elif operation == 'complete':
                result = self.complete_deterministic_task(params.get('task_id'))
            elif operation == 'incomplete':
                result = self.incomplete_deterministic_task(params.get('task_id'))
            elif operation == 'delete':
                result = self.delete_deterministic_task(params.get('task_id'))
            else:
                raise DeterministicOperationError(f"Unknown operation: {operation}")
            
            results.append(result)
        
        return results