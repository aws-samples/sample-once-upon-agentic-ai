import logging
import os
from strands import Agent
from strands.multiagent.a2a import A2AServer
import uvicorn
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration depuis variables d'environnement
runtime_url = os.environ.get('AGENTCORE_RUNTIME_URL', 'http://127.0.0.1:9000/')
logger.info(f"Runtime URL: {runtime_url}")

# Créer un agent simple qui répond "Hello World"
strands_agent = Agent(
    name="Character Agent",
    description="A simple character agent that greets users warmly with enthusiasm.",
)

# Configuration du serveur A2A
host, port = "0.0.0.0", 9000

# Créer le serveur A2A
a2a_server = A2AServer(
    agent=strands_agent,
    http_url=runtime_url,
    serve_at_root=True  # Sert à la racine (/) pour AgentCore Runtime
)

# Créer l'application FastAPI
app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "healthy"}

# Monter le serveur A2A à la racine
app.mount("/", a2a_server.to_fastapi_app())

if __name__ == "__main__":
    logger.info("🚀 Starting Character Agent A2A Server on port 9000...")
    uvicorn.run(app, host=host, port=port)
