from strands import Agent
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client

def main():
    # Connect to the dice roll MCP server
    print("\nConnecting to D&D Dice Roll MCP Server...")
    mcp_dice_server = MCPClient(lambda: streamablehttp_client("http://localhost:8080/mcp"))
    
    try:
        with mcp_dice_server:
            # Create the gamemaster agent with access to dice rolling
            gamemaster = Agent(
                system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
                You speak with theatrical flair and always announce dice rolls with appropriate drama.
                
                You know all about D&D mechanics, always use the appropriate tools when applicable - never make up results!"""
            )
            
            # Get available tools from MCP server
            mcp_tools = mcp_dice_server.list_tools_sync()
            print(f"Available tools: {[tool.tool_name for tool in mcp_tools]}")
            
            # Add MCP tools to the agent
            gamemaster.tool_registry.process_tools(mcp_tools)
            
            # Start interactive session
            print("\n🎲 Lady Luck - D&D Gamemaster with MCP Dice Rolling")
            print("=" * 60)
            print("\n🎯 Try: 'Roll a d20' or 'Roll a d6' or 'Roll a d100'")
            
            while True:
                user_input = input("\n🎲 Your request: ")
                if user_input.lower() in ["exit", "quit", "bye"]:
                    print("🎭 May fortune favor your future adventures!")
                    break
                
                print("\n🎲 Rolling the dice of fate...\n")
                gamemaster(user_input)
                
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("💡 Make sure the dice service is running: python dice_roll_mcp_server.py")

if __name__ == "__main__":
    main()