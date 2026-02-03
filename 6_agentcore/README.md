# AgentCore Workshop - MCP & A2A en Production

Ce workshop montre comment déployer des agents sur Amazon Bedrock AgentCore Runtime avec:
- **Serveur MCP** pour exposer des outils (dice roll)
- **Communication A2A** entre agents
- **Authentification AWS IAM** pour sécuriser les communications

## Architecture

```
┌─────────────────┐
│   Gamemaster    │ (Agent HTTP)
│   Agent         │
└────────┬────────┘
         │
         ├──MCP──→ ┌─────────────────┐
         │         │  Dice MCP       │ (Serveur MCP)
         │         │  Server         │
         │         └─────────────────┘
         │
         └──A2A──→ ┌─────────────────┐
                   │  Character      │ (Agent A2A)
                   │  Agent          │
                   └─────────────────┘
```

## Prérequis

- Python 3.11+
- AWS CLI configuré avec credentials
- `uv` package manager installé
- Compte AWS avec accès à Bedrock AgentCore

```bash
# Vérifier les prérequis
python --version
aws --version
aws sts get-caller-identity
```

## Installation

```bash
# Installer le CLI AgentCore
uv pip install bedrock-agentcore-starter-toolkit

# Vérifier l'installation
agentcore --help
```

## Étape 1: Déployer le Serveur MCP

Le serveur MCP expose un outil `roll_dice` pour lancer des dés.

### 1.1 Configurer le serveur MCP

```bash
cd 6_agentcore

agentcore configure \
  --entrypoint dice_mcp_server.py \
  --name dice_mcp_server \
  --protocol MCP \
  --requirements-file mcp_requirements.txt \
  --disable-memory \
  --non-interactive
```

### 1.2 Déployer le serveur MCP

```bash
agentcore launch --agent dice_mcp_server
```

### 1.3 Noter le Runtime ID

Après le déploiement, notez le Runtime ID (ex: `dice_mcp_server-XXXXXXXXXX`)

## Étape 2: Déployer le Character Agent (A2A)

Le character agent est un agent simple qui communique via le protocole A2A.

### 2.1 Configurer le character agent

```bash
agentcore configure \
  --entrypoint character_agent.py \
  --name character_agent \
  --protocol A2A \
  --requirements-file a2a_requirements.txt \
  --disable-memory \
  --non-interactive
```

### 2.2 Déployer le character agent

```bash
agentcore launch --agent character_agent
```

### 2.3 Noter le Runtime ID

Après le déploiement, notez le Runtime ID (ex: `character_agent-XXXXXXXXXX`)

## Étape 3: Configurer les Variables d'Environnement

### 3.1 Comprendre le fichier .env.example

Le fichier `.env.example` est un **template** qui montre quelles variables d'environnement sont nécessaires. Il contient des valeurs placeholder que vous devez remplacer par vos propres valeurs.

**Important**: 
- `.env.example` est commité dans Git (pour documentation)
- `.env` est dans le `.gitignore` (contient vos vraies valeurs)

### 3.2 Créer votre fichier .env

Copiez le template:

```bash
cp .env.example .env
```

### 3.3 Trouver les valeurs à remplir

#### MCP_SERVER_RUNTIME_ID

Après avoir déployé le serveur MCP (Étape 1), le Runtime ID est affiché dans la sortie:

```
Agent ARN: arn:aws:bedrock-agentcore:us-west-2:503606331109:runtime/dice_mcp_server-XXXXXXXXXX
                                                                    └──────────────────────────────┘
                                                                           Copiez cette partie
```

Ou récupérez-le avec:
```bash
agentcore status --agent dice_mcp_server
```

#### AWS_ACCOUNT_ID

Récupérez votre Account ID AWS:

```bash
aws sts get-caller-identity --query Account --output text
```

#### AWS_REGION

La région où vous déployez (par défaut: `us-west-2`)

#### A2A_CHARACTER_AGENT_RUNTIME_ID

Après avoir déployé le character agent (Étape 2), le Runtime ID est affiché:

```
Agent ARN: arn:aws:bedrock-agentcore:us-west-2:503606331109:runtime/character_agent-XXXXXXXXXX
                                                                    └─────────────────────────────┘
                                                                              Copiez cette partie
```

Ou récupérez-le avec:
```bash
agentcore status --agent character_agent
```

### 3.4 Exemple de fichier .env complété

```bash
# Configuration du serveur MCP
MCP_SERVER_RUNTIME_ID=dice_mcp_server-XXXXXXXXXX
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-west-2

# Configuration du serveur A2A (character agent)
A2A_CHARACTER_AGENT_RUNTIME_ID=character_agent-XXXXXXXXXX
```

### 3.5 Vérifier votre configuration

```bash
# Afficher les variables (sans les valeurs sensibles)
cat .env
```

## Étape 4: Configurer les Permissions IAM

Le gamemaster doit avoir les permissions pour invoquer le serveur MCP et le character agent.

