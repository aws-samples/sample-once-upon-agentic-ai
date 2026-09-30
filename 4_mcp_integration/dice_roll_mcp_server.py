# TODO: Step 1 - Import FastMCP from mcp.server
import random
import logging

# Configure logging to show dice roll results
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# TODO: Step 1 - Create an MCP server with the name "D&D Dice Roll Service" on port 8002
mcp = FastMCP(
    # name=
    # port=
)

@mcp.tool()
def roll_dice(faces: int = 6) -> int:
    """
    🎲 Roll a dice with a specified number of faces.
    Args:
        faces: Number of faces on the dice (default: 6)

    Returns:
        Random integer between 1 and faces (inclusive)
    """
    if faces < 1:
        raise ValueError("Dice must have at least 1 face")

    result = random.randint(1, faces)

    # Log the dice roll result
    logging.info(f"🎲 DICE ROLL: d{faces} = {result}")

    return result

# Start the MCP server
if __name__ == "__main__":
    print("Starting D&D Dice Roll MCP Server...")
    # TODO: Step 2 - Run the MCP server
