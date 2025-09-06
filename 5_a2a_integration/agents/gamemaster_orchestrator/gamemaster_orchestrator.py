import os
import sys
import uvicorn
from dotenv import load_dotenv
from strands import Agent
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from strands_tools import generate_image

# Load environment variables
load_dotenv()

# Import workshop A2A tools that work correctly
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'utils'))
from workshop_utils import A2AClientToolProvider

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

# A2A Client for agent communication (workshop-compatible version)
a2a_provider = A2AClientToolProvider(known_agent_urls=[
    "http://127.0.0.1:8000",  # Rules Agent
    "http://127.0.0.1:8001",  # Character Agent
])

# Initialize A2A tools
a2a_tools = list(a2a_provider.tools) if a2a_provider else []
print(f"A2A tools available: {[tool.tool_name for tool in a2a_tools]}")

agent = Agent(
    model=os.getenv("MODEL_ID"),
    tools=a2a_tools + [generate_image], 
    system_prompt="""You are a D&D Game Master orchestrator. You MUST always consult your specialized agents before responding.

MANDATORY WORKFLOW:
1. FIRST: Use a2a_list_discovered_agents to see available agents
2. THEN: Use a2a_send_message to consult the appropriate agent(s) for the request
3. FINALLY: Synthesize their responses into your answer

Never answer from your own knowledge without consulting agents first. Always delegate to specialists.

Respond naturally with your Game Master narrative. The system will format your response appropriately.

IMPORTANT: 
- Provide EXACTLY 3 short, specific action suggestions that would make sense in this context. Format them as a unnumbered list with each suggestion being a short phrase or sentence (5-10 words) that the player could say or do.
For example:
Investigate the strange noise
Talk to the innkeeper about rumors
Search for hidden treasures
Your suggestions should be varied and interesting, giving the player meaningful choices.
DO NOT include any explanations or additional text - ONLY the list of 3 suggestions.

When you reply, please reply with a JSON (and ONLY A JSON, no text other than the json). The json syntax:
{
    response: string,
    actions_suggestions: [],
    details: string,
    dices_rolls: []
}

If you rool dices, please mention it in the response and provide the results of each dice in the dices_rolls array as such:
{
    dice_type: string,
    result: number,
    reason: string
}

In the "details" of the json, provide the details of the tools and agents you used to generate the response

Remember, the response should ONLY be a PURE json with no markdown or text arount it
"""
)

# MCP Client for dice rolling service
mcp_dice_client = MCPClient(lambda: streamablehttp_client("http://localhost:8080/mcp"))

# Add MCP tools to agent
if mcp_dice_client:
    try:
        with mcp_dice_client:
            mcp_tools = mcp_dice_client.list_tools_sync()
            agent.tool_registry.process_tools(mcp_tools)
            print(f"Connected to MCP Dice Server. Available tools: {[tool.tool_name for tool in mcp_tools]}")
    except Exception as e:
        print(f"Warning: Could not connect to MCP Dice Server: {e}")
else:
    print("Warning: MCP Dice Client not initialized")

# Debug: Print all available tools
try:
    print(f"All agent tools: {list(agent.tool_registry._tools.keys())}")
except Exception as e:
    print(f"Could not list tools: {e}")

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        if mcp_dice_client:
            with mcp_dice_client:
                response = agent(request.question)
                content = str(response)
                print(f"Agent response: {content}")
                return JSONResponse(content={"response": content})
        else:
            response = agent(request.question)
            content = str(response)
            print(f"Agent response: {content}")
            return JSONResponse(content={"response": content})
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)


    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8009)
