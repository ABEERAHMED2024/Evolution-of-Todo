"""
Task data model with validation
"""
from datetime import datetime
from typing import Optional


class Task:
    """
    Represents a single task in the system.
    
    Fields:
    - id (integer): Unique identifier assigned automatically; positive integer, sequential
    - title (string): Required task title; non-empty, max 200 characters
    - description (string): Optional task description; nullable, max 1000 characters
    - status (string): Task completion status; values: "incomplete", "complete"
    - created_at (datetime): Timestamp when task was created; ISO 8601 format
    - updated_at (datetime): Timestamp when task was last updated; ISO 8601 format
    """
    
    def __init__(self, task_id: int, title: str, description: Optional[str] = None, 
                 status: str = "incomplete"):
        """
        Initialize a Task instance.
        
        Args:
            task_id: Unique identifier for the task
            title: Task title (required, non-empty)
            description: Task description (optional)
            status: Task status ("incomplete" or "complete")
        """
        self.id = task_id
        self.title = title
        self.description = description
        self.status = status
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self):
        """Convert task to dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def __repr__(self):
        """String representation of the task."""
        return f"Task(id={self.id}, title='{self.title}', status='{self.status}')"

    def __eq__(self, other):
        """Check equality based on all attributes."""
        if not isinstance(other, Task):
            return False
        return (
            self.id == other.id and
            self.title == other.title and
            self.description == other.description and
            self.status == other.status
        )