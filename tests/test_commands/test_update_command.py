"""
Integration test for update command.
"""
import unittest

from apps.cli.task_service import TaskService
from apps.cli.commands.update_command import UpdateCommand


class TestUpdateCommand(unittest.TestCase):
    """
    Integration tests for the UpdateCommand class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
        self.update_command = UpdateCommand(self.task_service)
    
    def test_execute_update_command_success(self):
        """
        Test that executing the update command with valid data succeeds.
        """
        # Add a task
        original_task = self.task_service.add_task("Original Task", "Original Description")
        task_id = original_task.id
        
        # Verify the original task
        retrieved_task = self.task_service.get_task(task_id)
        self.assertEqual(retrieved_task.title, "Original Task")
        self.assertEqual(retrieved_task.description, "Original Description")
        
        # Execute the update command
        new_title = "Updated Task"
        new_description = "Updated Description"
        result = self.update_command.execute(task_id, new_title, new_description)
        
        # Check that the result contains success message
        self.assertIn("Task updated successfully", result)
        self.assertIn(new_title, result)
        self.assertIn(new_description, result)
        
        # Verify that the task was updated
        updated_task = self.task_service.get_task(task_id)
        self.assertEqual(updated_task.title, new_title)
        self.assertEqual(updated_task.description, new_description)
        self.assertEqual(updated_task.id, task_id)  # ID should remain unchanged
    
    def test_execute_update_command_partial_update(self):
        """
        Test that executing the update command with partial data succeeds.
        """
        # Add a task
        original_task = self.task_service.add_task("Original Task", "Original Description")
        task_id = original_task.id
        
        # Verify the original task
        retrieved_task = self.task_service.get_task(task_id)
        self.assertEqual(retrieved_task.title, "Original Task")
        self.assertEqual(retrieved_task.description, "Original Description")
        
        # Execute the update command with only title
        new_title = "Updated Task"
        result = self.update_command.execute(task_id, new_title)
        
        # Check that the result contains success message
        self.assertIn("Task updated successfully", result)
        self.assertIn(new_title, result)
        
        # Verify that the task was updated with new title but original description
        updated_task = self.task_service.get_task(task_id)
        self.assertEqual(updated_task.title, new_title)
        self.assertEqual(updated_task.description, "Original Description")  # Should remain unchanged
        self.assertEqual(updated_task.id, task_id)  # ID should remain unchanged
    
    def test_execute_update_command_not_found(self):
        """
        Test that executing the update command with invalid task ID returns error.
        """
        # Execute the update command with non-existent task ID
        result = self.update_command.execute(999, "New Title", "New Description")
        
        # Check that the result contains error message
        self.assertIn("Error updating task", result)
        self.assertIn("not found", result)


if __name__ == '__main__':
    unittest.main()