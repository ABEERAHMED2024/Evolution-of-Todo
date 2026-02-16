---
description: "Task list for Phase II Persistent CLI Task Manager"
---

---

# 🔒 ARCHITECTURAL ENFORCEMENT TASKS (MUST COMPLETE FIRST)

These tasks are mandatory and must be completed before any other phase.

---

## A1 – Create Repository Interface (BLOCKING)

- [ ] Create file: src/repositories/task_repository.py
- [ ] Define abstract base class TaskRepository
- [ ] Define methods:
    - add(task)
    - get_all()
    - get_by_id(task_id)
    - update(task)
    - delete(task_id)
- [ ] Ensure no SQLModel imports in this file
- [ ] Service layer must depend ONLY on this interface

---

## A2 – Refactor Service Layer to Use Interface (BLOCKING)

- [ ] Modify TaskService to accept TaskRepository via dependency injection
- [ ] Remove any in-memory storage logic
- [ ] Ensure zero SQL or DB session usage inside service layer
- [ ] Verify CLI imports only TaskService

---

## A3 – Create PostgresTaskRepository Implementation

- [ ] Create file: src/repositories/postgres_task_repository.py
- [ ] Implement TaskRepository interface
- [ ] Use SQLModel for persistence
- [ ] Contain all DB session logic in this file only
- [ ] Enforce ORDER BY id ASC in all retrieval queries

---

## A4 – Docker PostgreSQL Setup

- [ ] Update docker-compose.yml
- [ ] Add PostgreSQL service with:
    - Versioned image
    - Named volume
    - Environment variables
    - Exposed port
- [ ] Ensure DATABASE_URL uses environment variables
- [ ] No hardcoded localhost in source code

---

## A5 – Alembic Migration Setup

- [ ] Run alembic init
- [ ] Configure alembic.ini
- [ ] Generate initial migration
- [ ] Verify upgrade head works
- [ ] Verify downgrade works
- [ ] Fail application if migration state invalid

---

## A6 – Deterministic Ordering Test

- [ ] Add integration test validating ORDER BY id ASC
- [ ] Restart app simulation
- [ ] Confirm identical output sequence
- [ ] No random ID generation allowed

---

## A7 – Test Database Isolation

- [ ] Configure separate test database
- [ ] Ensure DB reset between tests
- [ ] No production DB usage in test suite

---

## A8 – CLI Isolation Verification

- [ ] Confirm CLI layer does NOT import SQLModel
- [ ] Confirm CLI layer does NOT access DB sessions
- [ ] Confirm only Service layer is accessed


# Tasks: Phase II Persistent CLI Task Manager

