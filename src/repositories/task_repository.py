"""
Abstract base class defining the contract for all repository implementations.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from ..models.task import Task


class TaskRepository(ABC):
    """
    Abstract base class defining the contract for all repository implementations.

    Methods:
    - add(task): Creates a new task in storage
    - get_all(): Returns all tasks in storage
    - get_by_id(id): Retrieves a task by its ID
    - update(task): Updates a task with the specified ID
    - delete(task_id): Removes a task with the specified ID
    - clear(): Removes all tasks from storage
    """

    @abstractmethod
    def add(self, task: Task) -> Task:
        """Creates a new task in storage."""
        pass

    @abstractmethod
    def get_all(self) -> List[Task]:
        """Returns all tasks in storage."""
        pass

    @abstractmethod
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Retrieves a task by its ID."""
        pass

    @abstractmethod
    def update(self, task: Task) -> Task:
        """Updates a task with the specified ID."""
        pass

    @abstractmethod
    def delete(self, task_id: int) -> bool:
        """Removes a task with the specified ID."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Removes all tasks from storage."""
        pass