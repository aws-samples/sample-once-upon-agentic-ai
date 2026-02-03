#!/bin/bash

# Script pour déployer l'agent avec les variables d'environnement

# Charger les variables depuis .env si le fichier existe
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Déployer l'agent avec les variables d'environnement
agentcore launch --auto-update-on-conflict \
  --env MCP_SERVER_RUNTIME_ID="${MCP_SERVER_RUNTIME_ID}" \
  --env AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}" \
  --env AWS_REGION="${AWS_REGION}"
