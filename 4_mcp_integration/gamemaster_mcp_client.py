from strands import Agent
# TODO: Step 1 - Import MCPClient from strands.tools.mcp and streamablehttp_client from mcp.client.streamable_http
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client

# TODO: Step 1 - Create a streamable http MCPClient connecting to "http://localhost:8002/mcp"
mcp_dice_client = MCPClient(lambda: streamablehttp_client("http://localhost:8002/mcp"))

gamemaster = Agent(
    system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
    You speak with theatrical flair and always announce dice rolls with appropriate drama.
    You know all about D&D mechanics, always use the appropriate tools when applicable - never make up results!""",
    # TODO: Step 2 - Add the MCP tool to the gamemaster agent
    tools=[mcp_dice_client]
)

gamemaster("Help me create a new D&D character! Roll the strength, wisdom, charisma and intelligence abilities scores using 4d6 drop lowest method.")
