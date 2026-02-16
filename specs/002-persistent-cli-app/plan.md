# Implementation Plan: Phase II Persistent CLI Task Manager

**Branch**: `002-persistent-cli-app` | **Date**: 2026-02-16 | **Spec**: [link]
**Input**: Feature specification from `/specs/002-persistent-cli-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of Phase II of the Evolution of Todo project: extending the deterministic in-memory CLI task manager with persistent storage using PostgreSQL via SQLModel. This phase maintains all Phase I CLI functionality while adding database persistence, repository abstraction, and migration capabilities. The application continues to allow users to create, list, update, complete, and delete tasks, but now with data surviving application restarts.

## Technical Context

**Language/Version**: Python 3.9+
**Primary Dependencies**: SQLModel, SQLAlchemy, PostgreSQL driver (asyncpg), Pydantic
**Storage**: PostgreSQL database with SQLModel ORM
**Testing**: Built-in unittest module with database mocking for isolation
**Target Platform**: Command-line interface (maintaining Phase I interface)
**Project Type**: Deterministic Python CLI application with persistent storage
**Performance Goals**: Sub-millisecond response times for all operations (database operations may be slightly slower than in-memory)
**Constraints**: Backward compatibility with Phase I CLI interface, repository abstraction, migration capability
**Scale/Scope**: Single-user, local or remote PostgreSQL connection

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

**PASS** Phase II implementation follows Constitution's Evolution Phases (Persistent Backend with Database)
**PASS** Implementation uses specified tech stack (Python + SQLModel/PostgreSQL)
**PASS** No manual coding - all code generated via Spec-Kit Plus
**PASS** Spec-Driven Development - follows spec.md exactly
**PASS** Cloud-Native by Design - respects conceptual cloud-native principles
**PASS** Backward compatibility with Phase I CLI behavior maintained

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
Evolution-of-Todo/
├── apps/
│   └── cli/
│       ├── __init__.py
│       ├── main.py                   # Entry point and CLI handler (extends Phase I)
│       ├── task_manager.py           # Core task management logic with deterministic operations
│       ├── task_service.py           # Task business logic with validation and error handling
│       ├── repositories/
│       │   ├── __init__.py
│       │   ├── base_repository.py    # Base repository interface
│       │   ├── memory_repository.py  # In-memory implementation (from Phase I)
│       │   └── postgres_repository.py # PostgreSQL implementation (new for Phase II)
│       ├── models/
│       │   ├── __init__.py
│       │   └── task.py               # Task data model with SQLModel integration
│       ├── commands/
│       │   ├── __init__.py
│       │   ├── add_command.py        # Add task command with validation
│       │   ├── list_command.py       # List tasks command
│       │   ├── update_command.py     # Update task command with validation
│       │   ├── complete_command.py   # Complete task command
│       │   └── delete_command.py     # Delete task command with validation
│       └── utils/
│           ├── __init__.py
│           ├── validators.py         # Validation utilities for deterministic behavior
│           ├── error_handlers.py     # Centralized error handling
│           └── helpers.py            # Utility functions
├── migrations/
│   ├── __init__.py
│   └── migration_tool.py             # Data migration from Phase I to Phase II
├── tests/
│   ├── __init__.py
│   ├── test_task_manager.py          # Unit tests for deterministic task operations
│   ├── test_task_service.py          # Unit tests for task service with error handling
│   ├── test_repositories/
│   │   ├── __init__.py
│   │   ├── test_memory_repo.py       # Tests for in-memory repository
│   │   └── test_postgres_repo.py     # Tests for PostgreSQL repository
│   └── test_commands/
│       ├── __init__.py
│       ├── test_add_command.py       # Unit tests for add command
│       ├── test_list_command.py      # Unit tests for list command
│       ├── test_update_command.py    # Unit tests for update command
│       ├── test_complete_command.py  # Unit tests for complete command
│       └── test_delete_command.py    # Unit tests for delete command
├── docs/
│   └── cli_usage.md                  # Documentation for CLI usage
└── requirements.txt                  # Dependencies (includes SQLModel, PostgreSQL drivers)
```

**Structure Decision**: Extends the Phase I structure with a repository abstraction layer that allows switching between in-memory and PostgreSQL storage. The CLI interface remains unchanged to maintain backward compatibility. The repository pattern provides clean separation between business logic and data access concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

---

# Phase II Architectural Hard Constraints (Non-Negotiable)

## 1. Strict Layered Dependency Direction

The system MUST follow this dependency order:

CLI
↓
Service Layer
↓
TaskRepository (interface / abstract base)
↓
PostgresTaskRepository (SQLModel implementation)
↓
PostgreSQL (Docker container)

Upward dependencies are forbidden.

The CLI must never access the database directly.
The Service layer must not execute raw SQL.
All persistence logic must reside exclusively inside the repository implementation.

---

## 2. Repository Abstraction Contract

A formal repository interface MUST exist.

Example:

class TaskRepository(ABC):
    def add(self, task: Task) -> Task: ...
    def get_all(self) -> List[Task]: ...
    def get_by_id(self, task_id: int) -> Optional[Task]: ...
    def update(self, task: Task) -> Task: ...
    def delete(self, task_id: int) -> None: ...

Concrete implementation:

class PostgresTaskRepository(TaskRepository):
    ...

The Service layer must depend ONLY on the abstract interface.

---

## 3. SQLModel Containment Rule

SQLModel models MUST NOT leak into CLI layer.

Options allowed:
- Separate domain model and persistence model
OR
- Explicitly document unified model decision

CLI must not import SQLModel.

---

## 4. ID Strategy (Deterministic Requirement)

The Task table must use:

- Integer primary key
- Auto-increment
- Ordered retrieval using ORDER BY id ASC

UUIDs are forbidden.

Random ID generation is forbidden.

---

## 5. Docker Infrastructure Requirements

PostgreSQL must be defined in docker-compose.yml with:

- Explicit service name
- Versioned image
- Exposed port
- Volume for persistence
- Environment variables for credentials

DATABASE_URL must be environment-driven.
No hardcoded localhost strings allowed in code.

---

## 6. Alembic Migration Requirements

Alembic is mandatory.

