"""
Basic test to verify the implementation works as expected.
"""
from apps.cli.main import main
from apps.cli.task_service import TaskService
from apps.cli.task_manager import TaskManager


def test_basic_functionality():
    """Test basic functionality of the task manager."""
    print("Testing basic functionality...")
    
    # Initialize the task service and manager
    task_service = TaskService()
    task_manager = TaskManager(task_service)
    
    # Test adding a task
    print("\n1. Adding a task:")
    task = task_manager.add_deterministic_task("Test Task", "Test Description")
    print(f"Added task: {task.to_dict()}")
    
    # Test getting all tasks
    print("\n2. Getting all tasks:")
    tasks = task_manager.get_all_deterministic_tasks()
    print(f"Found {len(tasks)} tasks")
    for task in tasks:
        print(f"  - {task}")
    
    # Test completing a task
    print("\n3. Completing the task:")
    completed_task = task_manager.complete_deterministic_task(task.id)
    print(f"Completed task: {completed_task}")
    
    # Test updating a task
    print("\n4. Updating the task:")
    updated_task = task_manager.update_deterministic_task(task.id, "Updated Test Task", "Updated Description")
    print(f"Updated task: {updated_task}")
    
    # Test listing all tasks again
    print("\n5. Getting all tasks after updates:")
    tasks = task_manager.get_all_deterministic_tasks()
    print(f"Found {len(tasks)} tasks")
    for task in tasks:
        print(f"  - {task}")
    
    # Test deleting the task
    print("\n6. Deleting the task:")
    result = task_manager.delete_deterministic_task(task.id)
    print(f"Deletion result: {result}")
    
    # Test that the task is gone
    print("\n7. Verifying task deletion:")
    tasks = task_manager.get_all_deterministic_tasks()
    print(f"Found {len(tasks)} tasks after deletion")


if __name__ == "__main__":
    test_basic_functionality()