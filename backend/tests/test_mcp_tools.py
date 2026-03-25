"""
Tests for MCP Tools.
Phase III: MCP Tools - Unit tests for task management tools.

Run tests with:
    pytest backend/tests/test_mcp_tools.py -v
"""
import pytest
import asyncio
from typing import Dict, Any

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
    
    def test_add_task_title_too_long(self):
        """Test task creation with title exceeding 200 characters."""
        async def run_test():
            long_title = "A" * 201
            result = await add_task(
                title=long_title,
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
    
    def test_list_tasks_pagination(self):
        """Test task listing with pagination."""
        async def run_test():
            # Get first page
            result1 = await list_tasks(limit=5, offset=0)
            
            # Get second page
            result2 = await list_tasks(limit=5, offset=5)
            
            assert result1["success"] is True
            assert result2["success"] is True
            assert len(result1["tasks"]) <= 5
            assert result1["offset"] == 0
            assert result2["offset"] == 5
        
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
            # All returned tasks should contain "test" in title or description
            for task in result["tasks"]:
                assert (
                    "test" in task["title"].lower() or
                    (task["description"] and "test" in task["description"].lower())
                )
        
        asyncio.run(run_test())
    
    def test_update_task_success(self, sample_task):
        """Test successful task update."""
        async def run_test():
            if not sample_task:
                pytest.skip("Sample task creation failed")
            
            result = await update_task(
                id=sample_task["id"],
                title="Updated Title"
            )
            
            assert result["success"] is True
            assert "task" in result
            assert result["task"]["title"] == "Updated Title"
        
        asyncio.run(run_test())
    
    def test_update_task_not_found(self):
        """Test updating non-existent task."""
        async def run_test():
            result = await update_task(
                id=99999,
                title="Should fail"
            )
            
            assert result["success"] is False
            assert "error" in result
        
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
            assert "message" in result
        
        asyncio.run(run_test())
    
    def test_complete_task_not_found(self):
        """Test completing non-existent task."""
        async def run_test():
            result = await complete_task(id=99999)
            
            assert result["success"] is False
            assert "error" in result
        
        asyncio.run(run_test())
    
    def test_delete_task_success(self, sample_task):
        """Test successful task deletion."""
        async def run_test():
            if not sample_task:
                pytest.skip("Sample task creation failed")
            
            result = await delete_task(id=sample_task["id"])
            
            assert result["success"] is True
            assert result["deleted"] is True
            assert result["task_id"] == sample_task["id"]
        
        asyncio.run(run_test())
    
    def test_delete_task_not_found(self):
        """Test deleting non-existent task."""
        async def run_test():
            result = await delete_task(id=99999)
            
            assert result["success"] is False
            assert "error" in result
        
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


class TestMCPToolsIntegration:
    """Integration tests for MCP tools workflow."""
    
    def test_full_task_lifecycle(self):
        """Test complete task lifecycle: create → list → update → complete → delete."""
        async def run_test():
            # 1. Create task
            create_result = await add_task(
                title="Lifecycle Test",
                description="Testing full lifecycle"
            )
            assert create_result["success"] is True
            task_id = create_result["task"]["id"]
            
            # 2. List tasks (should include our task)
            list_result = await list_tasks(status="all", limit=10)
            assert list_result["success"] is True
            task_ids = [t["id"] for t in list_result["tasks"]]
            assert task_id in task_ids
            
            # 3. Update task
            update_result = await update_task(
                id=task_id,
                title="Updated Lifecycle Test"
            )
            assert update_result["success"] is True
            assert update_result["task"]["title"] == "Updated Lifecycle Test"
            
            # 4. Complete task
            complete_result = await complete_task(id=task_id)
            assert complete_result["success"] is True
            assert complete_result["task"]["completed"] is True
            
            # 5. Delete task
            delete_result = await delete_task(id=task_id)
            assert delete_result["success"] is True
            assert delete_result["deleted"] is True
            
            # 6. Verify deletion
            list_result2 = await list_tasks(status="all", limit=10)
            task_ids2 = [t["id"] for t in list_result2["tasks"]]
            assert task_id not in task_ids2
        
        asyncio.run(run_test())
    
    def test_error_handling_consistency(self):
        """Test that all tools return consistent error format."""
        async def run_test():
            # Test all tools with invalid ID
            tools_to_test = [
                update_task(id=99999, title="Test"),
                complete_task(id=99999),
                delete_task(id=99999)
            ]
            
            for result in await asyncio.gather(*tools_to_test):
                assert result["success"] is False
                assert "error" in result
                assert "type" in result["error"]
                assert "message" in result["error"]
        
        asyncio.run(run_test())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
