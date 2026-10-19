import os
import uuid
import boto3
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from strands import Agent
from strands.vended_tools import make_a2a_client
from strands.tools.mcp import MCPClient
# TODO: 8.1 Step 2 - Import aws_iam_streamablehttp_client from mcp_proxy_for_aws.client
from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
# TODO: 8.2 Step 2 - Import ClientConfig from a2a.client and SigV4HTTPXAuth from mcp_proxy_for_aws.sigv4_helper
from a2a.client import ClientConfig
from mcp_proxy_for_aws.sigv4_helper import SigV4HTTPXAuth
# TODO: 8.4 Step 1 - Import BedrockAgentCoreApp from bedrock_agentcore.runtime
from bedrock_agentcore.runtime import BedrockAgentCoreApp
# TODO: 8.4 Step 2 - Import AgentCoreMemoryConfig and AgentCoreMemorySessionManager from bedrock_agentcore.memory.integrations.strands
from bedrock_agentcore.memory.integrations.strands.config import AgentCoreMemoryConfig
from bedrock_agentcore.memory.integrations.strands.session_manager import AgentCoreMemorySessionManager

# TODO: 8.4 Step 1 - Replace the FastAPI app and its endpoints with a BedrockAgentCoreApp
app = BedrockAgentCoreApp()

# The URLs of your runtimes are read from the .env file of the chapter folder (see .env.example)
load_dotenv()

# TODO: 8.1 Step 1 - Read DICE_SERVER_URL from the environment
DICE_SERVER_URL = os.environ["DICE_SERVER_URL"]

# TODO: 8.1 Step 2 - Create an MCPClient connecting to DICE_SERVER_URL with aws_iam_streamablehttp_client for the bedrock-agentcore service in us-west-2
mcp_client = MCPClient(lambda: aws_iam_streamablehttp_client(endpoint=DICE_SERVER_URL, aws_service="bedrock-agentcore", aws_region="us-west-2"))

# TODO: 8.2 Step 1 - Read CHARACTER_AGENT_URL from the environment
CHARACTER_AGENT_URL = os.environ["CHARACTER_AGENT_URL"]

# TODO: 8.2 Step 2 - Create a ClientConfig whose httpx client signs requests with SigV4 for bedrock-agentcore in us-west-2 and sends a session id
agentcore_config = ClientConfig(httpx_client=httpx.AsyncClient(
    auth=SigV4HTTPXAuth(boto3.Session().get_credentials(), "bedrock-agentcore", "us-west-2"),
    # AgentCore runs one microVM per session; the id must be at least 33 characters long
    headers={"X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": str(uuid.uuid4())},
    timeout=300,
))

# TODO: 8.3 Step 1 - Read RULES_AGENT_URL from the environment
RULES_AGENT_URL = os.environ["RULES_AGENT_URL"]

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
    (RULES_AGENT_URL, agentcore_config),  # Rules Agent, on AgentCore
    # TODO: 8.2 Step 3 - Replace the local Character Agent with CHARACTER_AGENT_URL and agentcore_config
    (CHARACTER_AGENT_URL, agentcore_config),  # Character Agent, on AgentCore
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
            session_manager=AgentCoreMemorySessionManager(
                AgentCoreMemoryConfig(memory_id=os.environ["MEMORY_CONVERSATIONS_ID"], session_id=session_id, actor_id="player"),
                region_name="us-west-2",
            ),
            callback_handler=None,
        )
    return game_masters[session_id]

# TODO: 8.4 Step 3 - Create the entrypoint: return the messages of the session's Game Master if the payload asks for them, otherwise answer the prompt with a StoryOutput
@app.entrypoint
async def invoke(payload, context):
    game_master = get_game_master(context.session_id)
    if payload.get("messages"):
        return game_master.messages
    response = await game_master.invoke_async(payload["prompt"])
    return response.structured_output.model_dump()

if __name__ == "__main__":
    # TODO: 8.4 Step 4 - Replace uvicorn.run with the run method of the BedrockAgentCoreApp
    app.run()
