"""
PostgreSQL implementation of the TaskRepository interface using SQLModel.
"""
from typing import List, Optional
from sqlmodel import Session, select, create_engine, SQLModel
from ..models.task import Task
from .base_repository import TaskRepository


class PostgresTaskRepository(TaskRepository):
    """
    PostgreSQL implementation of the TaskRepository interface.
    
    Uses SQLModel for database operations and implements all repository methods with database queries.
    Maintains the same deterministic properties as MemoryRepository.
    Handles database connections and transactions appropriately.
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the repository with a database session.
        
        Args:
            db_session: The database session to use for operations
        """
        self.session = db_session

    def add(self, task: Task) -> Task:
        """
        Creates a new task in the database.
        
        Args:
            task: The task to add to the database
            
        Returns:
            The added task with any database-generated values (like ID)
        """
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_all(self) -> List[Task]:
        """
        Returns all tasks in the database, ordered by ID for deterministic behavior.
        
        Returns:
            A list of all tasks in the database, ordered by ID
        """
        statement = select(Task).order_by(Task.id.asc())
        tasks = self.session.exec(statement).all()
        return tasks

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieves a task by its ID from the database.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The task with the specified ID, or None if not found
        """
        statement = select(Task).where(Task.id == task_id)
        task = self.session.exec(statement).first()
        return task

    def update(self, task: Task) -> Task:
        """
        Updates a task in the database.
        
        Args:
            task: The task with updated values
            
        Returns:
            The updated task
        """
        existing_task = self.get_by_id(task.id)
        if existing_task:
            # Update the existing task with new values
            existing_task.title = task.title
            existing_task.description = task.description
            existing_task.status = task.status
            self.session.add(existing_task)
            self.session.commit()
            self.session.refresh(existing_task)
            return existing_task
        else:
            # If the task doesn't exist, raise an exception or return None
            # For now, we'll return None to match the interface expectation
            return None

    def delete(self, task_id: int) -> bool:
        """
        Removes a task with the specified ID from the database.
        
        Args:
            task_id: The ID of the task to remove
            
        Returns:
            True if the task was successfully deleted, False otherwise
        """
        task = self.get_by_id(task_id)
        if task:
            self.session.delete(task)
            self.session.commit()
            return True
        return False

    def clear(self) -> None:
        """
        Removes all tasks from the database.
        """
        # Delete all tasks from the database
        statement = select(Task)
        tasks = self.session.exec(statement).all()
        for task in tasks:
            self.session.delete(task)
        self.session.commit()