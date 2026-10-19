"""Local bridge between the Chapter 6 web interface and the Game Master on AgentCore.

The web interface calls plain HTTP routes on port 8009; the Game Master runtime only
accepts IAM-signed invocations. This server keeps the routes of the Chapter 5 Game Master
and forwards each request with your AWS credentials.
"""
import json
import boto3
import uvicorn
from botocore.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# One session id = one campaign: the Game Master finds its conversation again under this id.
# AgentCore requires at least 33 characters.
SESSION_ID = "campaign-once-upon-agentic-ai-0001"

control = boto3.client("bedrock-agentcore-control")
# A Game Master turn can call several agents: allow it more than the default 60 seconds
agentcore = boto3.client("bedrock-agentcore", config=Config(read_timeout=300))

def find_game_master_arn() -> str:
    for page in control.get_paginator("list_agent_runtimes").paginate():
        for runtime in page["agentRuntimes"]:
            if runtime["agentRuntimeName"] == "gameprod_gamemaster":
                return runtime["agentRuntimeArn"]
    raise RuntimeError(f"No gameprod_gamemaster runtime in {control.meta.region_name}: deploy the Game Master first")

def find_characters_memory_id() -> str:
    for page in control.get_paginator("list_memories").paginate():
        for memory in page["memories"]:
            if memory["id"].startswith("gameprod_characters-"):
                return memory["id"]
    raise RuntimeError(f"No gameprod characters memory in {control.meta.region_name}: deploy the Character Agent first")

GAME_MASTER_ARN = find_game_master_arn()
CHARACTERS_MEMORY_ID = find_characters_memory_id()

def ask_game_master(payload: dict):
    response = agentcore.invoke_agent_runtime(
        agentRuntimeArn=GAME_MASTER_ARN,
        runtimeSessionId=SESSION_ID,
        payload=json.dumps(payload),
    )
    return json.loads(response["response"].read())

app = FastAPI(title="Game Master UI proxy")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class QuestionRequest(BaseModel):
    question: str

@app.post("/inquire")
def inquire(request: QuestionRequest):
    return {"response": ask_game_master({"prompt": request.question})}

@app.get("/messages")
def get_messages():
    return ask_game_master({"messages": True})

@app.get("/user/{user_name}")
def get_user(user_name: str):
    # The character sheets live in the memory of the Character Agent (8.2)
    pages = agentcore.get_paginator("list_memory_records").paginate(memoryId=CHARACTERS_MEMORY_ID, namespacePath="/characters/")
    for page in pages:
        for record in page["memoryRecordSummaries"]:
            character = json.loads(record["content"]["text"])
            if character["name"] == user_name:
                return character
    return JSONResponse(content={"error": f"Character '{user_name}' not found"}, status_code=404)

if __name__ == "__main__":
    print(f"Forwarding to {GAME_MASTER_ARN}, session {SESSION_ID}")
    uvicorn.run(app, port=8009)
