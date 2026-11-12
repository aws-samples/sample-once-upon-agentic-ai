import os
import uuid
import boto3
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from strands import Agent
from strands.vended_tools import make_a2a_client
from strands.tools.mcp import MCPClient
# TODO: 8.4 Step 5 - Delete the fastapi, uvicorn and tinydb imports
import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from tinydb import TinyDB, Query
# TODO: 8.1 Step 2 - Import aws_iam_streamablehttp_client from mcp_proxy_for_aws.client
# TODO: 8.2 Step 2 - Import ClientConfig from a2a.client and SigV4HTTPXAuth from mcp_proxy_for_aws.sigv4_helper
# TODO: 8.4 Step 1 - Import BedrockAgentCoreApp from bedrock_agentcore.runtime
# TODO: 8.4 Step 2 - Import AgentCoreMemoryConfig from bedrock_agentcore.memory.integrations.strands.config and AgentCoreMemorySessionManager from bedrock_agentcore.memory.integrations.strands.session_manager

# TODO: 8.4 Step 1 - Replace the FastAPI app and its endpoints with a BedrockAgentCoreApp
app = FastAPI(title="Game Master API")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # The web UI is a public HTTPS page calling localhost, so Chrome sends a Private Network Access preflight
    allow_private_network=True,
)

class QuestionRequest(BaseModel):
    question: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/messages")
def get_messages():
    return get_game_master("local").messages

@app.get("/user/{user_name}")
def get_user(user_name):
    characters_db = TinyDB(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "5_a2a_integration", "agents", "character_agent", "characters.json"))
    Character_Query = Query()
    result = characters_db.search(Character_Query.name == user_name)
    if not result:
        return f":x: Character with name '{user_name}' not found"

    character = result[0]
    print(f"✅ Found character: {character['name']} (ID: {character['character_id']}, {character['character_class']} {character['race']})")
    return character

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        response = await get_game_master("local").invoke_async(request.question)
        print(response.structured_output)
        return JSONResponse(content={ "response": response.structured_output.model_dump()})

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)

# The URLs of your runtimes are read from the .env file of the chapter folder (see .env.example)
load_dotenv()

# TODO: 8.1 Step 1 - Read DICE_SERVER_URL from the environment

# TODO: 8.1 Step 2 - Create an MCPClient connecting to DICE_SERVER_URL with aws_iam_streamablehttp_client for the bedrock-agentcore service

# TODO: 8.2 Step 1 - Read CHARACTER_AGENT_URL from the environment

# TODO: 8.2 Step 2 - Create a ClientConfig whose httpx client signs requests with SigV4 for bedrock-agentcore in the region of your boto3 session and sends a session id

# TODO: 8.3 Step 1 - Read RULES_AGENT_URL from the environment

class DiceOutput(BaseModel):
    dice_type: str = Field(description="The dice type. Ex: d4, d6, d20, etc")
    result: int = Field(description="The dice result value alone")
    reason: str = Field(description="The reason the dice was rolled. Ex: attack roll. And the modificators if there was any")

class StoryOutput(BaseModel):
    """A single Game Master turn: the narration, what the player could do next, and any dice rolled."""
    response: str = Field(description="Your narative response as Game Master")
    actions_suggestions: list[str] = Field(description="['Action 1', 'Action 2', 'Action 3']")
    details: str = Field(description="Brief summary of tools/agents used")
    dice_rolls: list[DiceOutput] = Field(default=[], description="List of dice rolls with dice_type, result, and reason")



a2a_client = make_a2a_client(allowed_endpoints=[
    # TODO: 8.3 Step 2 - Replace the local Rules Agent with RULES_AGENT_URL and agentcore_config
    "http://127.0.0.1:8000",  # Rules Agent
    # TODO: 8.2 Step 3 - Replace the local Character Agent with CHARACTER_AGENT_URL and agentcore_config
    "http://127.0.0.1:8001",  # Character Agent
])

# One Game Master per session, created on its first invocation
game_masters = {}

def get_game_master(session_id: str) -> Agent:
    if session_id not in game_masters:
        game_masters[session_id] = Agent(
            system_prompt="""You are a Game Master for a fantasy role-playing game. Discover the agents you can reach and ask them instead of guessing: rules questions, character creation and lookups are their job. Every dice roll goes through roll_dice. Never make up what a tool can tell you, and narrate with flair.""",
            tools=[mcp_client, a2a_client],
            structured_output_model=StoryOutput,
            # TODO: 8.4 Step 2 - Keep the conversation in the conversations memory with an AgentCoreMemorySessionManager for this session and the actor "player"
        )
    return game_masters[session_id]

# TODO: 8.4 Step 3 - Create the entrypoint: return the messages of the session's Game Master if the payload asks for them, otherwise answer the prompt with a StoryOutput

if __name__ == "__main__":
    # TODO: 8.4 Step 4 - Replace uvicorn.run with the run method of the BedrockAgentCoreApp
    uvicorn.run(app, port=8009)
