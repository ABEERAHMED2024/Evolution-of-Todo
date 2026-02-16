"""
Configuration management utility for the persistent CLI task manager.
Handles environment variables and configurable storage backends.
"""
import os
from enum import Enum
from typing import Optional


class StorageBackend(Enum):
    """Enumeration of available storage backends."""
    MEMORY = "memory"
    POSTGRES = "postgres"


class Config:
    """Configuration class to manage application settings."""
    
    def __init__(self):
        """Initialize configuration from environment variables."""
        self.database_url = os.getenv("DATABASE_URL", "")
        self.storage_backend = os.getenv("STORAGE_BACKEND", "postgres")
        self.reset_on_exit = os.getenv("RESET_ON_EXIT", "false").lower() == "true"
        
    @property
    def storage_backend_enum(self) -> StorageBackend:
        """Get the storage backend as an enum value."""
        try:
            return StorageBackend(self.storage_backend.lower())
        except ValueError:
            # Default to postgres if an invalid value is provided
            return StorageBackend.POSTGRES
    
    @property
    def is_postgres_configured(self) -> bool:
        """Check if PostgreSQL is properly configured."""
        return bool(self.database_url and self.storage_backend_enum == StorageBackend.POSTGRES)


# Global configuration instance
config = Config()


def get_config() -> Config:
    """Get the global configuration instance."""
    return config