# API Contract: Task Management CLI Commands

## Overview
This document defines the command-line interface contracts for the deterministic task manager.

## Command Structure
```
python main.py <command> [options]
```

## Commands

### 1. Add Task
**Command**: `add`
**Description**: Creates a new task with a title and optional description
**Arguments**:
- `--title` (required): Task title (string, 1-200 characters)
- `--description` (optional): Task description (string, 0-1000 characters)

**Response**:
- Success: JSON object with task details including assigned ID
- Error: Error message with specific reason

**Example**:
```bash
python main.py add --title "Buy groceries" --description "Milk, bread, eggs"
```

### 2. List Tasks
**Command**: `list`
**Description**: Displays all tasks with their details
**Arguments**: None
**Response**:
- Success: JSON array of all tasks with ID, title, description, and status
- Error: Error message if operation fails

**Example**:
```bash
python main.py list
```

### 3. Update Task
**Command**: `update`
**Description**: Updates an existing task's title and/or description
**Arguments**:
- `--id` (required): Task ID (positive integer)
- `--title` (optional): New task title (string, 1-200 characters)
- `--description` (optional): New task description (string, 0-1000 characters)

**Response**:
- Success: JSON object with updated task details
- Error: Error message if task doesn't exist or validation fails

**Example**:
```bash
python main.py update --id 1 --title "Buy shopping" --description "Milk, bread, eggs, fruits"
```

### 4. Complete Task
**Command**: `complete`
**Description**: Marks a task as complete
**Arguments**:
- `--id` (required): Task ID (positive integer)

**Response**:
- Success: JSON object with updated task showing complete status
- Error: Error message if task doesn't exist

**Example**:
```bash
python main.py complete --id 1
```

### 5. Delete Task
**Command**: `delete`
**Description**: Removes a task by its ID
**Arguments**:
- `--id` (required): Task ID (positive integer)

**Response**:
- Success: Confirmation message
- Error: Error message if task doesn't exist

**Example**:
```bash
python main.py delete --id 1
```

## Error Response Format
All error responses follow this format:
```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

## Success Response Format
Successful responses vary by command but typically follow:
```json
{
  "error": false,
  "data": { /* command-specific data */ },
  "timestamp": "ISO 8601 timestamp"
}
```

## Deterministic Guarantees
- Identical sequences of commands with identical inputs will produce identical results
- Task IDs are assigned sequentially starting from 1
- Operation order is preserved
- State is fully determined by the sequence of operations performed