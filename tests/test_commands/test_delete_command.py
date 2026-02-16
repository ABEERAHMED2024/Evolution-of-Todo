"""
Integration test for delete command.
"""
import unittest

from apps.cli.task_service import TaskService
from apps.cli.commands.delete_command import DeleteCommand


class TestDeleteCommand(unittest.TestCase):
    """
    Integration tests for the DeleteCommand class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
        self.delete_command = DeleteCommand(self.task_service)
    
    def test_execute_delete_command_success(self):
        """
        Test that executing the delete command with valid task ID succeeds.
        """
        # Add a task
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Verify the task exists
        retrieved_task = self.task_service.get_task(task_id)
        self.assertEqual(retrieved_task.id, task_id)
        
        # Execute the delete command
        result = self.delete_command.execute(task_id)
        
        # Check that the result contains success message
        self.assertIn(f"Task with ID {task_id} deleted successfully", result)
        
        # Verify that the task no longer exists
        with self.assertRaises(Exception):  # Assuming NotFoundError or similar
            self.task_service.get_task(task_id)
    
    def test_execute_delete_command_not_found(self):
        """
        Test that executing the delete command with invalid task ID returns error.
        """
        # Execute the delete command with non-existent task ID
        result = self.delete_command.execute(999)
        
        # Check that the result contains error message
        self.assertIn("Error deleting task", result)
        self.assertIn("not found", result)


if __name__ == '__main__':
    unittest.main()