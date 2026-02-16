"""
Unit tests for deterministic task operations in the task service.
"""
import unittest
from datetime import datetime

from apps.cli.task_service import TaskService
from apps.cli.models.task import Task
from apps.cli.utils.error_handlers import ValidationError, NotFoundError


class TestTaskService(unittest.TestCase):
    """
    Unit tests for the TaskService class.
    """
    
    def setUp(self):
        """
        Set up the test environment before each test.
        """
        self.task_service = TaskService()
    
    def test_add_task_success(self):
        """
        Test that adding a task with valid data succeeds.
        """
        title = "Test Task"
        description = "Test Description"
        
        task = self.task_service.add_task(title, description)
        
        self.assertIsInstance(task, Task)
        self.assertEqual(task.title, title)
        self.assertEqual(task.description, description)
        self.assertEqual(task.status, "incomplete")
        self.assertIsNotNone(task.id)
        self.assertGreaterEqual(task.id, 1)
    
    def test_add_task_without_description(self):
        """
        Test that adding a task without a description succeeds.
        """
        title = "Test Task"
        
        task = self.task_service.add_task(title)
        
        self.assertIsInstance(task, Task)
        self.assertEqual(task.title, title)
        self.assertIsNone(task.description)
        self.assertEqual(task.status, "incomplete")
        self.assertIsNotNone(task.id)
    
    def test_add_task_invalid_title_empty(self):
        """
        Test that adding a task with an empty title raises ValidationError.
        """
        with self.assertRaises(ValidationError):
            self.task_service.add_task("")
    
    def test_add_task_invalid_title_whitespace_only(self):
        """
        Test that adding a task with a whitespace-only title raises ValidationError.
        """
        with self.assertRaises(ValidationError):
            self.task_service.add_task("   ")
    
    def test_add_task_invalid_title_too_long(self):
        """
        Test that adding a task with a title exceeding 200 characters raises ValidationError.
        """
        long_title = "a" * 201
        with self.assertRaises(ValidationError):
            self.task_service.add_task(long_title)
    
    def test_get_task_success(self):
        """
        Test that getting an existing task succeeds.
        """
        title = "Test Task"
        description = "Test Description"
        task = self.task_service.add_task(title, description)
        task_id = task.id
        
        retrieved_task = self.task_service.get_task(task_id)
        
        self.assertEqual(retrieved_task.id, task_id)
        self.assertEqual(retrieved_task.title, title)
        self.assertEqual(retrieved_task.description, description)
        self.assertEqual(retrieved_task.status, "incomplete")
    
    def test_get_task_not_found(self):
        """
        Test that getting a non-existent task raises NotFoundError.
        """
        with self.assertRaises(NotFoundError):
            self.task_service.get_task(999)
    
    def test_get_all_tasks_empty(self):
        """
        Test that getting all tasks when none exist returns an empty list.
        """
        tasks = self.task_service.get_all_tasks()
        
        self.assertEqual(len(tasks), 0)
        self.assertIsInstance(tasks, list)
    
    def test_get_all_tasks_multiple(self):
        """
        Test that getting all tasks returns all added tasks.
        """
        task1 = self.task_service.add_task("Task 1", "Description 1")
        task2 = self.task_service.add_task("Task 2", "Description 2")
        task3 = self.task_service.add_task("Task 3", "Description 3")
        
        tasks = self.task_service.get_all_tasks()
        
        self.assertEqual(len(tasks), 3)
        self.assertIn(task1, tasks)
        self.assertIn(task2, tasks)
        self.assertIn(task3, tasks)
    
    def test_update_task_success(self):
        """
        Test that updating a task with valid data succeeds.
        """
        original_title = "Original Task"
        original_description = "Original Description"
        task = self.task_service.add_task(original_title, original_description)
        task_id = task.id
        
        new_title = "Updated Task"
        new_description = "Updated Description"
        
        updated_task = self.task_service.update_task(task_id, new_title, new_description)
        
        self.assertEqual(updated_task.id, task_id)
        self.assertEqual(updated_task.title, new_title)
        self.assertEqual(updated_task.description, new_description)
        self.assertEqual(updated_task.status, "incomplete")  # Status should remain unchanged
    
    def test_update_task_partial(self):
        """
        Test that updating a task with only title or description succeeds.
        """
        original_title = "Original Task"
        original_description = "Original Description"
        task = self.task_service.add_task(original_title, original_description)
        task_id = task.id
        
        new_title = "Updated Task"
        
        updated_task = self.task_service.update_task(task_id, new_title)
        
        self.assertEqual(updated_task.id, task_id)
        self.assertEqual(updated_task.title, new_title)
        self.assertEqual(updated_task.description, original_description)  # Description should remain unchanged
        self.assertEqual(updated_task.status, "incomplete")  # Status should remain unchanged
    
    def test_update_task_not_found(self):
        """
        Test that updating a non-existent task raises NotFoundError.
        """
        with self.assertRaises(NotFoundError):
            self.task_service.update_task(999, "New Title", "New Description")
    
    def test_update_task_invalid_title(self):
        """
        Test that updating a task with an invalid title raises ValidationError.
        """
        task = self.task_service.add_task("Original Task", "Original Description")
        task_id = task.id
        
        with self.assertRaises(ValidationError):
            self.task_service.update_task(task_id, "")  # Empty title
    
    def test_complete_task_success(self):
        """
        Test that completing a task succeeds.
        """
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        completed_task = self.task_service.complete_task(task_id)
        
        self.assertEqual(completed_task.id, task_id)
        self.assertEqual(completed_task.status, "complete")
    
    def test_complete_task_already_complete(self):
        """
        Test that completing an already complete task succeeds (idempotent operation).
        """
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Complete the task first
        completed_task = self.task_service.complete_task(task_id)
        self.assertEqual(completed_task.status, "complete")
        
        # Complete the task again (idempotent operation)
        completed_again_task = self.task_service.complete_task(task_id)
        self.assertEqual(completed_again_task.status, "complete")
    
    def test_complete_task_not_found(self):
        """
        Test that completing a non-existent task raises NotFoundError.
        """
        with self.assertRaises(NotFoundError):
            self.task_service.complete_task(999)
    
    def test_incomplete_task_success(self):
        """
        Test that marking a task as incomplete succeeds.
        """
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # First complete the task
        completed_task = self.task_service.complete_task(task_id)
        self.assertEqual(completed_task.status, "complete")
        
        # Then mark it as incomplete
        incomplete_task = self.task_service.incomplete_task(task_id)
        self.assertEqual(incomplete_task.status, "incomplete")
    
    def test_incomplete_task_already_incomplete(self):
        """
        Test that marking an already incomplete task as incomplete succeeds (idempotent operation).
        """
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Mark the task as incomplete (it's already incomplete by default)
        incomplete_task = self.task_service.incomplete_task(task_id)
        self.assertEqual(incomplete_task.status, "incomplete")
        
        # Mark it as incomplete again (idempotent operation)
        incomplete_again_task = self.task_service.incomplete_task(task_id)
        self.assertEqual(incomplete_again_task.status, "incomplete")
    
    def test_incomplete_task_not_found(self):
        """
        Test that marking a non-existent task as incomplete raises NotFoundError.
        """
        with self.assertRaises(NotFoundError):
            self.task_service.incomplete_task(999)
    
    def test_delete_task_success(self):
        """
        Test that deleting a task succeeds.
        """
        task = self.task_service.add_task("Test Task", "Test Description")
        task_id = task.id
        
        # Verify the task exists
        existing_task = self.task_service.get_task(task_id)
        self.assertEqual(existing_task.id, task_id)
        
        # Delete the task
        result = self.task_service.delete_task(task_id)
        self.assertTrue(result)
        
        # Verify the task no longer exists
        with self.assertRaises(NotFoundError):
            self.task_service.get_task(task_id)
    
    def test_delete_task_not_found(self):
        """
        Test that deleting a non-existent task raises NotFoundError.
        """
        with self.assertRaises(NotFoundError):
            self.task_service.delete_task(999)


    def test_list_command_integration(self):
        """
        Test the integration of list command with task service.
        """
        # Add some tasks
        task1 = self.task_service.add_task("Task 1", "Description 1")
        task2 = self.task_service.add_task("Task 2", "Description 2")
        
        # Create a list command
        from apps.cli.commands.list_command import ListCommand
        list_command = ListCommand(self.task_service)
        
        # Execute the list command
        result = list_command.execute()
        
        # Check that the result contains the tasks
        self.assertIn("Task 1", result)
        self.assertIn("Task 2", result)
        self.assertIn("Description 1", result)
        self.assertIn("Description 2", result)
        self.assertIn("Found 2 task(s)", result)


if __name__ == '__main__':
    unittest.main()