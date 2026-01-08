"""
Main application file for the AI agent layer
"""
import os
import openai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from .todo_agent import TodoAgent
from .mcp_tools import TodoMCPTools


# Initialize FastAPI app
app = FastAPI(title="Todo AI Agent API", version="1.0.0")

# Initialize the OpenAI client
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize the TodoAgent
todo_agent = TodoAgent(openai_client)

# Initialize the tools with the backend URL from environment
backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
todo_tools = TodoMCPTools(base_url=backend_url)


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict]] = []


@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint to process natural language requests through the AI agent
    """
    try:
        response = todo_agent.process_request(
            user_input=request.message,
            conversation_history=request.conversation_history
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Todo AI Agent API is running!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)