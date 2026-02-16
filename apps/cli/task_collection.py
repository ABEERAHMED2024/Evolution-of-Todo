"""
In-memory collection that stores all tasks with deterministic operations.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from apps.cli.models.task import Task
from apps.cli.utils.error_handlers import NotFoundError
from apps.cli.utils.validators import validate_task_id


class TaskCollection:
    """
    An in-memory collection that stores all tasks.
    
    Operations:
    - add(task): Adds a new task to the collection, assigns next available ID
    - get_by_id(id): Retrieves a task by its ID
    - get_all(): Returns all tasks in the collection
    - update(id, updates): Updates a task with the specified ID
    - delete(id): Removes a task with the specified ID
    - clear(): Removes all tasks from the collection
    
    Deterministic Properties:
    - Addition order is preserved
    - Sequential ID assignment is guaranteed
    - Operations produce consistent results for identical inputs
    - Collection state is fully determined by the sequence of operations performed on it
    """
    
    def __init__(self):
        """Initialize an empty task collection."""
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1
    
    def add(self, task: Task) -> Task:
        """
        Adds a new task to the collection, assigns next available ID.
        
        Args:
            task: The task to add
            
        Returns:
            The added task with assigned ID
        """
        # Assign the next available ID if the task doesn't have one
        if task.id is None or task.id <= 0:
            task.id = self._next_id
            self._next_id += 1
        elif task.id >= self._next_id:
            # If a task is added with a higher ID, update the next_id
            self._next_id = task.id + 1
        
        self._tasks[task.id] = task
        return task
    
    def get_by_id(self, task_id: int) -> Task:
        """
        Retrieves a task by its ID.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The task with the specified ID
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        validate_task_id(task_id)
        
        if task_id not in self._tasks:
            raise NotFoundError(task_id)
        
        return self._tasks[task_id]
    
    def get_all(self) -> List[Task]:
        """
        Returns all tasks in the collection, preserving addition order.
        
        Returns:
            A list of all tasks in the collection
        """
        # Return tasks in order of their IDs to ensure deterministic behavior
        return [self._tasks[tid] for tid in sorted(self._tasks.keys())]
    
    def update(self, task_id: int, updates: Dict[str, Any]) -> Task:
        """
        Updates a task with the specified ID.
        
        Args:
            task_id: The ID of the task to update
            updates: A dictionary of fields to update
            
        Returns:
            The updated task
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        validate_task_id(task_id)
        
        if task_id not in self._tasks:
            raise NotFoundError(task_id)
        
        task = self._tasks[task_id]
        
        # Apply updates
        for field, value in updates.items():
            if hasattr(task, field):
                setattr(task, field, value)
        
        # Update the updated_at timestamp
        task.updated_at = datetime.now()
        
        return task
    
    def delete(self, task_id: int) -> bool:
        """
        Removes a task with the specified ID.
        
        Args:
            task_id: The ID of the task to remove
            
        Returns:
            True if the task was successfully deleted, False otherwise
            
        Raises:
            NotFoundError: If no task with the given ID exists
        """
        validate_task_id(task_id)
        
        if task_id not in self._tasks:
            raise NotFoundError(task_id)
        
        del self._tasks[task_id]
        return True
    
    def clear(self) -> None:
        """Removes all tasks from the collection."""
        self._tasks.clear()
        self._next_id = 1
    
    def size(self) -> int:
        """Returns the number of tasks in the collection."""
        return len(self._tasks)
    
    def has_task(self, task_id: int) -> bool:
        """Checks if a task with the given ID exists in the collection."""
        return task_id in self._tasks