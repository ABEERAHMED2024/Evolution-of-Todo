"""
Integration test for list command.
"""
import unittest

from apps.cli.task_service import TaskService
from apps.cli.commands.list_command import ListCommand


class TestListCommand(unittest.TestCase):
    """
    Integration tests for the ListCommand class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
        self.list_command = ListCommand(self.task_service)
    
    def test_execute_list_command_with_tasks(self):
        """
        Test that executing the list command with tasks returns the tasks.
        """
        # Add some tasks
        task1 = self.task_service.add_task("Task 1", "Description 1")
        task2 = self.task_service.add_task("Task 2", "Description 2")
        
        result = self.list_command.execute()
        
        # Check that the result contains the tasks
        self.assertIn("Task 1", result)
        self.assertIn("Task 2", result)
        self.assertIn("Description 1", result)
        self.assertIn("Description 2", result)
        self.assertIn("Found 2 task(s)", result)
        self.assertIn(f"ID: {task1.id}", result)
        self.assertIn(f"ID: {task2.id}", result)
    
    def test_execute_list_command_empty(self):
        """
        Test that executing the list command with no tasks returns appropriate message.
        """
        result = self.list_command.execute()
        
        # Check that the result indicates no tasks found
        self.assertIn("No tasks found", result)
    
    def test_execute_list_command_after_modifications(self):
        """
        Test that executing the list command shows updated tasks.
        """
        # Add a task
        task = self.task_service.add_task("Original Task", "Original Description")
        task_id = task.id
        
        # Update the task
        self.task_service.update_task(task_id, "Updated Task", "Updated Description")
        
        result = self.list_command.execute()
        
        # Check that the result contains the updated task
        self.assertIn("Updated Task", result)
        self.assertIn("Updated Description", result)
        self.assertNotIn("Original Task", result)
        self.assertNotIn("Original Description", result)


if __name__ == '__main__':
    unittest.main()