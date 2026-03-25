#!/usr/bin/env python3
"""
Simple test script for MCP Tools.
Run with: python test_mcp_simple.py
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path (parent of backend)
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.mcp_tools_local.tools import add_task, list_tasks, complete_task, delete_task, list_available_tools


async def test_mcp_tools():
    """Test MCP tools functionality."""
    print("=" * 60)
    print("MCP Tools Test Suite")
    print("=" * 60)
    
    # Test 1: Add Task
    print("\n[TEST 1] Adding task...")
    result = await add_task(
        title="Test Task - Buy Groceries",
        description="Milk, eggs, bread"
    )
    if result["success"]:
        print(f"✓ Task created successfully with ID: {result['task']['id']}")
        task_id = result["task"]["id"]
    else:
        print(f"✗ Failed to create task: {result.get('error', {})}")
        return False
    
    # Test 2: List Tasks
    print("\n[TEST 2] Listing tasks...")
    result = await list_tasks(status="all", limit=10)
    if result["success"]:
        print(f"✓ Listed {len(result['tasks'])} task(s), total: {result['total']}")
    else:
        print(f"✗ Failed to list tasks: {result.get('error', {})}")
        return False
    
    # Test 3: List with search
    print("\n[TEST 3] Searching tasks...")
    result = await list_tasks(search="groceries", limit=10)
    if result["success"]:
        print(f"✓ Found {len(result['tasks'])} task(s) matching 'groceries'")
    else:
        print(f"✗ Failed to search tasks")
        return False
    
    # Test 4: Complete Task
    print(f"\n[TEST 4] Completing task {task_id}...")
    result = await complete_task(id=task_id)
    if result["success"]:
        print(f"✓ Task {task_id} marked as complete")
    else:
        print(f"✗ Failed to complete task: {result.get('error', {})}")
        return False
    
    # Test 5: Delete Task
    print(f"\n[TEST 5] Deleting task {task_id}...")
    result = await delete_task(id=task_id)
    if result["success"]:
        print(f"✓ Task {task_id} deleted successfully")
    else:
        print(f"✗ Failed to delete task: {result.get('error', {})}")
        return False
    
    # Test 6: List Available Tools
    print("\n[TEST 6] Listing available tools...")
    result = await list_available_tools()
    if result["success"]:
        tools = list(result["tools"].keys())
        print(f"✓ Available tools: {', '.join(tools)}")
    else:
        print(f"✗ Failed to list tools")
        return False
    
    # Test 7: Error Handling - Empty Title
    print("\n[TEST 7] Testing error handling (empty title)...")
    result = await add_task(title="", description="Should fail")
    if not result["success"]:
        print(f"✓ Correctly rejected empty title: {result.get('error', {}).get('type', 'Unknown')}")
    else:
        print(f"✗ Should have failed with empty title")
        return False
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED ✓")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_mcp_tools())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test suite failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
