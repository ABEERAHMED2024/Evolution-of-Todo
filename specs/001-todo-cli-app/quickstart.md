# Quickstart Guide: Phase I Deterministic CLI Task Manager

## Overview
This guide provides instructions for setting up and running the deterministic in-memory CLI task manager.

## Prerequisites
- Python 3.9 or higher
- pip (Python package installer)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Evolution-of-Todo
   ```

2. Navigate to the CLI app directory:
   ```bash
   cd apps/cli
   ```

3. Install dependencies (though this phase uses only built-in libraries):
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

Execute the CLI application:
```bash
python main.py --help
```

This will display the available commands and their usage.

## Available Commands

### Add a Task
```bash
python main.py add --title "Task Title" --description "Task Description"
```

### List All Tasks
```bash
python main.py list
```

### Update a Task
```bash
python main.py update --id 1 --title "New Title" --description "New Description"
```

### Mark Task as Complete
```bash
python main.py complete --id 1
```

### Delete a Task
```bash
python main.py delete --id 1
```

## Example Usage

1. Add a new task:
   ```bash
   python main.py add --title "Buy groceries" --description "Milk, bread, eggs"
   ```

2. List all tasks:
   ```bash
   python main.py list
   ```

3. Mark the task as complete:
   ```bash
   python main.py complete --id 1
   ```

4. Update the task:
   ```bash
   python main.py update --id 1 --title "Buy shopping" --description "Milk, bread, eggs, fruits"
   ```

5. Delete the task:
   ```bash
   python main.py delete --id 1
   ```

## Deterministic Behavior Verification

To verify deterministic behavior:
1. Perform the same sequence of operations twice
2. Compare the final state of the application
3. Both states should be identical

Example:
```bash
# First run
python main.py add --title "Test" && python main.py list
# Second run (after restarting the application)
python main.py add --title "Test" && python main.py list
# Results should be identical
```

## Error Handling

The application provides clear error messages for invalid operations:
- Attempting to access a non-existent task
- Providing invalid arguments to commands
- Empty titles when required

## Testing

Run the test suite to verify functionality:
```bash
python -m pytest tests/
```

For comprehensive coverage of deterministic behavior:
```bash
python -m pytest tests/test_task_manager.py
```