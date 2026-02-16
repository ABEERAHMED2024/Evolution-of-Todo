"""
Repository factory with configurable backend.
Implements repository factory with configurable backend.
Service layer must never import PostgresTaskRepository directly.
No direct DB session injection outside repository implementation.
"""
from typing import Optional
from sqlmodel import Session, create_engine
from .base_repository import TaskRepository
from .memory_repository import MemoryRepository
from .postgres_repository import PostgresTaskRepository
from ..config import StorageBackend, get_config


def get_repository() -> TaskRepository:
    """
    Repository factory with configurable backend.
    
    Returns:
        An instance of the appropriate repository implementation based on configuration
    """
    config = get_config()
    
    if config.storage_backend_enum == StorageBackend.MEMORY:
        return MemoryRepository()
    elif config.storage_backend_enum == StorageBackend.POSTGRES:
        # Create database engine and session
        if not config.database_url:
            raise ValueError("DATABASE_URL must be set when using PostgreSQL backend")
        
        engine = create_engine(config.database_url)
        session = Session(engine)
        
        return PostgresTaskRepository(session)
    else:
        # Default to memory backend if configuration is invalid
        return MemoryRepository()