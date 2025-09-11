import os
import sys
import uvicorn
from dotenv import load_dotenv
from strands import Agent
from strands.tools.mcp.mcp_client import MCPClient
from mcp.client.streamable_http import streamablehttp_client
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB, Query
from strands_tools.a2a_client import A2AClientToolProvider

# Load environment variables
load_dotenv()

app = FastAPI(title="D&D Game Master API")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/user/{user_name}")
def get_user(user_name):
    characters_db = TinyDB('./../character_agent/characters.json')
    Character_Query = Query()
    result = characters_db.search(Character_Query.name == user_name)
    if not result:
        return f":x: Character with name '{user_name}' not found"
    
    character = result[0]
    print(f"✅ Found character: {character['name']} (ID: {character['character_id']}, {character['character_class']} {character['race']})")
    return character

# Create MCP Client for dice rolling service
mcp_client = MCPClient(lambda: streamablehttp_client("http://localhost:8080/mcp"))

# Configuration for A2A agents
A2A_AGENT_URLS = [
    "http://127.0.0.1:8000",  # Rules Agent
    "http://127.0.0.1:8001",  # Character Agent
]


# System prompt for the agent
SYSTEM_PROMPT = """You are a D&D Game Master orchestrator with access to specialized agents and tools.

Available agents:
- Rules Agent (http://127.0.0.1:8000) - For D&D mechanics and rules
- Character Agent (http://127.0.0.1:8001) - For character creation and management

To communicate with agents:
1. Use a2a_list_discovered_agents to see available agents
2. Use a2a_send_message with the agent's URL to send questions
3. Use roll_dice for dice rolling

IMPORTANT: Always use the exact URLs shown by a2a_list_discovered_agents. Never invent or guess URLs.

Always respond in JSON format:
{
    "response": "Your narrative response as Game Master",
    "actions_suggestions": ["Action 1", "Action 2", "Action 3"],
    "details": "Brief summary of tools/agents used",
    "dices_rolls": [{"dice_type": "d20", "result": 15, "reason": "attack roll"}]
}

Be creative, engaging, and use your available tools to enhance the D&D experience."""

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        # Create fresh A2A client for each request (avoids connection issues)
        a2a_client = A2AClientToolProvider(known_agent_urls=A2A_AGENT_URLS)
        
        # Create agent with fresh connections within MCP context
        with mcp_client:
            # Get MCP tools
            mcp_tools = mcp_client.list_tools_sync()

            # Create agent with both A2A and MCP tools
            all_tools = list(a2a_client.tools) + mcp_tools
            agent = Agent(
                model=os.getenv("MODEL_ID"),
                tools=all_tools,
                system_prompt=SYSTEM_PROMPT
            )
            
            # Process the request
            response = agent(request.question)
            content = str(response)
            return JSONResponse(content={"response": content})
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8009)