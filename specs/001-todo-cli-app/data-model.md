# Data Model: Phase I Deterministic CLI Task Manager

## Overview
This document defines the data structures and relationships for the deterministic in-memory CLI task manager.

## Core Entities

### Task
The primary entity representing a single task in the system.

**Fields:**
- `id` (integer): Unique identifier assigned automatically; positive integer, sequential
- `title` (string): Required task title; non-empty, max 200 characters
- `description` (string): Optional task description; nullable, max 1000 characters  
- `status` (string): Task completion status; values: "incomplete", "complete"
- `created_at` (datetime): Timestamp when task was created; ISO 8601 format
- `updated_at` (datetime): Timestamp when task was last updated; ISO 8601 format

**Validation Rules:**
- `title` must not be empty or consist only of whitespace
- `status` must be one of the allowed values
- `id` must be unique within the system
- `created_at` and `updated_at` must be valid timestamps

**State Transitions:**
- `incomplete` → `complete` (when task is marked as complete)
- `complete` → `incomplete` (when task is marked as incomplete)

**Deterministic Properties:**
- IDs are assigned sequentially starting from 1
- Creation timestamp is set only at creation time
- Update timestamp is updated on any modification
- Operations with identical inputs produce identical results

## Relationships
None in this phase (in-memory only, no relational data).

## Collections

### TaskCollection
An in-memory collection that stores all tasks.

**Operations:**
- `add(task)`: Adds a new task to the collection, assigns next available ID
- `get_by_id(id)`: Retrieves a task by its ID
- `get_all()`: Returns all tasks in the collection
- `update(id, updates)`: Updates a task with the specified ID
- `delete(id)`: Removes a task with the specified ID
- `clear()`: Removes all tasks from the collection

**Deterministic Properties:**
- Addition order is preserved
- Sequential ID assignment is guaranteed
- Operations produce consistent results for identical inputs
- Collection state is fully determined by the sequence of operations performed on it

## Validation Layer

### TaskValidator
Validates task data before creation or updates.

**Validation Functions:**
- `validate_title(title)`: Ensures title meets requirements
- `validate_status(status)`: Ensures status is valid
- `validate_task_data(data)`: Validates all task fields collectively

## Error Types

### ValidationError
Raised when task data fails validation.

### NotFoundError
Raised when attempting to access a non-existent task.

### DeterministicOperationError
Raised when an operation would violate deterministic behavior requirements.