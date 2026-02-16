"""
Task data model with SQLModel integration for persistent storage.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Represents a single task in the system with SQLModel integration.

    Fields:
    - id (integer): Unique identifier assigned automatically; primary key, auto-increment
    - title (string): Required task title; non-empty, max 200 characters, not nullable
    - description (string): Optional task description; nullable, max 1000 characters
    - status (string): Task completion status; values: "incomplete", "complete", default "incomplete"
    - created_at (datetime): Timestamp when task was created; timezone-aware, server default
    - updated_at (datetime): Timestamp when task was last updated; timezone-aware, auto-update
    """
    
    # Define the table name
    __tablename__ = "tasks"
    
    # Define the fields with appropriate constraints
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="incomplete", sa_column_kwargs={"server_default": "incomplete"})
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    def __init__(self, title: str, description: Optional[str] = None, 
                 status: str = "incomplete", id: Optional[int] = None):
        """
        Initialize a Task instance.
        
        Args:
            title: Task title (required, non-empty)
            description: Task description (optional)
            status: Task status ("incomplete" or "complete")
            id: Task ID (optional, will be auto-assigned by DB if None)
        """
        super().__init__(
            id=id,
            title=title,
            description=description,
            status=status
        )
    
    def to_dict(self):
        """Convert task to dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
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