import os
import sys
from pathlib import Path

# Add the agent directory to the path
agent_dir = Path(__file__).parent / "agent"
sys.path.insert(0, str(agent_dir))

# Set environment variables to point to our backend
os.environ["BACKEND_URL"] = "http://localhost:8000"
os.environ["OPENAI_API_KEY"] = "fake-key-for-testing"  # This is just to bypass the check

# Import and run the agent
from main import app, todo_agent, todo_tools, agent_status

# Override the agent to work without OpenAI for testing
from todo_agent import MockTodoAgent
from mcp_tools import TodoMCPTools

# Initialize with our backend URL
todo_agent = MockTodoAgent()  # Using mock agent for now
todo_tools = TodoMCPTools(base_url=os.environ["BACKEND_URL"])
agent_status = "ready"

if __name__ == "__main__":
    import uvicorn
    print("Starting AI Agent server on port 8001...")
    print(f"Connecting to backend at: {os.environ['BACKEND_URL']}")
    uvicorn.run(app, host="0.0.0.0", port=8001)