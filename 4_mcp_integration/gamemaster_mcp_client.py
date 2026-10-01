from strands import Agent
# TODO: Step 1 - Import MCPClient from strands.tools.mcp and streamablehttp_client from mcp.client.streamable_http

# TODO: Step 1 - Create a streamable http MCPClient connecting to "http://localhost:8002/mcp"

gamemaster = Agent(
    system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
    You speak with theatrical flair and always announce dice rolls with appropriate drama.
    You know all about D&D mechanics, always use the appropriate tools when applicable - never make up results!"""
    # TODO: Step 2 - Add the MCP tool to the gamemaster agent
)

print("""
🎲 Lady Luck - D&D Gamemaster with MCP Dice Rolling
============================================================
🎯 Try: 'Roll a d20' or 'Roll a d6' or 'Roll a d100'
💡 Make sure the dice server is running: python dice_roll_mcp_server.py
""")

while True:
    user_input = input("\n🎲 Your request: ")
    if user_input.lower() in ["exit", "quit", "bye"]:
        print("🎭 May fortune favor your future adventures!")
        break

    print("\n🎲 Rolling the dice of fate...\n")
    gamemaster(user_input)
