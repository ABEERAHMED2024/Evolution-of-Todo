# Evolution of Todo - Phase III

This is the Phase III implementation of the Evolution of Todo project, featuring an AI-powered conversational chatbot that integrates with the existing backend using OpenAI technologies.

## Architecture

- **AI Agent Layer**: Built with OpenAI Agents SDK that processes natural language requests
- **MCP Tools**: Connect the AI agent to the existing FastAPI backend
- **Frontend**: Enhanced Next.js application with conversational UI
- **Backend**: Existing FastAPI + SQLModel + Neon PostgreSQL from Phase II (unchanged)

## Features

- Natural language task management (create, read, update, delete)
- Conversational interface with context awareness
- Clarification questions for ambiguous requests
- Seamless integration with existing task data
- Support for priorities, tags, and due dates through natural language
- Multilingual support capabilities

## Setup Instructions

### Backend Setup (Unchanged from Phase II)

1. Navigate to the backend directory:
   ```bash
   cd Evolution-of-Todo/backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file with your Neon PostgreSQL connection string
   echo "DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname" > .env
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Agent Layer Setup

1. Navigate to the agent directory:
   ```bash
   cd Evolution-of-Todo/agent
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   echo "BACKEND_URL=http://localhost:8000" >> .env
   ```

4. Run the agent server:
   ```bash
   python main.py
   ```
   The agent API will be available at `http://localhost:8001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Evolution-of-Todo/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure your .env.local file has the correct URLs:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_AGENT_API_URL=http://localhost:8001
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Usage

1. Visit the main application at `http://localhost:3000`
2. Use the "Chat with AI Assistant" link to access the conversational interface
3. Interact with the AI assistant using natural language:
   - "Add a high-priority work task for tomorrow called 'Prepare quarterly report'"
   - "Show me all incomplete home tasks"
   - "Mark grocery shopping as complete"

## Environment Variables

### Agent Layer
- `OPENAI_API_KEY` - Your OpenAI API key for accessing GPT models
- `BACKEND_URL` - URL of the FastAPI backend (default: http://localhost:8000)

### Frontend
- `NEXT_PUBLIC_API_URL` - Base URL for the backend API
- `NEXT_PUBLIC_AGENT_API_URL` - Base URL for the AI agent API

## MCP Tools

The agent layer uses tools to interact with the backend:

- `create_task`: Create new tasks via natural language
- `get_tasks`: Retrieve tasks with optional filtering
- `get_task`: Get a specific task by ID
- `update_task`: Update existing tasks
- `delete_task`: Delete tasks by ID

These tools ensure all operations go through the existing backend without duplicating business logic.