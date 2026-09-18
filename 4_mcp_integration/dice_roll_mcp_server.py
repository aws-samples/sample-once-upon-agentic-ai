# TODO: Import MCPServer from mcp.server
import random
import logging

# Configure logging to show dice roll results
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# TODO: Create an MCP server with the name "D&D Dice Roll Service"
# The port is not set here - you choose it when you run the server, at the bottom of this file.
mcp = MCPServer(
    # name=
)

@mcp.tool()
def roll_dice(faces: int = 6, count: int = 1) -> dict:
    """
    🎲 Roll multiple dice with a specified number of faces.
    
    Args:
        faces: Number of faces on the dice (default: 6)
        count: Number of dice to roll (default: 1)
        
    Returns:
        Dictionary with list of results and faces
    """
    if faces < 1:
        error_msg = "Dice must have at least 1 face"
        logging.warning(f"🎲 Invalid dice roll request: {error_msg}")
        return {"error": error_msg}
    
    if count < 1:
        error_msg = "Must roll at least 1 dice"
        logging.warning(f"🎲 Invalid dice roll request: {error_msg}")
        return {"error": error_msg}
    
    results = [random.randint(1, faces) for _ in range(count)]
    
    # Log the dice roll results
    logging.info(f"🎲 DICE ROLL: {count}d{faces} = {results}")
    
    return {
        "results": results,
        "faces": faces
    }

# Start the MCP server
if __name__ == "__main__":
    print("Starting D&D Dice Roll MCP Server...")
    # TODO: Run the MCP server on the streamable-http transport, on port 8002
