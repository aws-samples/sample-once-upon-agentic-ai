# TODO: Import Agent from strands
# TODO: Import MCPClient from strands.tools.mcp
# TODO: Import streamablehttp_client from mcp.client.streamable_http

def main():
    # Connect to the dice roll MCP server
    print("\nConnecting to D&D Dice Roll MCP Server...")
    # TODO: Create MCPClient connecting to "http://localhost:8080/mcp"
    
    try:
        # TODO: Use the MCP client in a context manager (with statement)
            # TODO: Create the gamemaster agent with Lady Luck system prompt
            gamemaster = Agent(
                system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
                You speak with theatrical flair and always announce dice rolls with appropriate drama.
                
                You know all about D&D mechanics, always use the appropriate tools when applicable - never make up results!"""
            )
            
            # TODO: Get available tools from MCP server using list_tools_sync()
            # TODO: Print the available tool names
            
            # TODO: Add MCP tools to the agent using tool_registry.process_tools()
            
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

