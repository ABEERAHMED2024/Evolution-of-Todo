"""
AI Agent for processing natural language task management requests
"""

import json
from datetime import datetime
from typing import Any, Dict, List

# Try to import OpenAI, but handle the case where it's not installed
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Try to import local tools, but handle import errors gracefully
try:
    from .mcp_tools import todo_tools

    MCP_TOOLS_AVAILABLE = True
except ImportError:
    MCP_TOOLS_AVAILABLE = False


class TodoAgent:
    def __init__(self, openai_client=None):
        self.client = openai_client
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "create_task",
                    "description": "Create a new task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Task title"},
                            "description": {
                                "type": "string",
                                "description": "Task description",
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "Task priority",
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Task tags",
                            },
                            "due_date": {
                                "type": "string",
                                "description": "Due date in YYYY-MM-DD format",
                            },
                            "status": {
                                "type": "boolean",
                                "description": "Task completion status",
                            },
                        },
                        "required": ["title"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_tasks",
                    "description": "Retrieve tasks with optional filtering",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "search": {
                                "type": "string",
                                "description": "Search term for title or description",
                            },
                            "status": {
                                "type": "boolean",
                                "description": "Filter by completion status",
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "Filter by priority",
                            },
                            "sort_by": {
                                "type": "string",
                                "enum": ["due_date", "priority"],
                                "description": "Sort by due date or priority",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_task",
                    "description": "Retrieve a specific task by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "Task ID"}
                        },
                        "required": ["task_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update an existing task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "Task ID"},
                            "title": {"type": "string", "description": "Task title"},
                            "description": {
                                "type": "string",
                                "description": "Task description",
                            },
                            "status": {
                                "type": "boolean",
                                "description": "Task completion status",
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "Task priority",
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Task tags",
                            },
                            "due_date": {
                                "type": "string",
                                "description": "Due date in YYYY-MM-DD format",
                            },
                        },
                        "required": ["task_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "Task ID"}
                        },
                        "required": ["task_id"],
                    },
                },
            },
        ]

    def process_request(
        self, user_input: str, conversation_history: list[dict[str, Any]] | None = None
    ) -> str:
        """
        Process a natural language request from the user
        """
        if not OPENAI_AVAILABLE or not self.client:
            return f"AI features are not available. Your request: '{user_input}' - Please install OpenAI package and configure API key."

        if conversation_history is None:
            conversation_history = []

        # Add the user's message to the conversation history
        messages = [
            {
                "role": "system",
                "content": """You are an AI assistant for managing tasks.
            Use the available functions to create, read, update, and delete tasks.
            Always confirm actions with the user when appropriate.
            If the user's request is ambiguous, ask clarifying questions.
            For example, if someone says 'Change the deadline' without specifying which task,
            ask 'Which task would you like to change the deadline for?'
            Similarly, if someone says 'Remind me about the meeting' without specifying which meeting,
            ask 'Which meeting would you like to be reminded about?'

            You support multiple languages including English, Spanish, and others.
            When users speak in different languages, process their requests appropriately.
            For Urdu-readiness, ensure the system can handle Urdu script if provided.""",
            }
        ]

        # Add conversation history
        messages.extend(conversation_history)

        # Add the current user input
        messages.append({"role": "user", "content": user_input})

        try:
            # Call the OpenAI API with function calling
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",  # Using a model that supports function calling
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
            )

            # Process the response
            response_message = response.choices[0].message

            # Check if the model wants to call a function
            tool_calls = response_message.tool_calls
            if tool_calls and MCP_TOOLS_AVAILABLE:
                # Extend conversation history with the assistant's request to call functions
                messages.append(response_message)

                # Iterate through all the tool calls
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Call the appropriate function
                    try:
                        if function_name == "create_task":
                            result = todo_tools.create_task_tool(**function_args)
                        elif function_name == "get_tasks":
                            result = todo_tools.get_tasks_tool(**function_args)
                        elif function_name == "get_task":
                            result = todo_tools.get_task_tool(**function_args)
                        elif function_name == "update_task":
                            result = todo_tools.update_task_tool(**function_args)
                        elif function_name == "delete_task":
                            result = todo_tools.delete_task_tool(**function_args)
                        else:
                            result = {"error": f"Unknown function: {function_name}"}
                    except Exception as e:
                        result = {"error": f"Error calling {function_name}: {str(e)}"}

                    # Add the result of the function call to the messages
                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(result),
                        }
                    )

                # Call the API again to get the final response
                second_response = self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=messages,
                )

                return (
                    second_response.choices[0].message.content
                    or "I processed your request but didn't generate a response."
                )
            else:
                # If no function calls were made or tools not available, return the assistant's message
                if not MCP_TOOLS_AVAILABLE:
                    return f"{response_message.content}\n\nNote: Task management tools are not available. Please ensure mcp_tools module is properly configured."
                return (
                    response_message.content
                    or "I received your message but couldn't generate a response."
                )

        except Exception as e:
            return f"Sorry, I encountered an error processing your request: {str(e)}"


class MockTodoAgent:
    """Mock agent for when dependencies are not available"""

    def __init__(self, client=None):
        self.client = client

    def process_request(
        self, user_input: str, conversation_history: list[dict[str, Any]] | None = None
    ) -> str:
        return f"Mock response: I received your message '{user_input}' but AI features are currently disabled. Please install required dependencies (openai, fastapi, pydantic)."
