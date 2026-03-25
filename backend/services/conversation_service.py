"""
Conversation service for managing conversation state.
Phase III: MCP Tools - Provides CRUD operations for conversations.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from sqlmodel import Session, select
from backend.models.conversation import Conversation, Message


class ConversationService:
    """
    Service layer for conversation management.
    
    Provides stateless conversation storage and retrieval,
    enabling any server instance to handle any conversation.
    """
    
    def __init__(self, session: Session):
        """
        Initialize conversation service.
        
        Args:
            session: SQLModel database session
        """
        self.session = session
    
    def create_conversation(self, user_id: str) -> Conversation:
        """
        Create a new conversation for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            The newly created conversation
        """
        conversation = Conversation(user_id=user_id, messages=[])
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation
    
    def get_conversation(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Retrieve a conversation by ID.
        
        Args:
            conversation_id: Conversation UUID
            
        Returns:
            The conversation if found, None otherwise
        """
        statement = select(Conversation).where(Conversation.id == conversation_id)
        return self.session.exec(statement).first()
    
    def get_user_conversations(self, user_id: str, limit: int = 10) -> List[Conversation]:
        """
        Get conversations for a specific user.
        
        Args:
            user_id: User identifier
            limit: Maximum number of conversations to return
            
        Returns:
            List of conversations sorted by updated_at descending
        """
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        return self.session.exec(statement).all()
    
    def get_or_create_conversation(self, user_id: str) -> Conversation:
        """
        Get the most recent conversation for a user or create a new one.
        
        Args:
            user_id: User identifier
            
        Returns:
            The most recent conversation or a new one if none exists
        """
        conversations = self.get_user_conversations(user_id, limit=1)
        if conversations:
            return conversations[0]
        return self.create_conversation(user_id)
    
    def add_message_to_conversation(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
        tool_calls: Optional[List[Dict[str, Any]]] = None,
        tool_results: Optional[List[Dict[str, Any]]] = None
    ) -> Conversation:
        """
        Add a message to an existing conversation.
        
        Args:
            conversation_id: Conversation UUID
            role: Message role ("user", "assistant", or "system")
            content: Message content
            tool_calls: Optional tool invocations
            tool_results: Optional tool results
            
        Returns:
            The updated conversation
            
        Raises:
            ValueError: If conversation not found
        """
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")
        
        conversation.add_message(
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results
        )
        
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation
    
    def update_conversation(self, conversation_id: UUID, messages: List[Message]) -> Conversation:
        """
        Update a conversation's messages.
        
        Args:
            conversation_id: Conversation UUID
            messages: New message list
            
        Returns:
            The updated conversation
            
        Raises:
            ValueError: If conversation not found
        """
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")
        
        conversation.messages = messages
        conversation.updated_at = datetime.utcnow()
        
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation
    
    def delete_conversation(self, conversation_id: UUID) -> bool:
        """
        Delete a conversation.
        
        Args:
            conversation_id: Conversation UUID
            
        Returns:
            True if deleted, False if not found
        """
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False
        
        self.session.delete(conversation)
        self.session.commit()
        return True
    
    def get_conversation_count(self) -> int:
        """
        Get total number of conversations.
        
        Returns:
            Total conversation count
        """
        statement = select(Conversation)
        conversations = self.session.exec(statement).all()
        return len(conversations)
