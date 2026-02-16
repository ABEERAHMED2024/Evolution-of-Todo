# CLI Usage Documentation

## Overview
This document provides instructions for using the deterministic persistent CLI task manager with PostgreSQL storage.

## Prerequisites
- Python 3.9 or higher
- PostgreSQL database (local or remote)
- Environment variables configured (DATABASE_URL, STORAGE_BACKEND)

## Configuration

The application supports configurable storage backends:

- **PostgreSQL Mode (Default)**: Set `STORAGE_BACKEND=postgres`
- **In-Memory Mode**: Set `STORAGE_BACKEND=memory`

Environment variables:
```
DATABASE_URL=postgresql://username:password@host:port/database_name
STORAGE_BACKEND=postgres  # or 'memory' for in-memory mode
```

## Running the Application

Execute the CLI application:
```bash
python -m apps.cli.main --help
```

This will display the available commands and their usage.

## Available Commands

### Add a Task
```bash
python -m apps.cli.main add --title "Task Title" --description "Task Description"
```

### List All Tasks
```bash
python -m apps.cli.main list
```

### Update a Task
```bash
python -m apps.cli.main update --id 1 --title "New Title" --description "New Description"
```

### Mark Task as Complete
```bash
python -m apps.cli.main complete --id 1
```

### Delete a Task
```bash
python -m apps.cli.main delete --id 1
```

## Example Usage

1. Add a new task:
   ```bash
   python -m apps.cli.main add --title "Buy groceries" --description "Milk, bread, eggs"
   ```

2. List all tasks:
   ```bash
   python -m apps.cli.main list
   ```

3. Mark the task as complete:
   ```bash
   python -m apps.cli.main complete --id 1
   ```

4. Update the task:
   ```bash
   python -m apps.cli.main update --id 1 --title "Buy shopping" --description "Milk, bread, eggs, fruits"
   ```

5. Delete the task:
   ```bash
   python -m apps.cli.main delete --id 1
   ```

## Persistent Behavior Verification

To verify persistent behavior:
1. Perform a sequence of operations
2. Restart the application
3. Perform the same sequence of operations
4. Verify that data persists across restarts

Example:
```bash
# Add a task
python -m apps.cli.main add --title "Persistent Task" --description "This should persist"
# List tasks to confirm it exists
python -m apps.cli.main list
# Restart the application and list again to confirm persistence
python -m apps.cli.main list
# The task should still exist
```

## Deterministic Behavior Verification

To verify deterministic behavior:
1. Perform the same sequence of operations twice
2. Compare the final state of the application
3. Both states should be identical

Example:
```bash
# First run
python -m apps.cli.main add --title "Test" && python -m apps.cli.main list
# Second run (after restarting the application)
python -m apps.cli.main add --title "Test" && python -m apps.cli.main list
# Results should be identical
```

## Error Handling

The application provides clear error messages for invalid operations:
- Attempting to access a non-existent task
- Providing invalid arguments to commands
- Empty titles when required
- Database connection issues