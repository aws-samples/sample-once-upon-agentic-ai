import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from strands.vended_tools import make_a2a_client
# TODO: Step 1 - Import create_harness from strands_harness

app = FastAPI(title="D&D Game Master API (Strands harness)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

class DiceOutput(BaseModel):
    dice_type: str = Field(description="The dice type. Ex: d4, d6, d20, etc")
    result: int = Field(description="The dice result value alone")
    reason: str = Field(description="The reason the dice was rolled. Ex: attack roll. And the modificators if there was any")

class StoryOutput(BaseModel):
    """A single Game Master turn: the narration, what the player could do next, and any dice rolled."""
    response: str = Field(description="Your narative response as Game Master")
    actions_suggestions: list[str] = Field(description="['Action 1', 'Action 2', 'Action 3']")
    details: str = Field(description="Brief summary of tools/agents used")
    dice_rolls: List[DiceOutput] = Field(default=[], description="List of dice rolls with dice_type, result, and reason")

# Domain instructions only: Strands harness prepends its own behavioral contract.
INSTRUCTIONS = """You are a D&D Game Master. Never make up what a tool can tell you.
- roll_dice (dice MCP server) rolls the dice.
- a2a_client talks to the Rules Agent (http://127.0.0.1:8000) and the Character Agent (http://127.0.0.1:8001).
Only use those endpoints. Keep each turn short: a few sentences of narration, then the options."""

# Same A2A client tool as in Chapter 5: the Rules Agent and the Character Agent are still just tools.
a2a_client = make_a2a_client(allowed_endpoints={
    "http://127.0.0.1:8000": None,  # Rules Agent
    "http://127.0.0.1:8001": None,  # Character Agent
})

# TODO: Step 1 - Create the Game Master as agent with create_harness:
# - instructions: INSTRUCTIONS
# - mcp_servers: the dice server, {"dice": {"url": "http://127.0.0.1:8002/mcp"}}
# - tools: [a2a_client]
# - builtin_tools: [] (a Game Master needs no shell, file or web access)
# - session: {"id": "dnd-campaign"} (resume the same campaign across restarts)
# - structured_output_model: StoryOutput (forwarded to the underlying Agent)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/inquire")
async def ask_agent(request: QuestionRequest):
    print("Processing request...")
    try:
        response = await agent.invoke_async(request.question)
        print(response.structured_output)
        return JSONResponse(content={"response": response.structured_output.model_dump()})
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, port=8009)
