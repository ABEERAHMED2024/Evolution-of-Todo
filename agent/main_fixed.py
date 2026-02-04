"""
Main application file for the AI agent layer
"""

import os
from typing import Any

# Try to import FastAPI and Pydantic, but handle the case where they're not installed
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel

    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("Warning: FastAPI/Pydantic packages not installed. Web API will be disabled.")

# Try to import OpenAI, but handle the case where it's not installed
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI package not installed. AI features will be disabled.")

# Try to import local modules, but handle import errors gracefully
try:
    from mcp_tools import TodoMCPTools
    from todo_agent import TodoAgent

    LOCAL_MODULES_AVAILABLE = True
except ImportError:
    LOCAL_MODULES_AVAILABLE = False
    print("Warning: Local agent modules not found. Using mock implementations.")


# Mock implementations for when dependencies are missing
class MockTodoAgent:
    def __init__(self, client: Any = None) -> None:
        self.client = client

    def process_request(
        self, user_input: str, conversation_history: list[dict[str, Any]] | None = None
    ) -> str:
        return f"Mock response: I received your message '{user_input}' but AI features are currently disabled. Please install required dependencies."


class MockTodoMCPTools:
    def __init__(self, base_url: str = "") -> None:
        self.base_url = base_url


if FASTAPI_AVAILABLE:
    # Initialize FastAPI app
    app = FastAPI(title="Todo AI Agent API", version="1.0.0")

    # Initialize components
    if OPENAI_AVAILABLE and LOCAL_MODULES_AVAILABLE:
        # Initialize the OpenAI client
        openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Initialize the TodoAgent
        todo_agent = TodoAgent(openai_client)

        # Initialize the tools with the backend URL from environment
        backend_url = os.getenv("BACKEND_URL", "http://backend:8000")
        todo_tools = TodoMCPTools(base_url=backend_url)

        print(f"✅ Full AI functionality enabled!")
        print(f"🔗 Backend URL: {backend_url}")
        print(
            f"🤖 OpenAI API Key configured: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}"
        )
    else:
        # Use mock implementations
        openai_client = None
        todo_agent = MockTodoAgent()
        backend_url = os.getenv("BACKEND_URL", "http://backend:8000")
        todo_tools = MockTodoMCPTools(base_url=backend_url)

        print(f"⚠️  Using limited AI functionality")
        print(f"📦 OpenAI available: {OPENAI_AVAILABLE}")
        print(f"🔧 Local modules available: {LOCAL_MODULES_AVAILABLE}")

    class ChatRequest(BaseModel):
        message: str
        conversation_history: list[dict[str, Any]] | None = None

    @app.post("/chat/")
    async def chat_endpoint(request: ChatRequest) -> dict[str, str]:
        """
        Endpoint to process natural language requests through the AI agent
        """
        try:
            # Handle None conversation_history
            conversation_history = request.conversation_history or []

            response = todo_agent.process_request(
                user_input=request.message, conversation_history=conversation_history
            )
            return {"response": response}
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing request: {str(e)}"
            )

    @app.get("/")
    async def root() -> dict[str, Any]:
        return {
            "message": "Todo AI Agent API is running!",
            "openai_available": OPENAI_AVAILABLE,
            "local_modules_available": LOCAL_MODULES_AVAILABLE,
            "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
            "status": "ready"
            if (
                OPENAI_AVAILABLE
                and LOCAL_MODULES_AVAILABLE
                and os.getenv("OPENAI_API_KEY")
            )
            else "limited",
        }

    @app.get("/health")
    async def health_check() -> dict[str, Any]:
        return {
            "status": "healthy",
            "openai_available": OPENAI_AVAILABLE,
            "local_modules_available": LOCAL_MODULES_AVAILABLE,
            "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
            "backend_url": backend_url,
        }

else:
    # Create a mock app for when FastAPI is not available
    class MockApp:
        def __init__(self) -> None:
            self.title = "Todo AI Agent API (Mock)"
            self.version = "1.0.0"

        def get(self, path: str) -> Any:
            def decorator(func: Any) -> Any:
                return func

            return decorator

        def post(self, path: str) -> Any:
            def decorator(func: Any) -> Any:
                return func

            return decorator

    app = MockApp()
    print("Warning: FastAPI not available. Web server functionality disabled.")


if __name__ == "__main__":
    if FASTAPI_AVAILABLE:
        try:
            import uvicorn

            print("🚀 Starting Todo AI Agent API on port 8001...")
            uvicorn.run(app, host="0.0.0.0", port=8001)
        except ImportError:
            print(
                "Error: uvicorn not installed. Please install with: pip install uvicorn"
            )
            print("Or run with: python -m uvicorn main:app --host 0.0.0.0 --port 8001")
    else:
        print(
            "Cannot start server: FastAPI not available. Please install FastAPI and dependencies."
        )
