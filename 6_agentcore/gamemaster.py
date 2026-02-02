import os
os.environ["BYPASS_TOOL_CONSENT"] = "true"

from strands import Agent
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Créer un agent simple
agent = Agent()

# Initialiser l'application AgentCore
app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload, context):
    """Point d'entrée pour l'invocation de l'agent"""
    user_message = payload.get("prompt", "Bonjour!")
    result = agent(user_message)
    print("Context:", context)
    print("Result:", result)
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
