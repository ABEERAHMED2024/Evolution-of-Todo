"""
Domain exception taxonomy for Phase III Domain Hardening.

This module defines all domain-specific exceptions.
Constraints:
- No CLI imports
- No repository imports
- No logging or printing
- Pure domain layer only
"""


class DomainError(Exception):
    """Base class for all domain-specific errors."""
    pass


class InvalidTaskTitleError(DomainError):
    """Raised when task title validation fails."""
    pass


class TaskNotFoundError(DomainError):
    """Raised when attempting to access a non-existent task."""
    pass


class TaskAlreadyCompletedError(DomainError):
    """Raised when attempting to complete an already completed task."""
    pass
