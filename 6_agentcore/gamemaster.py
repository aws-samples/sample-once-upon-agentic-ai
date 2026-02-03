import os
os.environ["BYPASS_TOOL_CONSENT"] = "true"

import logging
from strands import Agent, tool
from strands.tools.mcp import MCPClient
from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(name)s] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration depuis variables d'environnement
MCP_RUNTIME_ID = os.getenv("MCP_SERVER_RUNTIME_ID")
ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
REGION = os.getenv("AWS_REGION", "us-west-2")
A2A_RUNTIME_ID = os.getenv("A2A_CHARACTER_AGENT_RUNTIME_ID")

if not MCP_RUNTIME_ID:
    raise ValueError("MCP_SERVER_RUNTIME_ID environment variable is required")
if not ACCOUNT_ID:
    raise ValueError("AWS_ACCOUNT_ID environment variable is required")
if not A2A_RUNTIME_ID:
    raise ValueError("A2A_CHARACTER_AGENT_RUNTIME_ID environment variable is required")

# Construire les URLs
HOST = f"https://bedrock-agentcore.{REGION}.amazonaws.com"
MCP_PATH = f"runtimes/{MCP_RUNTIME_ID}/invocations"
QUERY_PARAMS = f"qualifier=DEFAULT&accountId={ACCOUNT_ID}"
MCP_SERVER_URL = f"{HOST}/{MCP_PATH}?{QUERY_PARAMS}"

logger.info(f"🔗 MCP Server: {MCP_RUNTIME_ID}")
logger.info(f"🔗 A2A Character Agent: {A2A_RUNTIME_ID}")

# ============================================
# PARTIE 1: Client MCP
# ============================================

def create_mcp_client():
    """Crée un client MCP avec authentification AWS IAM"""
    return aws_iam_streamablehttp_client(
        terminate_on_close=False,
        aws_service="bedrock-agentcore",
        aws_region=REGION,
        endpoint=MCP_SERVER_URL,
        timeout=120
    )

# ============================================
# PARTIE 2: Outil A2A pour invoquer le character agent
# ============================================

@tool
def call_character_agent(message: str) -> str:
    """
    Call the character agent via A2A protocol using AWS IAM authentication.
    
    Args:
        message: The message to send to the character agent
        
    Returns:
        Response from the character agent
    """
    logger.info(f"🔗 [GAMEMASTER] Calling character agent via A2A: {message}")
    
    try:
        import boto3
        import requests
        from requests_aws4auth import AWS4Auth
        from uuid import uuid4
        
        # Obtenir les credentials AWS
        session = boto3.Session()
        credentials = session.get_credentials()
        auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            REGION,
            'bedrock-agentcore',
            session_token=credentials.token
        )
        
        # Construire l'URL A2A
        url = f"https://bedrock-agentcore.{REGION}.amazonaws.com/runtimes/{A2A_RUNTIME_ID}/invocations/?accountId={ACCOUNT_ID}"
        
        # Construire le payload A2A JSON-RPC
        a2a_payload = {
            "jsonrpc": "2.0",
            "id": "req-001",
            "method": "message/send",
            "params": {
                "message": {
                    "role": "user",
                    "parts": [
                        {
                            "kind": "text",
                            "text": message
                        }
                    ],
                    "messageId": str(uuid4())
                }
            }
        }
        
        # Headers
        session_id = str(uuid4())
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': session_id
        }
        
        logger.info(f"📤 [GAMEMASTER] Sending A2A message to character agent")
        
        # Faire la requête
        response = requests.post(
            url,
            json=a2a_payload,
            headers=headers,
            auth=auth,
            timeout=60
        )
        
        logger.info(f"📥 [GAMEMASTER] Received response (status: {response.status_code})")
        
        if response.status_code == 200:
            result = response.json()
            # Extraire le texte de la réponse A2A
            if 'result' in result and 'artifacts' in result['result']:
                artifacts = result['result']['artifacts']
                response_text = ""
                for artifact in artifacts:
                    for part in artifact.get('parts', []):
                        if part.get('kind') == 'text':
                            response_text += part.get('text', '')
                logger.info(f"✅ [GAMEMASTER] Character agent responded")
                return response_text if response_text else json.dumps(result)
            return json.dumps(result)
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            logger.error(f"❌ [GAMEMASTER] Error: {error_msg}")
            return f"Error: {error_msg}"
            
    except Exception as e:
        logger.error(f"❌ [GAMEMASTER] Error calling character agent: {e}")
        return f"Error: {str(e)}"

# ============================================
# PARTIE 3: AgentCore Runtime Wrapper
# ============================================

app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload, context):
    """Point d'entrée pour l'invocation de l'agent"""
    user_message = payload.get("prompt", "Bonjour!")
    logger.info(f"📨 [GAMEMASTER] Received message: {user_message}")
    
    try:
        # Créer le client MCP et l'agent
        with MCPClient(create_mcp_client, startup_timeout=120) as mcp_client:
            logger.info("✅ [GAMEMASTER] Connected to MCP server")
            
            # Lister les outils MCP disponibles
            mcp_tools = mcp_client.list_tools_sync()
            logger.info(f"📋 [GAMEMASTER] Retrieved {len(mcp_tools)} MCP tools")
            
            # Créer l'agent avec les outils MCP + A2A
            all_tools = list(mcp_tools) + [call_character_agent]
            agent = Agent(tools=all_tools)
            logger.info(f"✅ [GAMEMASTER] Agent created with {len(all_tools)} tools (MCP + A2A)")
            
            # Invoquer l'agent
            result = agent(user_message)
            
            logger.info(f"📤 [GAMEMASTER] Sending response")
            return {"result": result.message}
            
    except Exception as e:
        logger.error(f"❌ [GAMEMASTER] Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    logger.info(f"🚀 Starting Gamemaster Agent")
    app.run()
