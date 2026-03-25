"""
Tests for MCP Tools.
Phase III: MCP Tools - Unit tests for task management tools.

Run tests with:
    pytest tests/test_mcp_tools.py -v
"""
import pytest
import asyncio
import sys
from pathlib import Path
from typing import Dict, Any

# Add project root to path for imports
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Import MCP tools
from backend.mcp.tools import (
    add_task,
    list_tasks,
    update_task,
    complete_task,
    delete_task,
    list_available_tools
)


class TestMCPTools:
    """Test suite for MCP task management tools."""
    
    @pytest.fixture
    async def sample_task(self):
        """Create a sample task for testing."""
        result = await add_task(
            title="Test Task",
            description="Test Description"
        )
        if result["success"]:
            return result["task"]
        return None
    
    def test_add_task_success(self):
        """Test successful task creation."""
        async def run_test():
            result = await add_task(
                title="Buy groceries",
                description="Milk, eggs, bread"
            )
            
            assert result["success"] is True
            assert "task" in result
            assert result["task"]["title"] == "Buy groceries"
            assert result["task"]["description"] == "Milk, eggs, bread"
            assert result["task"]["id"] is not None
        
        asyncio.run(run_test())
    
    def test_add_task_empty_title(self):
        """Test task creation with empty title fails."""
        async def run_test():
            result = await add_task(
                title="",
                description="Should fail"
            )
            
            assert result["success"] is False
            assert "error" in result
        
        asyncio.run(run_test())
    
    def test_list_tasks_all(self):
        """Test listing all tasks."""
        async def run_test():
            result = await list_tasks(
                status="all",
                limit=10,
                offset=0
            )
            
            assert result["success"] is True
            assert "tasks" in result
            assert "total" in result
            assert "limit" in result
            assert "offset" in result
        
        asyncio.run(run_test())
    
    def test_list_tasks_with_search(self):
        """Test task listing with search filter."""
        async def run_test():
            result = await list_tasks(
                search="test",
                limit=10
            )
            
            assert result["success"] is True
            assert "tasks" in result
        
        asyncio.run(run_test())
    
    def test_complete_task_success(self, sample_task):
        """Test successful task completion."""
        async def run_test():
            if not sample_task:
                pytest.skip("Sample task creation failed")
            
            result = await complete_task(id=sample_task["id"])
            
            assert result["success"] is True
            assert "task" in result
            assert result["task"]["completed"] is True
        
        asyncio.run(run_test())
    
    def test_delete_task_success(self, sample_task):
        """Test successful task deletion."""
        async def run_test():
            if not sample_task:
                pytest.skip("Sample task creation failed")
            
            result = await delete_task(id=sample_task["id"])
            
            assert result["success"] is True
            assert result["deleted"] is True
        
        asyncio.run(run_test())
    
    def test_list_available_tools(self):
        """Test tool discovery."""
        async def run_test():
            result = await list_available_tools()
            
            assert result["success"] is True
            assert "tools" in result
            assert "add_task" in result["tools"]
            assert "list_tasks" in result["tools"]
            assert "update_task" in result["tools"]
            assert "complete_task" in result["tools"]
            assert "delete_task" in result["tools"]
        
        asyncio.run(run_test())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
