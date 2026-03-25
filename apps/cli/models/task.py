"""
Task data model with SQLModel integration for persistent storage.
Phase III: Hardened with database-level timestamps and completed boolean.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime, func


class Task(SQLModel, table=True):
    """
    Represents a single task in the system with SQLModel integration.

    Fields:
    - id (integer): Unique identifier assigned automatically; primary key, auto-increment
    - title (string): Required task title; non-empty, max 200 characters, not nullable
    - description (string): Optional task description; nullable, max 1000 characters
    - completed (bool): Completion status; default False
    - created_at (datetime): Timestamp when task was created; server_default=func.now()
    - updated_at (datetime): Timestamp when last updated; server_default=func.now(), onupdate=func.now()
    """

    __tablename__ = "tasks"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Task fields
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    
    # Timestamps with database-level defaults
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )

    def to_dict(self) -> dict:
        """Convert task to dictionary representation with ISO 8601 timestamps."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self) -> str:
        """Deterministic string representation."""
        return f"Task(id={self.id}, title='{self.title}', completed={self.completed})"

    def __eq__(self, other) -> bool:
        """Check equality based on all attributes."""
        if not isinstance(other, Task):
            return False
        return (
            self.id == other.id and
            self.title == other.title and
            self.description == other.description and
            self.completed == other.completed
        )
