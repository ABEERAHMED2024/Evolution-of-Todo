"""
Conversation model for stateless chat architecture.
Phase III: MCP Tools - Stores conversation history in database for stateless server.
"""
from datetime import datetime
from typing import List, Optional, Any, Dict
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import JSON
import json


class Message(BaseModel):
    """
    Represents a single message in a conversation.
    
    Attributes:
        role: Message role - "user", "assistant", or "system"
        content: The message text content
        timestamp: When the message was created
        tool_calls: Optional list of tool invocations (for assistant messages)
        tool_results: Optional list of tool results (for tool responses)
    """
    role: str  # "user", "assistant", or "system"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_results: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class Conversation(SQLModel, table=True):
    """
    Represents a conversation session with the AI agent.
    
    This model enables stateless server architecture by persisting
    conversation history in the database. Any server instance can
    continue any conversation by fetching it from the database.
    
    Attributes:
        id: Unique conversation identifier (UUID)
        user_id: User identifier for conversation ownership
        messages: List of messages in the conversation
        created_at: When the conversation started
        updated_at: When the last message was added
    """
    __tablename__ = "conversations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: str = Field(index=True)  # Identifies the user
    messages: List[Message] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, default=list)
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=datetime.utcnow)
    )
    
    def add_message(self, role: str, content: str, 
                    tool_calls: Optional[List[Dict[str, Any]]] = None,
                    tool_results: Optional[List[Dict[str, Any]]] = None) -> Message:
        """
        Add a message to the conversation.
        
        Args:
            role: Message role ("user", "assistant", or "system")
            content: Message content
            tool_calls: Optional tool invocations
            tool_results: Optional tool results
            
        Returns:
            The created message
        """
        message = Message(
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results
        )
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        return message
    
    def get_recent_messages(self, limit: int = 10) -> List[Message]:
        """
        Get the most recent messages from the conversation.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            List of recent messages
        """
        return self.messages[-limit:]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert conversation to dictionary representation."""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "tool_calls": msg.tool_calls,
                    "tool_results": msg.tool_results
                }
                for msg in self.messages
            ],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"Conversation(id={self.id}, user_id='{self.user_id}', messages={len(self.messages)})"
