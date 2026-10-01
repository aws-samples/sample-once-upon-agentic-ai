import os
import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from tinydb import TinyDB, Query
from strands import Agent
from strands.vended_tools import make_a2a_client
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client

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
    characters_db = TinyDB(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "character_agent", "characters.json"))
    Character_Query = Query()
    result = characters_db.search(Character_Query.name == user_name)
    if not result:
        return f":x: Character with name '{user_name}' not found"
    
    character = result[0]
    print(f"✅ Found character: {character['name']} (ID: {character['character_id']}, {character['character_class']} {character['race']})")
    return character

# TODO: Step 1 - Create a streamable http MCPClient connecting to "http://localhost:8002/mcp"

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

try:
    # TODO: Step 2 - Create the A2A client tool with make_a2a_client and the allowed agent endpoints

    agent = Agent(
        system_prompt="""You are a D&D Game Master. Discover the agents you can reach and ask them instead of guessing: rules questions, character creation and lookups are their job. Every dice roll goes through roll_dice. Never make up what a tool can tell you, and narrate with flair.""",
        # TODO: Step 3 - Create the gamemaster agent with both A2A and MCP tools
        # TODO: Step 3 - Force the response to use the StoryOutput model
    )
    print(agent)

except Exception as e:
    print(f"Error occurred: {str(e)}")

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        response = await agent.invoke_async(request.question)
        print(response.structured_output)
        return JSONResponse(content={ "response": response.structured_output.model_dump()})
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, port=8009)
