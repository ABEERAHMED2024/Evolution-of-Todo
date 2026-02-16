"""
Centralized error handling for the task manager application.
"""
from typing import Any


class TaskManagerError(Exception):
    """Base exception class for the task manager application."""
    pass


class ValidationError(TaskManagerError):
    """Raised when task data fails validation."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"ValidationError: {self.message}"


class NotFoundError(TaskManagerError):
    """Raised when attempting to access a non-existent task."""
    def __init__(self, task_id: int):
        super().__init__(f"Task with ID {task_id} not found")
        self.task_id = task_id

    def __str__(self):
        return f"NotFoundError: {super().__str__()}"


class DeterministicOperationError(TaskManagerError):
    """Raised when an operation would violate deterministic behavior requirements."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"DeterministicOperationError: {self.message}"


class DatabaseConnectionError(TaskManagerError):
    """Raised when database connection fails."""
    def __init__(self, message: str = "Database connection failed"):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"DatabaseConnectionError: {self.message}"


class TransactionError(TaskManagerError):
    """Raised when a database transaction fails."""
    def __init__(self, message: str = "Database transaction failed"):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"TransactionError: {self.message}"


class ErrorHandler:
    """Handles errors consistently across the application."""
    
    @staticmethod
    def handle_error(error: Exception) -> dict:
        """
        Convert an exception to a standardized error response.
        
        Args:
            error: The exception to handle
            
        Returns:
            A dictionary with standardized error information
        """
        error_type = type(error).__name__
        
        if isinstance(error, ValidationError):
            return {
                "error": True,
                "type": error_type,
                "message": error.message,
                "code": "VALIDATION_ERROR"
            }
        elif isinstance(error, NotFoundError):
            return {
                "error": True,
                "type": error_type,
                "message": str(error),
                "code": "NOT_FOUND_ERROR",
                "task_id": error.task_id
            }
        elif isinstance(error, DeterministicOperationError):
            return {
                "error": True,
                "type": error_type,
                "message": error.message,
                "code": "DETERMINISTIC_OPERATION_ERROR"
            }
        else:
            # Generic error for unexpected exceptions
            return {
                "error": True,
                "type": error_type,
                "message": str(error),
                "code": "UNEXPECTED_ERROR"
            }


def handle_operation(operation, *args, **kwargs):
    """
    Wrapper to handle operations and return either result or error response.
    
    Args:
        operation: The function to execute
        *args: Arguments to pass to the operation
        **kwargs: Keyword arguments to pass to the operation
        
    Returns:
        Either the result of the operation or an error response
    """
    try:
        result = operation(*args, **kwargs)
        return {"error": False, "result": result}
    except Exception as e:
        return ErrorHandler.handle_error(e)