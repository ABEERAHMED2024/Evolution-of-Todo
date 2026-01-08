from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
import os


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: bool = False  # False = incomplete, True = complete
    priority: str = "medium"  # high, medium, low
    tags: List[str] = []
    due_date: Optional[datetime] = None


class Task(TaskBase):
    id: int


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None


class TaskSQLModel(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    status: bool = Field(default=False)  # False = incomplete, True = complete
    priority: str = Field(default="medium", max_length=10)  # high, medium, low
    tags: str = Field(default="[]")  # Stored as JSON string
    due_date: Optional[datetime] = Field(default=None)

    # Method to convert tags from string to list
    def get_tags_list(self) -> List[str]:
        import json
        return json.loads(self.tags) if self.tags else []

    # Method to set tags from list
    def set_tags_list(self, tags_list: List[str]):
        import json
        self.tags = json.dumps(tags_list)