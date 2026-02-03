import os
os.environ["BYPASS_TOOL_CONSENT"] = "true"

import logging
from strands import Agent
from strands.tools.mcp import MCPClient
from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(name)s] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration du serveur MCP distant (depuis variables d'environnement)
RUNTIME_ID = os.getenv("MCP_SERVER_RUNTIME_ID")
ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
REGION = os.getenv("AWS_REGION", "us-west-2")  # us-west-2 est une valeur par défaut raisonnable

if not RUNTIME_ID:
    raise ValueError("MCP_SERVER_RUNTIME_ID environment variable is required")
if not ACCOUNT_ID:
    raise ValueError("AWS_ACCOUNT_ID environment variable is required")

# Construire l'URL du serveur MCP selon le format AgentCore
HOST = f"https://bedrock-agentcore.{REGION}.amazonaws.com"
PATH = f"runtimes/{RUNTIME_ID}/invocations"
QUERY_PARAMS = f"qualifier=DEFAULT&accountId={ACCOUNT_ID}"
MCP_SERVER_URL = f"{HOST}/{PATH}?{QUERY_PARAMS}"

logger.info(f"🔗 MCP Server URL: {MCP_SERVER_URL}")

# ============================================
# PARTIE 1: Créer le client MCP avec AWS IAM
# ============================================

def create_mcp_client():
    """Crée un client MCP avec authentification AWS IAM"""
    logger.info("🔗 Creating MCP client with AWS IAM authentication...")
    
    return aws_iam_streamablehttp_client(
        terminate_on_close=False,
        aws_service="bedrock-agentcore",
        aws_region=REGION,
        endpoint=MCP_SERVER_URL,
        timeout=120  # Augmenter le timeout à 120 secondes
    )

# ============================================
# PARTIE 2: AgentCore Runtime Wrapper
# ============================================

app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload, context):
    """Point d'entrée pour l'invocation de l'agent"""
    user_message = payload.get("prompt", "Bonjour!")
    logger.info(f"📨 [AGENT] Received message: {user_message}")
    logger.info(f"🔗 [AGENT] Connecting to MCP server: {RUNTIME_ID}")
    
    try:
        # Créer le client MCP et l'agent avec un timeout plus long
        with MCPClient(create_mcp_client, startup_timeout=120) as mcp_client:
            logger.info("✅ [AGENT] Connected to MCP server")
            
            # Lister les outils disponibles depuis le serveur MCP
            mcp_tools = mcp_client.list_tools_sync()
            logger.info(f"📋 [AGENT] Retrieved {len(mcp_tools)} tools from MCP server")
            
            # Créer l'agent avec les outils MCP
            agent = Agent(tools=mcp_tools)
            logger.info("✅ [AGENT] Agent created with MCP tools")
            
            # Invoquer l'agent
            result = agent(user_message)
            
            logger.info(f"📤 [AGENT] Sending response")
            return {"result": result.message}
            
    except Exception as e:
        logger.error(f"❌ [AGENT] Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    logger.info(f"🚀 Starting Agent with AWS MCP Proxy")
    logger.info(f"🔗 MCP Server: {RUNTIME_ID}")
    app.run()
