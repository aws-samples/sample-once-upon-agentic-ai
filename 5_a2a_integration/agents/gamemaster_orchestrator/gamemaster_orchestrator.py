import os
import sys
import uvicorn
from strands import Agent
from strands.tools.mcp.mcp_client import MCPClient
from mcp.client.streamable_http import streamablehttp_client
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB, Query
from strands_tools.a2a_client import A2AClientToolProvider

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

@app.get("/messages")
def get_messages():
    return agent.messages

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

# TODO: Create MCP Client for dice rolling service
# Initialize MCPClient with a lambda that returns streamablehttp_client("http://localhost:8080/mcp")
mcp_client = MCPClient(lambda: streamablehttp_client("http://localhost:8080/mcp"))

# System prompt for the agent
SYSTEM_PROMPT = """You are a D&D Game Master orchestrator with access to specialized agents and tools.

Available agents:
- Rules Agent (http://127.0.0.1:8000) - For D&D mechanics and rules
- Character Agent (http://127.0.0.1:8001) - For character creation and management

To communicate with agents:
1. Use a2a_list_discovered_agents to see available agents
2. Use a2a_send_message with the agent's URL to send questions
3. Use roll_dice for dice rolling

Available D&D dice types:
- d4 (4-sided die) - Used for damage rolls of small weapons like daggers
- d6 (6-sided die) - Used for damage rolls of weapons like shortswords, spell damage
- d8 (8-sided die) - Used for damage rolls of weapons like longswords, rapiers
- d10 (10-sided die) - Used for damage rolls of heavy weapons, percentile rolls
- d12 (12-sided die) - Used for damage rolls of great weapons like greataxes
- d20 (20-sided die) - Used for ability checks, attack rolls, saving throws
- d100 (percentile die) - Used for random tables, wild magic surges

IMPORTANT: Always use the exact URLs shown by a2a_list_discovered_agents. Never invent or guess URLs.

When you reply, please reply with a JSON (and ONLY A JSON, no text other than the json).
Always respond in JSON format:
{
    "response": "Your narrative response as Game Master",
    "actions_suggestions": ["Action 1", "Action 2", "Action 3"],
    "details": "Brief summary of tools/agents used",
    "dices_rolls": [{"dice_type": "d20", "result": 15, "reason": "attack roll"}]
}

Be creative, engaging, and use your available tools to enhance the D&D experience.

Remember, the response should ONLY be a PURE json with no markdown or text arount it.
"""

try:
    # TODO: Create the A2A client with the A2AClientToolProvider and pass the list of the known agent urls
    A2A_AGENT_URLS = [
        "http://127.0.0.1:8000",  # Rules Agent
        "http://127.0.0.1:8001",  # Character Agent
        ]
    a2a_client = A2AClientToolProvider(known_agent_urls=A2A_AGENT_URLS)

    with mcp_client:
        #TODO: Get MCP tools
        mcp_tools = mcp_client.list_tools_sync()

        #TODO: Create the gamemaster agent with both A2A and MCP tools
        agent = Agent(
            # model=optional,    # Try model="amazon.nova-lite-v1:0" for 
            tools=list(a2a_client.tools) + mcp_tools,
            system_prompt=SYSTEM_PROMPT
        )

except Exception as e:
    print(f"Error occurred: {str(e)}")

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        with mcp_client:
            # Process the request
            response = agent(request.question)
            content = str(response)
            return JSONResponse(content={"response": content})
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, port=8009)
