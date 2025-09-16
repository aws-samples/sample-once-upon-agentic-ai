# Strands already includes MCP, no additional install required
# TODO: Import FastMCP from mcp.server
import random
import logging

# Configure logging to show dice roll results
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# TODO: Create an MCP server with name "D&D Dice Roll Service" on port 8080
mcp = FastMCP(
    # name=
    # port=
)

@mcp.tool()
def roll_dice(faces: int = 6) -> dict:
    """
    🎲 Roll a dice with a specified number of faces.
    
    Args:
        faces: Number of faces on the dice (default: 6)
        
    Returns:
        Dictionary with roll result and details
    """
    if faces < 1:
        error_msg = "Dice must have at least 1 face"
        logging.warning(f"🎲 Invalid dice roll request: {error_msg}")
        return {"error": error_msg}
    
    result = random.randint(1, faces)
    
    # Log the dice roll result
    logging.info(f"🎲 DICE ROLL: d{faces} = {result}")
    
    return {
        "result": result,
        "faces": faces,
        "message": f"🎲 Rolled a d{faces}: {result}!"
    }

# Start the MCP server
if __name__ == "__main__":
    print("Starting D&D Dice Roll MCP Server...")
    # TODO: run the MCP server