```bash
# Récupérer le nom du rôle IAM du gamemaster
# (sera créé automatiquement lors de la configuration)
ROLE_NAME="AmazonBedrockAgentCoreSDKRuntime-us-west-2-XXXXXXXXXX"

# Ajouter les permissions
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name InvokeAgentsPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "bedrock-agentcore:InvokeAgentRuntime",
          "bedrock-agentcore:GetAgentCard"
        ],
        "Resource": [
          "arn:aws:bedrock-agentcore:us-west-2:ACCOUNT_ID:runtime/dice_mcp_server-*",
          "arn:aws:bedrock-agentcore:us-west-2:ACCOUNT_ID:runtime/character_agent-*"
        ]
      }
    ]
  }'
```

## Étape 5: Déployer le Gamemaster

Le gamemaster orchestre les appels vers le serveur MCP et le character agent.

### 5.1 Configurer le gamemaster

```bash
agentcore configure \
  --entrypoint gamemaster.py \
  --name gamemaster \
  --requirements-file requirements.txt \
  --non-interactive
```

### 5.2 Déployer avec les variables d'environnement

```bash
# Charger les variables depuis .env
export $(grep -v '^#' .env | xargs)

# Déployer le gamemaster
agentcore launch --agent gamemaster --auto-update-on-conflict \
  --env MCP_SERVER_RUNTIME_ID="${MCP_SERVER_RUNTIME_ID}" \
  --env AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}" \
  --env AWS_REGION="${AWS_REGION}" \
  --env A2A_CHARACTER_AGENT_RUNTIME_ID="${A2A_CHARACTER_AGENT_RUNTIME_ID}"
```

## Étape 6: Tester le Workflow Complet

### Test 1: Gamemaster avec MCP (dice roll)

```bash
agentcore invoke '{"prompt": "Lance 2d20 pour moi!"}' --agent gamemaster
```

Vous devriez voir le gamemaster utiliser l'outil `roll_dice` du serveur MCP.

### Test 2: Gamemaster avec A2A (character agent)

```bash
agentcore invoke '{"prompt": "Appelle le character agent et demande-lui de se présenter"}' --agent gamemaster
```

Vous devriez voir le gamemaster invoquer le character agent via le protocole A2A.

## Vérifier les Logs

### Logs du Gamemaster

```bash
aws logs tail /aws/bedrock-agentcore/runtimes/gamemaster-XXXXXXXXXX-DEFAULT \
  --log-stream-name-prefix "2026/02/03/[runtime-logs" \
  --since 5m \
  --follow
```

### Logs du Serveur MCP

```bash
aws logs tail /aws/bedrock-agentcore/runtimes/dice_mcp_server-XXXXXXXXXX-DEFAULT \
  --log-stream-name-prefix "2026/02/03/[runtime-logs" \
  --since 5m \
  --follow
```

### Logs du Character Agent

```bash
aws logs tail /aws/bedrock-agentcore/runtimes/character_agent-XXXXXXXXXX-DEFAULT \
  --log-stream-name-prefix "2026/02/03/[runtime-logs" \
  --since 5m \
  --follow
```

## Vérifier les Appels MCP

Dans les logs du serveur MCP, vous devriez voir:
```
🎲 [MCP SERVER] Received dice roll request: 2d20
🎲 [MCP SERVER] Rolled 2d20: [X, Y] = Z
```

## Vérifier les Appels A2A

Dans les logs du gamemaster, vous devriez voir:
```
🔗 [GAMEMASTER] Calling character agent via A2A
📤 [GAMEMASTER] Sending A2A message to character agent
📥 [GAMEMASTER] Received response (status: 200)
✅ [GAMEMASTER] Character agent responded
```

## Nettoyage

Pour supprimer les ressources déployées:

```bash
# Détruire le gamemaster
agentcore destroy --agent gamemaster --force

# Détruire le character agent
agentcore destroy --agent character_agent --force

# Détruire le serveur MCP
agentcore destroy --agent dice_mcp_server --force
```

## Concepts Clés

### MCP (Model Context Protocol)
- Protocole pour exposer des outils aux agents
- Port 8000, endpoint `/mcp`
- Authentification via `mcp-proxy-for-aws` avec AWS IAM

### A2A (Agent-to-Agent)
- Protocole pour la communication entre agents
- Port 9000, endpoint `/`
- Format JSON-RPC
- Authentification AWS IAM (SigV4) ou OAuth

### AgentCore Runtime
- Déploiement serverless des agents
- Scaling automatique
- Observabilité intégrée (CloudWatch, X-Ray)
- Isolation des sessions

## Troubleshooting

### Erreur: "MCP_SERVER_RUNTIME_ID environment variable is required"
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs
- Assurez-vous de charger les variables avec `export $(grep -v '^#' .env | xargs)`

### Erreur 403 Forbidden
- Vérifiez les permissions IAM du rôle d'exécution
- Assurez-vous que la policy `InvokeAgentsPolicy` est attachée

### Timeout d'initialisation
- Le serveur MCP peut prendre 30-60 secondes pour démarrer la première fois
- Attendez quelques minutes et réessayez

### Erreur 400 Bad Request pour A2A
- Vérifiez que l'URL A2A inclut le paramètre `accountId`
- Format: `https://bedrock-agentcore.REGION.amazonaws.com/runtimes/RUNTIME_ID/invocations/?accountId=ACCOUNT_ID`

## Ressources

- [Documentation AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [A2A Protocol](https://a2a-protocol.org/)
- [Strands Agents](https://strandsagents.com/)
