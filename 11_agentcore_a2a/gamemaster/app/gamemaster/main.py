import os
import uuid
from urllib.parse import quote

import boto3
import httpx
from strands import Agent, tool
from strands.tools.mcp import MCPClient
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client, SigV4HTTPXAuth

app = BedrockAgentCoreApp()

REGION = os.environ.get("AWS_REGION", "us-west-2")
# Set by the `envVars` entries in agentcore/agentcore.json (chapters 10-11)
DICE_MCP_RUNTIME_ARN = os.environ.get("DICE_MCP_RUNTIME_ARN")
CHARACTER_AGENT_RUNTIME_ARN = os.environ.get("CHARACTER_AGENT_RUNTIME_ARN")

SYSTEM_PROMPT = """You are an epic D&D Game Master running a live adventure.
You narrate with theatrical flair, describe vivid scenes, and keep the story moving.
Whenever fate must decide an outcome (attacks, saving throws, skill checks),
use the roll_dice tool with the appropriate dice (d20 for checks, d6/d8 for damage...)
and weave the result into the narration. If you have no dice tool, describe the
tension and resolve outcomes narratively instead of inventing numbers.
For anything about player characters — creating one, looking one up, listing the
party — delegate to the character specialist via the contact_character_agent tool
and relay its answer in your own voice.
Keep responses short and punchy — this is a live game, not a novel."""


def _runtime_invocation_url(runtime_arn: str) -> str:
    """Invocation URL of an AgentCore runtime (same shape for MCP and A2A)."""
    return (
        f"https://bedrock-agentcore.{REGION}.amazonaws.com"
        f"/runtimes/{quote(runtime_arn, safe='')}/invocations?qualifier=DEFAULT"
    )


# One A2A session per microVM = one character-agent conversation per player
# session (AgentCore requires session ids of 33+ characters; a UUID4 is 36).
_a2a_session_id = str(uuid.uuid4())


@tool
def contact_character_agent(message: str) -> str:
    """
    Ask the character management specialist to create, find, or list
    D&D player characters.

    Args:
        message: The request to send, in plain natural language
            (e.g. "Create a character named Thorin, a dwarf fighter, male").

    Returns:
        The character specialist's answer.
    """
    # TODO: Send `message` to the character agent over A2A (JSON-RPC
    # "message/send"), signing the request with this runtime's IAM role
    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {"message": {
            "role": "user",
            "parts": [{"kind": "text", "text": message}],
            "messageId": str(uuid.uuid4()),
        }},
    }
    auth = SigV4HTTPXAuth(boto3.Session().get_credentials(), "bedrock-agentcore", REGION)
    response = httpx.post(
        _runtime_invocation_url(CHARACTER_AGENT_RUNTIME_ARN),
        json=payload,
        auth=auth,
        headers={"X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": _a2a_session_id},
        timeout=120,
    )
    response.raise_for_status()

    # An A2A reply carries the text in result.artifacts[].parts[]
    artifacts = response.json().get("result", {}).get("artifacts", [])
    text = "".join(
        part.get("text", "")
        for artifact in artifacts
        for part in artifact.get("parts", [])
        if part.get("kind") == "text"
    )
    if not text:
        raise ValueError(f"Character agent returned no text: {response.text[:200]}")
    return text

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
        if CHARACTER_AGENT_RUNTIME_ARN:
            tools.append(contact_character_agent)
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