**Input**: Design documents from `/specs/002-persistent-cli-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [FR-002] Install SQLModel and PostgreSQL dependencies in requirements.txt
- [ ] T002 [P] [FR-019] Create base repository interface in apps/cli/repositories/base_repository.py
- [ ] T003 [P] [FR-020] Create configuration management utility in apps/cli/config.py
- [ ] T004 [P] [FR-018] Set up Docker configuration for PostgreSQL in docker-compose.yml
- [ ] T005 [P] [FR-016] Extend error handling utilities for database errors in apps/cli/utils/error_handlers.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [FR-002] Create SQLModel Task entity in apps/cli/models/task.py
- [ ] T007 [FR-019] Create in-memory repository implementation in apps/cli/repositories/memory_repository.py
- [ ] T008 [FR-019] Create PostgreSQL repository implementation in apps/cli/repositories/postgres_repository.py
- [ ] T009 [FR-020] Implement repository factory with configurable backend in apps/cli/repositories/__init__.py
- [ ] Factory must return TaskRepository interface type
- [ ] Service layer must never import PostgresTaskRepository directly
- [ ] No direct DB session injection outside repository implementation
- [ ] T010 [FR-004] Update task service to use repository abstraction in apps/cli/task_service.py
- [ ] T011 [FR-021] Set up Alembic for database migrations in migrations/alembic.ini

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Persistent Task Storage (Priority: P1) 🎯 MVP

**Goal**: Enable tasks to persist across application restarts using PostgreSQL storage

**Independent Test**: The system stores tasks in PostgreSQL database using SQLModel and retrieves them when the application restarts, maintaining all task details including ID, title, description, and status.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [ ] T012 [P] [US1] Unit test for PostgreSQL repository in tests/test_repositories/test_postgres_repo.py
- [ ] T013 [P] [US1] Integration test for persistent storage functionality in tests/test_task_service.py

### Implementation for User Story 1

- [ ] T014 [P] [US1] Update task manager to work with repository abstraction in apps/cli/task_manager.py
- [ ] Verify CLI imports only TaskService
- [ ] Verify no SQLModel imports in CLI layer
- [ ] Verify no database session access from CLI
- [ ] T015 [US1] Implement database connection handling in apps/cli/task_service.py
- [ ] T016 [US1] Update CLI main to initialize with repository in apps/cli/main.py
- [ ] Verify CLI imports only TaskService
- [ ] Verify no SQLModel imports in CLI layer
- [ ] Verify no database session access from CLI
- [ ] T017 [US1] Test acceptance scenario 1: Tasks persist after restart
- [ ] T018 [US1] Test acceptance scenario 2: Completion status preserved after restart
- [ ] T019 [US1] Test acceptance scenario 3: Updated details preserved after restart

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Maintain CLI Behavior (Priority: P1)

**Goal**: Ensure CLI interface continues working exactly as it did in Phase I

**Independent Test**: The system accepts all the same CLI commands as Phase I and produces equivalent outputs.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T020 [P] [US2] Integration test for CLI command compatibility in tests/test_commands/test_cli_compatibility.py

### Implementation for User Story 2

- [ ] T021 [P] [US2] Verify all CLI commands work identically in apps/cli/commands/
- [ ] T022 [US2] Update command handlers to use repository-based service in apps/cli/commands/
- [ ] T023 [US2] Test acceptance scenario 1: Phase I commands work identically
- [ ] T024 [US2] Test acceptance scenario 2: CLI scripts continue to work without modification

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Repository Abstraction (Priority: P2)

**Goal**: Implement clean repository abstraction layer to switch between in-memory and database storage

**Independent Test**: The system allows switching between in-memory and PostgreSQL storage through configuration without changing business logic.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US3] Unit test for repository abstraction in tests/test_repositories/test_base_repo.py
- [ ] T026 [P] [US3] Test switching between storage backends in tests/test_task_service.py

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement configurable storage backend selection in apps/cli/config.py
- [ ] T028 [US3] Ensure business logic remains unchanged regardless of storage in apps/cli/task_service.py
- [ ] T029 [US3] Test acceptance scenario 1: In-memory mode works as in Phase I
- [ ] T030 [US3] Test acceptance scenario 2: PostgreSQL mode persists data
- [ ] T031 [US3] Test acceptance scenario 3: Same operations behave identically across backends

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Migration Strategy (Priority: P3)

**Goal**: Provide clear migration path from Phase I to Phase II with data transfer

**Independent Test**: The system provides a migration tool that transfers existing in-memory data to the PostgreSQL database.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [ ] T032 [P] [US4] Unit test for migration tool in tests/test_migration_tool.py

### Implementation for User Story 4

- [ ] T033 [P] [US4] Create migration tool in migrations/migration_tool.py
- [ ] T034 [US4] Implement data transfer functionality from memory to PostgreSQL
- [ ] T035 [US4] Test acceptance scenario 1: Phase I data transfers to PostgreSQL
- [ ] T036 [US4] Test acceptance scenario 2: Migrated data accessible in Phase II

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T037 [P] Update documentation in docs/cli_usage.md
- [ ] T038 [P] [FR-015] Verify deterministic behavior with database persistence
- [ ] Explicitly validate ORDER BY id ASC in repository queries
- [ ] Add restart simulation test to confirm deterministic output
- [ ] T039 [P] [FR-008] Verify idempotent operations work with database
- [ ] T040 [P] [FR-016] Implement database-specific error handling
- [ ] T041 [P] [FR-012] Ensure appropriate error messages for database operations
- [ ] T042 [P] [FR-013] Test handling of non-existent task identifiers with database
- [ ] T043 [P] [FR-014] Implement configurable data reset option
- [ ] T044 Run quickstart.md validation
- [ ] T045 [P] [FR-006] Verify task display includes all attributes with database
- [ ] T046 [P] [FR-007] Verify marking tasks complete works with persistence
- [ ] T047 [P] [FR-009] Verify updating task details persists correctly
- [ ] T048 [P] [FR-010] Verify task identifiers preserved during updates with database
- [ ] T049 [P] [FR-011] Verify task deletion works with database persistence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - May integrate with other stories but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before commands
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for PostgreSQL repository in tests/test_repositories/test_postgres_repo.py"
Task: "Integration test for persistent storage functionality in tests/test_task_service.py"

# Launch all implementation for User Story 1 together:
Task: "Update task manager to work with repository abstraction in apps/cli/task_manager.py"
Task: "Implement database connection handling in apps/cli/task_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence