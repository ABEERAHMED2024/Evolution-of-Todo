"""
Task business logic with validation and error handling.
Phase III: Hardened with domain exceptions and invariant enforcement.
"""
from typing import List, Optional
from datetime import datetime

from apps.cli.models.task import Task
from apps.cli.repositories.base_repository import TaskRepository
from apps.cli.domain.exceptions import (
    DomainError,
    InvalidTaskTitleError,
    TaskNotFoundError,
    TaskAlreadyCompletedError
)
from apps.cli.utils.validators import validate_description


class TaskService:
    """
    Task business logic with validation and error handling.
    Phase III: Enforces all business rules and raises domain exceptions.

    Service layer must not execute raw SQL.
    All persistence logic must reside exclusively inside the repository implementation.
    """

    def __init__(self, repository: TaskRepository):
        """Initialize the task service with a repository."""
        self.repository = repository

    def _validate_title(self, title: str) -> str:
        """
        Validate task title and return trimmed version.
        
        Args:
            title: The title to validate
            
        Returns:
            Trimmed title if valid
            
        Raises:
            InvalidTaskTitleError: If title is invalid
        """
        if not title or not title.strip():
            raise InvalidTaskTitleError("Task title cannot be empty")
        
        trimmed = title.strip()
        
        if len(trimmed) > 200:
            raise InvalidTaskTitleError("Task title cannot exceed 200 characters")
        
        return trimmed

    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Add a new task with the given title and description.

        Args:
            title: The title of the task (required, will be trimmed)
            description: The description of the task (optional)

        Returns:
            The newly created task with assigned ID

        Raises:
            InvalidTaskTitleError: If the title is invalid
        """
        validated_title = self._validate_title(title)
        validate_description(description)
        
        task = Task(title=validated_title, description=description, completed=False)
        return self.repository.add(task)

    def get_task(self, task_id: int) -> Task:
        """
        Retrieve a task by its ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The task with the specified ID

        Raises:
            TaskNotFoundError: If no task with the given ID exists
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks in the repository.
        Returns tasks sorted by ID ascending for deterministic output.

        Returns:
            A list of all tasks in the repository, sorted by ID
        """
        return self.repository.get_all()

    def update_task(self, task_id: int, title: Optional[str] = None,
                    description: Optional[str] = None) -> Task:
        """
        Update a task with the given ID.

        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional, will be trimmed)
            description: New description for the task (optional)

        Returns:
            The updated task

        Raises:
            TaskNotFoundError: If no task with the given ID exists
            InvalidTaskTitleError: If the new title is invalid
        """
        validated_title = self._validate_title(title) if title is not None else None
        
        if description is not None:
            validate_description(description)

        existing_task = self.get_task(task_id)

        if validated_title is not None:
            existing_task.title = validated_title
        if description is not None:
            existing_task.description = description

        return self.repository.update(existing_task)

    def complete_task(self, task_id: int) -> Task:
        """
        Mark a task as complete with invariant enforcement.
        Prevents completing already completed tasks.

        Args:
            task_id: The ID of the task to mark as complete

        Returns:
            The updated task marked as complete

        Raises:
            TaskNotFoundError: If no task with the given ID exists
            TaskAlreadyCompletedError: If task is already complete
        """
        task = self.get_task(task_id)
        
        if task.completed:
            raise TaskAlreadyCompletedError(task_id)
        
        task.completed = True
        # updated_at is handled by database onupdate
        
        return self.repository.update(task)

    def incomplete_task(self, task_id: int) -> Task:
        """
        Mark a task as incomplete.

        Args:
            task_id: The ID of the task to mark as incomplete

        Returns:
            The updated task marked as incomplete

        Raises:
            TaskNotFoundError: If no task with the given ID exists
        """
        task = self.get_task(task_id)
        task.completed = False
        # updated_at is handled by database onupdate
        
        return self.repository.update(task)

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task with the given ID.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if the task was successfully deleted

        Raises:
            TaskNotFoundError: If no task with the given ID exists
        """
        self.get_task(task_id)
        return self.repository.delete(task_id)

    def get_next_task_id(self) -> int:
        """Get the next available task ID."""
        all_tasks = self.get_all_tasks()
        if not all_tasks:
            return 1
        return max(task.id for task in all_tasks) + 1
