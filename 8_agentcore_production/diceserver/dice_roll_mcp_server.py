import random
import logging
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

mcp = MCPServer()

@mcp.tool()
def roll_dice(faces: int = 6) -> int:
    """Roll one die with a given number of faces and return the result.

    Use it every time the game needs a random roll: ability scores, attack rolls,
    saving throws, damage. Call it once per die; for "4d6 drop lowest", call it
    four times with faces=6 and discard the lowest result yourself.

    Example response: 14

    Notes:
        - One die per call: there is no count parameter.
        - Each roll is independent and uniformly random.

    Args:
        faces: Number of faces on the die, 1 or more. Use 20 for a d20, 6 for a d6,
            100 for a percentile die. Defaults to 6.

    Returns:
        An integer between 1 and faces, inclusive.
    """
    if faces < 1:
        # A ToolError keeps its message; any other exception reaches the client as "Error executing tool roll_dice"
        raise ToolError("Dice must have at least 1 face")

    result = random.randint(1, faces)

    logging.info(f"🎲 DICE ROLL: d{faces} = {result}")

    return result

if __name__ == "__main__":
    print("Starting Dice Roll MCP Server...")
    # TODO: Step 1 - Run the MCP server listening on all interfaces, on the default port, with stateless HTTP

