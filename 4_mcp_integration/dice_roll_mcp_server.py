# TODO: Import FastMCP from mcp.server
from mcp.server import FastMCP
import random
import logging

# Configure logging to show dice roll results
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# TODO: Create an MCP server with name "D&D Dice Roll Service" on port 8080
mcp = FastMCP(
    name="D&D Dice Roll Service",
    port=8080
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
    # TODO: run the MCP server
    mcp.run(transport="streamable-http")
