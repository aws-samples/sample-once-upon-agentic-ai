import random
import logging

from mcp.server.fastmcp import FastMCP

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# host="0.0.0.0" and stateless_http=True are required by AgentCore Runtime:
# the platform routes requests to your server and handles sessions itself.
# TODO: Create the MCP server, same as chapter 4 but with the AgentCore params above
mcp = FastMCP("D&D Dice Roll Service", host="0.0.0.0", stateless_http=True)


# TODO: Register roll_dice on the server — this is the exact tool from chapter 4
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

    logging.info(f"🎲 DICE ROLL: {count}d{faces} = {results}")

    return {
        "results": results,
        "faces": faces,
    }


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
