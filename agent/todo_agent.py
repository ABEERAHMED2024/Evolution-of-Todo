"""
AI Agent for processing natural language task management requests
"""

import json
from datetime import datetime
from typing import Any

import openai
from mcp_tools import TodoMCPTools


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
        self.mcp_tools = TodoMCPTools()

    def process_request(
        self, user_input: str, conversation_history: list[dict[str, Any]] | None = None
    ) -> str:
        """
        Process a natural language request from the user
        """
        if not self.client:
            return f"AI features are not available. Your request: '{user_input}' - Please configure OpenAI API key."

        if conversation_history is None:
            conversation_history = []

        messages = [
            {
                "role": "system",
                "content": """You are an AI assistant for managing tasks.
Use the available functions to create, read, update, and delete tasks.
Always confirm actions with the user when appropriate.
If the user's request is ambiguous, ask clarifying questions.
Support multiple languages including English, Spanish, Urdu, and others.""",
            }
        ]

        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_input})

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
            )

            response_message = response.choices[0].message

            if response_message.tool_calls:
                messages.append(response_message)

                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    try:
                        if function_name == "create_task":
                            result = self.mcp_tools.create_task_tool(**function_args)
                        elif function_name == "get_tasks":
                            result = self.mcp_tools.get_tasks_tool(**function_args)
                        elif function_name == "get_task":
                            result = self.mcp_tools.get_task_tool(**function_args)
                        elif function_name == "update_task":
                            result = self.mcp_tools.update_task_tool(**function_args)
                        elif function_name == "delete_task":
                            result = self.mcp_tools.delete_task_tool(**function_args)
                        else:
                            result = {"error": f"Unknown function: {function_name}"}
                    except Exception as e:
                        result = {"error": f"Error calling {function_name}: {str(e)}"}

                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(result),
                        }
                    )

                second_response = self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=messages,
                )

                return (
                    second_response.choices[0].message.content
                    or "I processed your request but didn't generate a response."
                )
            else:
                return (
                    response_message.content
                    or "I received your message but couldn't generate a response."
                )

        except Exception as e:
            return f"Sorry, I encountered an error processing your request: {str(e)}"
