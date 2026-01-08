"""
MCP Tools for connecting the AI agent to the existing FastAPI backend
"""
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime


class TodoMCPTools:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    def create_task_tool(self, title: str, description: Optional[str] = None, 
                         priority: str = "medium", tags: Optional[List[str]] = None, 
                         due_date: Optional[str] = None, status: bool = False) -> Dict:
        """
        Tool to create a new task via the backend API
        """
        if tags is None:
            tags = []
        
        task_data = {
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "tags": tags,
            "due_date": due_date
        }
        
        try:
            response = requests.post(f"{self.base_url}/tasks/", json=task_data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to create task: {str(e)}"}

    def get_tasks_tool(self, search: Optional[str] = None, status: Optional[bool] = None,
                       priority: Optional[str] = None, sort_by: str = "due_date") -> List[Dict]:
        """
        Tool to retrieve tasks with optional filtering and sorting
        """
        params = {}
        if search:
            params["search"] = search
        if status is not None:
            params["status"] = status
        if priority:
            params["priority"] = priority
        params["sort_by"] = sort_by
        
        try:
            response = requests.get(f"{self.base_url}/tasks/", params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return [{"error": f"Failed to retrieve tasks: {str(e)}"}]

    def get_task_tool(self, task_id: int) -> Dict:
        """
        Tool to retrieve a specific task by ID
        """
        try:
            response = requests.get(f"{self.base_url}/tasks/{task_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to retrieve task: {str(e)}"}

    def update_task_tool(self, task_id: int, title: Optional[str] = None, 
                         description: Optional[str] = None, status: Optional[bool] = None,
                         priority: Optional[str] = None, tags: Optional[List[str]] = None,
                         due_date: Optional[str] = None) -> Dict:
        """
        Tool to update an existing task
        """
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if status is not None:
            update_data["status"] = status
        if priority is not None:
            update_data["priority"] = priority
        if tags is not None:
            update_data["tags"] = tags
        if due_date is not None:
            update_data["due_date"] = due_date
        
        try:
            response = requests.put(f"{self.base_url}/tasks/{task_id}", json=update_data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to update task: {str(e)}"}

    def delete_task_tool(self, task_id: int) -> Dict:
        """
        Tool to delete a task by ID
        """
        try:
            response = requests.delete(f"{self.base_url}/tasks/{task_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to delete task: {str(e)}"}


# Initialize the tools with the default backend URL
todo_tools = TodoMCPTools()