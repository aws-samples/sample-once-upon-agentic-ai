import os
from urllib.parse import quote

from strands import Agent
from strands.tools.mcp import MCPClient
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client

app = BedrockAgentCoreApp()

REGION = os.environ.get("AWS_REGION", "us-west-2")
# Set by the `envVars` entry in agentcore/agentcore.json (chapter 10)
DICE_MCP_RUNTIME_ARN = os.environ.get("DICE_MCP_RUNTIME_ARN")

SYSTEM_PROMPT = """You are an epic D&D Game Master running a live adventure.
You narrate with theatrical flair, describe vivid scenes, and keep the story moving.
Whenever fate must decide an outcome (attacks, saving throws, skill checks),
use the roll_dice tool with the appropriate dice (d20 for checks, d6/d8 for damage...)
and weave the result into the narration. If you have no dice tool, describe the
tension and resolve outcomes narratively instead of inventing numbers.
Keep responses short and punchy — this is a live game, not a novel."""

def create_dice_mcp_client() -> MCPClient:
    """MCP client for the dice server deployed on its own AgentCore runtime.

    Requests are signed with this runtime's IAM execution role (SigV4) — the
    `connections` entry in agentcore.json granted it InvokeAgentRuntime on the target.
    """
    dice_server_url = (
        f"https://bedrock-agentcore.{REGION}.amazonaws.com"
        f"/runtimes/{quote(DICE_MCP_RUNTIME_ARN, safe='')}/invocations?qualifier=DEFAULT"
    )
    # TODO: Create the MCP client, same as chapter 4 but with the IAM-signed transport
    return MCPClient(lambda: aws_iam_streamablehttp_client(
        endpoint=dice_server_url,
        aws_service="bedrock-agentcore",
        aws_region=REGION,
        terminate_on_close=False,
    ))


# The agent is created lazily on the first invocation, NOT at import time:
# reaching the remote MCP server can outlast the runtime's 30s init budget
# (the dice server may itself be cold-starting). One cached Agent per microVM
# is still safe — AgentCore isolates each session in its own microVM, and
# within a session, history persists across invocations.
gamemaster = None


def get_or_create_gamemaster() -> Agent:
    global gamemaster
    if gamemaster is None:
        tools = []
        if DICE_MCP_RUNTIME_ARN:
            # Passing the client itself lets Strands manage the connection lifecycle
            tools.append(create_dice_mcp_client())
        gamemaster = Agent(
            system_prompt=SYSTEM_PROMPT,
            tools=tools,
        )
    return gamemaster


# TODO: Add the decorator that registers this function as the AgentCore entrypoint
@app.entrypoint
async def invoke(payload, context):
    """Handle one invocation of the deployed gamemaster."""
    prompt = payload.get("prompt", "Greet the adventurer and set the scene.")
    agent = get_or_create_gamemaster()
    result = await agent.invoke_async(prompt)
    return {"result": str(result)}


if __name__ == "__main__":
    app.run()
