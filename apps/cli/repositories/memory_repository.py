"""
In-memory implementation of the repository interface (from Phase I).
Maintains all Phase I behavior and deterministic properties.
Used for testing and optional runtime configuration.
"""
from typing import List, Optional
from .base_repository import TaskRepository
from ..models.task import Task


class MemoryRepository(TaskRepository):
    """
    In-memory implementation of the repository interface (from Phase I).
    
    Implementation Details:
    - Uses Python dictionaries and lists for storage
    - Maintains all Phase I behavior and deterministic properties
    - Used for testing and optional runtime configuration
    """
    
    def __init__(self):
        """Initialize the in-memory storage."""
        self._tasks = {}
        self._next_id = 1
    
    def add(self, task: Task) -> Task:
        """
        Creates a new task in storage.
        
        Args:
            task: The task to add to storage
            
        Returns:
            The added task with assigned ID
        """
        if task.id is None:
            task.id = self._next_id
            self._next_id += 1
        elif task.id >= self._next_id:
            self._next_id = task.id + 1
        
        self._tasks[task.id] = task
        return task

    def get_all(self) -> List[Task]:
        """
        Returns all tasks in storage.
        
        Returns:
            A list of all tasks in storage, ordered by ID for deterministic behavior
        """
        # Return tasks in order of their IDs to ensure deterministic behavior
        return [self._tasks[tid] for tid in sorted(self._tasks.keys())]

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieves a task by its ID.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The task with the specified ID, or None if not found
        """
        return self._tasks.get(task_id)

    def update(self, task: Task) -> Task:
        """
        Updates a task with the specified ID.
        
        Args:
            task: The task with updated values
            
        Returns:
            The updated task
        """
        if task.id in self._tasks:
            # Update the existing task with new values
            existing_task = self._tasks[task.id]
            existing_task.title = task.title
            existing_task.description = task.description
            existing_task.status = task.status
            return existing_task
        else:
            # If the task doesn't exist, return None to match the interface expectation
            return None

    def delete(self, task_id: int) -> bool:
        """
        Removes a task with the specified ID.
        
        Args:
            task_id: The ID of the task to remove
            
        Returns:
            True if the task was successfully deleted, False otherwise
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def clear(self) -> None:
        """
        Removes all tasks from storage.
        """
        self._tasks.clear()
        self._next_id = 1