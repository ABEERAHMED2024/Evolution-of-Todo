"""
Evolution of Todo - AI Agent Package

This package contains the AI-powered conversational interface for the Todo application.
It includes:
- TodoAgent: Main AI agent for processing natural language requests
- TodoMCPTools: Tools for connecting to the backend API
- Main FastAPI application for the agent service

The agent supports multiple languages and provides intelligent task management
through natural language processing.
"""

from .main import app
from .mcp_tools import TodoMCPTools
from .todo_agent import TodoAgent

__version__ = "1.0.0"
__all__ = ["app", "TodoAgent", "TodoMCPTools"]
