"""
Main application file for the AI agent layer
"""

import os
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from mcp_tools import TodoMCPTools
from todo_agent import TodoAgent


# Mock implementations for when dependencies are missing
class MockTodoAgent:
    def __init__(self, client: Any = None) -> None:
        self.client = client

    def process_request(
        self, user_input: str, conversation_history: list[dict[str, Any]] | None = None
    ) -> str:
        if not conversation_history:
            conversation_history = []
        return f"Mock response: I received your message '{user_input}' but AI features are currently disabled. Please install required dependencies."


class MockTodoMCPTools:
    def __init__(self, base_url: str = "") -> None:
        self.base_url = base_url

    def health_check(self) -> dict[str, Any]:
        return {
            "status": "mock",
            "message": "Using mock tools - real backend integration available at " + self.base_url,
            "backend_url": self.base_url,
        }


# Initialize FastAPI app
app = FastAPI(title="Todo AI Agent API", version="1.0.0")

# Initialize components with safety checks
backend_url = os.getenv("BACKEND_URL", "http://backend:8000")

# Initialize OpenAI client
openai_client = None
openai_ready = False

try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = openai.OpenAI(api_key=api_key)
        openai_ready = True
        print("[OK] OpenAI client initialized successfully")
    else:
        print("[WARN] No OpenAI API key found in environment")
except Exception as e:
    print(f"[ERROR] Error creating OpenAI client: {str(e)}")

# Initialize agent and tools
try:
    if openai_ready:
        todo_agent = TodoAgent(openai_client)
        todo_tools = TodoMCPTools(base_url=backend_url)
        agent_status = "ready"
        print("[OK] Full AI functionality enabled!")
        print(f"[INFO] Backend URL: {backend_url}")
    else:
        todo_agent = MockTodoAgent()
        todo_tools = MockTodoMCPTools(base_url=backend_url)
        agent_status = "limited"
        print("[WARN] Using limited AI functionality (OpenAI not configured)")
except Exception as e:
    print(f"[ERROR] Error initializing components: {str(e)}")
    todo_agent = MockTodoAgent()
    todo_tools = MockTodoMCPTools(base_url=backend_url)
    agent_status = "limited"


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict[str, Any]] | None = None


@app.post("/chat/")
async def chat_endpoint(request: ChatRequest) -> dict[str, str]:
    """
    Endpoint to process natural language requests through the AI agent
    """
    try:
        conversation_history = request.conversation_history or []
        response = todo_agent.process_request(
            user_input=request.message, conversation_history=conversation_history
        )
        return {"response": response}
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing request: {str(e)}"
        )


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "message": "Todo AI Agent API is running!",
        "openai_available": openai_ready,
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "status": agent_status,
        "backend_url": backend_url,
    }


@app.get("/health")
async def health_check() -> dict[str, Any]:
    return {
        "status": "healthy",
        "openai_available": openai_ready,
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "backend_url": backend_url,
        "agent_status": agent_status,
    }


@app.get("/test")
async def test_endpoint() -> dict[str, Any]:
    """Test endpoint to verify the agent is responding"""
    return {
        "message": "Agent test successful",
        "timestamp": "2026-02-04T21:00:00Z",
        "capabilities": {
            "openai": openai_ready,
        },
    }


if __name__ == "__main__":
    try:
        import uvicorn
        print("[START] Starting Todo AI Agent API on port 8001...")
        uvicorn.run(app, host="0.0.0.0", port=8001)
    except ImportError:
        print("Error: uvicorn not installed. Please install with: pip install uvicorn")
