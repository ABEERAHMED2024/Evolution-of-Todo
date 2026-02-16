"""
Integration test for complete command.
"""
import unittest

from apps.cli.task_service import TaskService
from apps.cli.commands.complete_command import CompleteCommand


class TestCompleteCommand(unittest.TestCase):
    """
    Integration tests for the CompleteCommand class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
        self.complete_command = CompleteCommand(self.task_service)
    
    def test_execute_complete_command_success(self):
        """
        Test that executing the complete command with valid task ID succeeds.
        """
        # Add a task
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Verify the task is initially incomplete
        retrieved_task = self.task_service.get_task(task_id)
        self.assertEqual(retrieved_task.status, "incomplete")
        
        # Execute the complete command
        result = self.complete_command.execute(task_id)
        
        # Check that the result contains success message and task details
        self.assertIn("Task marked as complete", result)
        self.assertIn("complete", result)
        
        # Verify that the task status was updated to complete
        updated_task = self.task_service.get_task(task_id)
        self.assertEqual(updated_task.status, "complete")
    
    def test_execute_complete_command_already_complete(self):
        """
        Test that executing the complete command on an already complete task succeeds (idempotent).
        """
        # Add a task
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Complete the task first
        self.task_service.complete_task(task_id)
        
        # Verify the task is complete
        retrieved_task = self.task_service.get_task(task_id)
        self.assertEqual(retrieved_task.status, "complete")
        
        # Execute the complete command again (idempotent operation)
        result = self.complete_command.execute(task_id)
        
        # Check that the result contains success message
        self.assertIn("Task marked as complete", result)
        
        # Verify that the task status is still complete
        updated_task = self.task_service.get_task(task_id)
        self.assertEqual(updated_task.status, "complete")
    
    def test_execute_complete_command_not_found(self):
        """
        Test that executing the complete command with invalid task ID returns error.
        """
        # Execute the complete command with non-existent task ID
        result = self.complete_command.execute(999)
        
        # Check that the result contains error message
        self.assertIn("Error completing task", result)
        self.assertIn("not found", result)


if __name__ == '__main__':
    unittest.main()