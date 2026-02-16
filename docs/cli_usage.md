# CLI Usage Documentation

## Overview
This document provides instructions for using the deterministic in-memory CLI task manager.

## Prerequisites
- Python 3.9 or higher

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