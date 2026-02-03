from mcp.server.fastmcp import FastMCP
import random
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [MCP SERVER] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer le serveur MCP
logger.info("🎲 Initializing Dice Roll MCP Server...")
mcp = FastMCP(host="0.0.0.0", stateless_http=True)

@mcp.tool()
def roll_dice(faces: int = 6, count: int = 1) -> dict:
    """
    Roll multiple dice with a specified number of faces.
    
    Args:
        faces: Number of faces on the dice (default: 6)
        count: Number of dice to roll (default: 1)
        
    Returns:
        Dictionary with list of results and total
    """
    logger.info(f"🎲 [MCP SERVER] Received dice roll request: {count}d{faces}")
    
    if faces < 1:
        logger.warning(f"❌ [MCP SERVER] Invalid faces: {faces}")
        return {"error": "Dice must have at least 1 face"}
    
    if count < 1:
        logger.warning(f"❌ [MCP SERVER] Invalid count: {count}")
        return {"error": "Must roll at least 1 dice"}
    
    results = [random.randint(1, faces) for _ in range(count)]
    total = sum(results)
    
    logger.info(f"🎲 [MCP SERVER] Rolled {count}d{faces}: {results} = {total}")
    
    return {
        "results": results,
        "total": total,
        "faces": faces,
        "count": count,
        "description": f"Rolled {count}d{faces}: {results} = {total}",
        "server": "PRODUCTION_MCP_SERVER"
    }

if __name__ == "__main__":
    logger.info("🚀 Starting Dice Roll MCP Server on port 8000...")
    mcp.run(transport="streamable-http")
