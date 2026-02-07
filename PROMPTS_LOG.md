# Evolution of Todo - Prompts Log

This file contains important prompts used during the development of the Evolution of Todo project, organized by purpose.

## Setup Prompts

### Initial Project Analysis
```
analyze the repo in detail undestand the flow rules structure do not modefy change any thing suggest 2 steps for next step should done all phases are locked read all files
```

### Frontend Enhancement
```
make frontend more dynamic futurestic ui with modern look
```

### AI Agent Enhancement
```
make full functional ai agent
```

## Skills Implementation Prompts

### AI Agent Functionality
```
create intelligent message parsing to understand user intents (create, update, delete, list tasks)
```

### Natural Language Processing
```
implement keyword recognition for task titles, priorities, and due dates
```

## Routing Prompts

### API Route Enhancement
```
update the ai-agent API route to parse natural language and interact with the backend
```

### Database Integration
```
enhance the agent functionality to connect to the backend database
```

## Git/GitHub Operation Prompts

### Repository Management
```
You are a senior software engineer acting as a Git automation agent.

Objective:
Push all current project work to the existing GitHub repository using standard git commands.
Before pushing, update the existing README.md so that any user can easily understand, install, and use the Todo app for daily work.

Constraints:
- Do NOT rewrite history.
- Do NOT force push.
- Do NOT delete existing documentation.
- Only use standard git commands.
- Keep README clear, simple, and practical.
- Assume this is a production-ready open-source repo.

Steps to perform:

1. Inspect the repository status
   - Run `git status`
   - Identify new, modified, and untracked files

2. Update README.md
   Update the README to include:
   - Project overview (what the Todo app does)
   - Key features
   - How to install (step-by-step)
   - How to run the app locally
   - Daily usage instructions
   - Project structure (high level)
   - Tech stack
   - Contribution notes (optional but clean)
   - License note (if already present, keep it)

   Keep the language simple so a non-technical user can follow.

3. Stage changes
   - Add all relevant files using `git add`
   - Do NOT include secrets, tokens, or local config files

4. Commit changes
   - Write a clear, professional commit message
   - Example:
     "feat: complete todo app with updated documentation"

5. Push to the current branch
   - Use `git push` to the configured remote
   - Do NOT change branches unless required

Output requirements:
- Print each git command before executing it
- If an error occurs, stop and explain clearly
- Confirm successful push at the end.
Proceed step by step and complete the task.
```

## Database Implementation Prompts

### SQLite Integration
```
implement persistent storage with SQLite database for storing user tasks
```

### Schema Design
```
design proper data types and constraints for the task schema
```

## Architecture Documentation Prompts

### System Architecture
```
document the current system architecture with components and interactions
```

### API Design
```
define the API endpoints for task management operations
```

## Testing and Validation Prompts

### Functionality Testing
```
verify that all task management operations work correctly with the new database
```

### User Experience
```
ensure the AI assistant provides meaningful responses based on actual system operations
```