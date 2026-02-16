"""
Integration test for add command.
"""
import unittest

from apps.cli.task_service import TaskService
from apps.cli.commands.add_command import AddCommand


class TestAddCommand(unittest.TestCase):
    """
    Integration tests for the AddCommand class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
        self.add_command = AddCommand(self.task_service)
    
    def test_execute_add_command_success(self):
        """
        Test that executing the add command with valid data succeeds.
        """
        title = "Test Task"
        description = "Test Description"
        
        result = self.add_command.execute(title, description)
        
        # Check that the result contains success message and task details
        self.assertIn("Task added successfully", result)
        self.assertIn(title, result)
        self.assertIn(description, result)
        
        # Verify that the task was actually added to the service
        tasks = self.task_service.get_all_tasks()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0].title, title)
        self.assertEqual(tasks[0].description, description)
        self.assertEqual(tasks[0].status, "incomplete")
    
    def test_execute_add_command_without_description(self):
        """
        Test that executing the add command without description succeeds.
        """
        title = "Test Task"
        
        result = self.add_command.execute(title)
        
        # Check that the result contains success message and task details
        self.assertIn("Task added successfully", result)
        self.assertIn(title, result)
        
        # Verify that the task was actually added to the service
        tasks = self.task_service.get_all_tasks()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0].title, title)
        self.assertIsNone(tasks[0].description)
        self.assertEqual(tasks[0].status, "incomplete")
    
    def test_execute_add_command_invalid_title(self):
        """
        Test that executing the add command with invalid title returns error.
        """
        title = ""
        description = "Test Description"
        
        result = self.add_command.execute(title, description)
        
        # Check that the result contains error message
        self.assertIn("Error adding task", result)
        
        # Verify that no task was added to the service
        tasks = self.task_service.get_all_tasks()
        self.assertEqual(len(tasks), 0)


if __name__ == '__main__':
    unittest.main()