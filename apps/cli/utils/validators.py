"""
Validation utilities for deterministic behavior in the task manager.
"""
import re
from typing import Dict, Any, Optional
from datetime import datetime

from apps.cli.utils.error_handlers import ValidationError


def validate_title(title: str) -> bool:
    """
    Validate that the title meets requirements.
    
    Args:
        title: The title to validate
        
    Returns:
        True if valid, raises ValidationError if not
    """
    if not title or not title.strip():
        raise ValidationError("Title cannot be empty or consist only of whitespace")
    
    if len(title) > 200:
        raise ValidationError(f"Title exceeds maximum length of 200 characters: {len(title)} provided")
    
    return True


def validate_description(description: Optional[str]) -> bool:
    """
    Validate that the description meets requirements.
    
    Args:
        description: The description to validate (can be None)
        
    Returns:
        True if valid, raises ValidationError if not
    """
    if description is None:
        return True
    
    if len(description) > 1000:
        raise ValidationError(f"Description exceeds maximum length of 1000 characters: {len(description)} provided")
    
    return True


def validate_status(status: str) -> bool:
    """
    Validate that the status is one of the allowed values.
    
    Args:
        status: The status to validate
        
    Returns:
        True if valid, raises ValidationError if not
    """
    if status not in ["incomplete", "complete"]:
        raise ValidationError(f"Status must be 'incomplete' or 'complete', got '{status}'")
    
    return True


def validate_task_data(data: Dict[str, Any]) -> bool:
    """
    Validate all task fields collectively.
    
    Args:
        data: Dictionary containing task data
        
    Returns:
        True if all fields are valid, raises ValidationError if not
    """
    # Validate title
    if 'title' in data:
        validate_title(data['title'])
    
    # Validate description if present
    if 'description' in data and data['description'] is not None:
        validate_description(data['description'])
    
    # Validate status if present
    if 'status' in data:
        validate_status(data['status'])
    
    # Validate ID if present
    if 'id' in data:
        if not isinstance(data['id'], int) or data['id'] <= 0:
            raise ValidationError(f"Task ID must be a positive integer, got {data['id']}")
    
    # Validate timestamps if present
    if 'created_at' in data:
        try:
            datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        except ValueError:
            raise ValidationError(f"Invalid created_at timestamp format: {data['created_at']}")
    
    if 'updated_at' in data:
        try:
            datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
        except ValueError:
            raise ValidationError(f"Invalid updated_at timestamp format: {data['updated_at']}")
    
    return True


def validate_task_id(task_id: int) -> bool:
    """
    Validate that the task ID is a positive integer.
    
    Args:
        task_id: The task ID to validate
        
    Returns:
        True if valid, raises ValidationError if not
    """
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValidationError(f"Task ID must be a positive integer, got {task_id}")
    
    return True


def validate_datetime_format(dt_str: str) -> bool:
    """
    Validate that the datetime string is in ISO 8601 format.
    
    Args:
        dt_str: The datetime string to validate
        
    Returns:
        True if valid, raises ValidationError if not
    """
    try:
        datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return True
    except ValueError:
        raise ValidationError(f"Invalid datetime format: {dt_str}. Expected ISO 8601 format.")