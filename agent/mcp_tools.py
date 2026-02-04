"""
MCP Tools for connecting the AI agent to the existing FastAPI backend
"""

import json
from datetime import datetime
from typing import Any, Dict, List

# Try to import requests, but handle the case where it's not installed
try:
    import requests

    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class TodoMCPTools:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")

    def _make_request(self, method: str, endpoint: str, **kwargs) -> dict[str, Any]:
        """
        Helper method to make HTTP requests with proper error handling
        """
        if not REQUESTS_AVAILABLE:
            return {
                "error": "requests library not available. Please install with: pip install requests"
            }

        url = f"{self.base_url}{endpoint}"

        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()

            # Handle empty responses
            if response.status_code == 204 or not response.content:
                return {"message": "Success", "status_code": response.status_code}

            return response.json()

        except requests.exceptions.ConnectionError:
            return {
                "error": f"Could not connect to backend at {self.base_url}. Is the server running?"
            }
        except requests.exceptions.Timeout:
            return {"error": "Request timed out. Please try again."}
        except requests.exceptions.HTTPError as e:
            try:
                error_detail = response.json().get("detail", str(e))
            except (ValueError, AttributeError):
                error_detail = str(e)
            return {"error": f"HTTP {response.status_code}: {error_detail}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}

    def create_task_tool(
        self,
        title: str,
        description: str | None = None,
        priority: str = "medium",
        tags: list[str] | None = None,
        due_date: str | None = None,
        status: bool = False,
    ) -> dict[str, Any]:
        """
        Tool to create a new task via the backend API

        Args:
            title: Task title (required)
            description: Optional task description
            priority: Task priority (low, medium, high)
            tags: List of tags for the task
            due_date: Due date in YYYY-MM-DD format
            status: Task completion status (default: False)

        Returns:
            Dict containing the created task or error information
        """
        if tags is None:
            tags = []

        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if priority not in valid_priorities:
            return {
                "error": f"Invalid priority '{priority}'. Must be one of: {valid_priorities}"
            }

        # Validate due_date format if provided
        if due_date:
            try:
                datetime.strptime(due_date, "%Y-%m-%d")
            except ValueError:
                return {
                    "error": f"Invalid due_date format '{due_date}'. Use YYYY-MM-DD format."
                }

        task_data = {
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "tags": tags,
            "due_date": due_date,
        }

        return self._make_request("POST", "/tasks/", json=task_data)

    def get_tasks_tool(
        self,
        search: str | None = None,
        status: bool | None = None,
        priority: str | None = None,
        sort_by: str = "due_date",
        skip: int = 0,
        limit: int = 100,
    ) -> list[dict[str, Any]] | dict[str, Any]:
        """
        Tool to retrieve tasks with optional filtering and sorting

        Args:
            search: Search term for title or description
            status: Filter by completion status
            priority: Filter by priority level
            sort_by: Sort by 'due_date', 'priority', or 'created_at'
            skip: Number of tasks to skip (for pagination)
            limit: Maximum number of tasks to return

        Returns:
            List of tasks or error information
        """
        params = {}

        if search:
            params["search"] = search
        if status is not None:
            params["status"] = str(status).lower()
        if priority:
            if priority not in ["low", "medium", "high"]:
                return {
                    "error": f"Invalid priority '{priority}'. Must be one of: low, medium, high"
                }
            params["priority"] = priority
        if sort_by not in ["due_date", "priority", "created_at"]:
            return {
                "error": f"Invalid sort_by '{sort_by}'. Must be one of: due_date, priority, created_at"
            }

        params["sort_by"] = sort_by
        params["skip"] = skip
        params["limit"] = limit

        result = self._make_request("GET", "/tasks/", params=params)

        # If there's an error, return it as a list with the error dict
        if isinstance(result, dict) and "error" in result:
            return [result]

        return result

    def get_task_tool(self, task_id: str | int) -> dict[str, Any]:
        """
        Tool to retrieve a specific task by ID

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            Dict containing the task or error information
        """
        if not task_id:
            return {"error": "task_id is required"}

        return self._make_request("GET", f"/tasks/{task_id}")

    def update_task_tool(
        self,
        task_id: str | int,
        title: str | None = None,
        description: str | None = None,
        status: bool | None = None,
        priority: str | None = None,
        tags: list[str] | None = None,
        due_date: str | None = None,
    ) -> dict[str, Any]:
        """
        Tool to update an existing task

        Args:
            task_id: The ID of the task to update (required)
            title: New task title
            description: New task description
            status: New completion status
            priority: New priority level
            tags: New list of tags
            due_date: New due date in YYYY-MM-DD format

        Returns:
            Dict containing the updated task or error information
        """
        if not task_id:
            return {"error": "task_id is required"}

        update_data = {}

        if title is not None:
            if not title.strip():
                return {"error": "title cannot be empty"}
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if status is not None:
            update_data["status"] = status
        if priority is not None:
            if priority not in ["low", "medium", "high"]:
                return {
                    "error": f"Invalid priority '{priority}'. Must be one of: low, medium, high"
                }
            update_data["priority"] = priority
        if tags is not None:
            update_data["tags"] = tags
        if due_date is not None:
            if due_date:  # If not empty string
                try:
                    datetime.strptime(due_date, "%Y-%m-%d")
                except ValueError:
                    return {
                        "error": f"Invalid due_date format '{due_date}'. Use YYYY-MM-DD format."
                    }
            update_data["due_date"] = due_date

        if not update_data:
            return {"error": "No fields provided to update"}

        return self._make_request("PUT", f"/tasks/{task_id}", json=update_data)

    def delete_task_tool(self, task_id: str | int) -> dict[str, Any]:
        """
        Tool to delete a task by ID

        Args:
            task_id: The ID of the task to delete

        Returns:
            Dict containing success message or error information
        """
        if not task_id:
            return {"error": "task_id is required"}

        return self._make_request("DELETE", f"/tasks/{task_id}")

    def health_check(self) -> dict[str, Any]:
        """
        Check if the backend API is available

        Returns:
            Dict containing health status
        """
        result = self._make_request("GET", "/health")
        if isinstance(result, dict) and "error" not in result:
            result["backend_url"] = self.base_url
        return result


class MockTodoMCPTools:
    """Mock tools for when dependencies are not available"""

    def __init__(self, base_url: str = ""):
        self.base_url = base_url

    def _mock_response(self, action: str) -> dict[str, Any]:
        return {
            "error": f"Mock response for {action}. Backend tools not available. Please install requests library and ensure backend is running."
        }

    def create_task_tool(self, **kwargs) -> dict[str, Any]:
        return self._mock_response("create_task")

    def get_tasks_tool(self, **kwargs) -> list[dict[str, Any]]:
        return [self._mock_response("get_tasks")]

    def get_task_tool(self, **kwargs) -> dict[str, Any]:
        return self._mock_response("get_task")

    def update_task_tool(self, **kwargs) -> dict[str, Any]:
        return self._mock_response("update_task")

    def delete_task_tool(self, **kwargs) -> dict[str, Any]:
        return self._mock_response("delete_task")

    def health_check(self) -> dict[str, Any]:
        return {
            "status": "mock",
            "message": "Using mock tools - real backend not available",
            "backend_url": self.base_url,
        }


# Initialize the tools with the default backend URL
# Use mock tools if requests is not available
if REQUESTS_AVAILABLE:
    todo_tools = TodoMCPTools()
else:
    todo_tools = MockTodoMCPTools()
