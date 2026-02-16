---
description: "Task list for Phase I Deterministic CLI Task Manager"
---

# Tasks: Phase I Deterministic CLI Task Manager

**Input**: Design documents from `/specs/001-todo-cli-app/`
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

- [ ] T001 [FR-001] Create Python package structure in apps/cli/
- [ ] T002 [P] [FR-001] Create core task data model in apps/cli/models/task.py
- [ ] T003 [P] [FR-018] Create requirements.txt with minimal dependencies
- [ ] T004 [FR-001] Create CLI entry point in apps/cli/main.py
- [ ] T005 [P] [FR-016] Create error handling utilities in apps/cli/utils/error_handlers.py
- [ ] T006 [P] [FR-015] Create validation utilities in apps/cli/utils/validators.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 [FR-004] Implement in-memory storage for tasks in apps/cli/task_collection.py
- [ ] T008 [P] [FR-003] Create task service in apps/cli/task_service.py
- [ ] T009 [FR-015] Implement deterministic operations in apps/cli/task_manager.py
- [ ] T010 [P] [FR-012] Create centralized error handling framework
- [ ] T011 [FR-017] Set up testing framework in tests/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Task (Priority: P1) 🎯 MVP

**Goal**: Enable users to add new tasks with title and description, assigning unique identifiers

**Independent Test**: The system allows a user to add a new task with a title and description, assign it a unique identifier, and display it in the task list.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [ ] T012 [P] [US1] Unit test for add task functionality in tests/test_task_service.py
- [ ] T013 [P] [US1] Integration test for add command in tests/test_commands/test_add_command.py

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create add command in apps/cli/commands/add_command.py
- [ ] T015 [US1] Implement add task logic in apps/cli/task_service.py
- [ ] T016 [US1] Add validation for task title in apps/cli/utils/validators.py
- [ ] T017 [US1] Add CLI argument parsing for add command in apps/cli/main.py
- [ ] T018 [US1] Test acceptance scenario 1: Adding task to empty list
- [ ] T019 [US1] Test acceptance scenario 2: Adding task to populated list

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Task List (Priority: P1)

**Goal**: Allow users to view all tasks with their ID, title, and completion status in a readable format

**Independent Test**: The system displays all tasks with their ID, title, and completion status in a readable format.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T020 [P] [US2] Unit test for list tasks functionality in tests/test_task_service.py
- [ ] T021 [P] [US2] Integration test for list command in tests/test_commands/test_list_command.py

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create list command in apps/cli/commands/list_command.py
- [ ] T023 [US2] Implement list tasks logic in apps/cli/task_service.py
- [ ] T024 [US2] Add formatting for task display in apps/cli/utils/helpers.py
- [ ] T025 [US2] Add CLI argument parsing for list command in apps/cli/main.py
- [ ] T026 [US2] Test acceptance scenario 1: Displaying populated task list
- [ ] T027 [US2] Test acceptance scenario 2: Displaying empty task list

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Task Complete (Priority: P2)

**Goal**: Allow users to toggle a task's completion status between complete and incomplete

**Independent Test**: The system allows a user to toggle a task's completion status between complete and incomplete.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T028 [P] [US3] Unit test for complete task functionality in tests/test_task_service.py
- [ ] T029 [P] [US3] Integration test for complete command in tests/test_commands/test_complete_command.py

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create complete command in apps/cli/commands/complete_command.py
- [ ] T031 [US3] Implement complete task logic in apps/cli/task_service.py
- [ ] T032 [US3] Ensure idempotent operations for complete task in apps/cli/task_manager.py
- [ ] T033 [US3] Add CLI argument parsing for complete command in apps/cli/main.py
- [ ] T034 [US3] Test acceptance scenario 1: Marking incomplete task as complete
- [ ] T035 [US3] Test acceptance scenario 2: Marking already complete task (idempotent)

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Allow users to modify the title and/or description of an existing task while keeping its ID unchanged

**Independent Test**: The system allows a user to modify the title and/or description of an existing task while keeping its ID unchanged.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [ ] T036 [P] [US4] Unit test for update task functionality in tests/test_task_service.py
- [ ] T037 [P] [US4] Integration test for update command in tests/test_commands/test_update_command.py

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create update command in apps/cli/commands/update_command.py
- [ ] T039 [US4] Implement update task logic in apps/cli/task_service.py
- [ ] T040 [US4] Preserve task identifier during updates in apps/cli/task_manager.py
- [ ] T041 [US4] Add validation for updated task data in apps/cli/utils/validators.py
- [ ] T042 [US4] Add CLI argument parsing for update command in apps/cli/main.py
- [ ] T043 [US4] Test acceptance scenario 1: Updating existing task details
- [ ] T044 [US4] Test acceptance scenario 2: Attempting to update non-existent task

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Delete Task (Priority: P3)

**Goal**: Allow users to remove a task using its identifier

**Independent Test**: The system allows a user to remove a task using its identifier.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [ ] T045 [P] [US5] Unit test for delete task functionality in tests/test_task_service.py
- [ ] T046 [P] [US5] Integration test for delete command in tests/test_commands/test_delete_command.py

### Implementation for User Story 5

- [ ] T047 [P] [US5] Create delete command in apps/cli/commands/delete_command.py
- [ ] T048 [US5] Implement delete task logic in apps/cli/task_service.py
- [ ] T049 [US5] Handle non-existent task identifiers gracefully in apps/cli/utils/error_handlers.py
- [ ] T050 [US5] Add CLI argument parsing for delete command in apps/cli/main.py
- [ ] T051 [US5] Test acceptance scenario 1: Deleting existing task
- [ ] T052 [US5] Test acceptance scenario 2: Attempting to delete non-existent task

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T053 [P] Documentation updates in docs/cli_usage.md
- [ ] T054 [P] [FR-008] Verify all marking operations are idempotent
- [ ] T055 [P] [FR-015] Verify deterministic behavior across all operations
- [ ] T056 [P] [FR-016] Comprehensive error handling validation
- [ ] T057 [P] [FR-010] Verify task identifiers are preserved during updates
- [ ] T058 [P] [FR-013] Test handling of non-existent task identifiers
- [ ] T059 [P] [FR-014] Verify all data resets on application restart
- [ ] T060 Run quickstart.md validation
- [ ] T061 [P] [FR-006] Verify task display includes ID, title, and status
- [ ] T062 [P] [FR-002] Verify task creation includes title and description
- [ ] T063 [P] [FR-005] Verify all tasks can be viewed in formatted list

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
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - May integrate with other stories but should be independently testable

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
Task: "Unit test for add task functionality in tests/test_task_service.py"
Task: "Integration test for add command in tests/test_commands/test_add_command.py"

# Launch all implementation for User Story 1 together:
Task: "Create add command in apps/cli/commands/add_command.py"
Task: "Implement add task logic in apps/cli/task_service.py"
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
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
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