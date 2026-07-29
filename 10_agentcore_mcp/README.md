# 🎲 Chapter 10 — The Dice Return: Deploy the MCP Server

Your Game Master is live in production (chapter 9) — but it narrates around
every die roll. Time to give it back its dice: in this chapter you deploy the
**MCP dice server from chapter 4** as a second AgentCore runtime, then wire the
Game Master to it over the network with IAM authentication.

```
You ──invoke──▶ 🧙 gamemaster (AgentCore Runtime, HTTP)
                    │  MCP over HTTPS, SigV4-signed with the
                    │  gamemaster's execution role
                    ▼
                🎲 diceserver (AgentCore Runtime, MCP)
                    └── roll_dice — the chapter 4 tool, unchanged
```

This is the exact architecture you built locally in chapter 4 — same FastMCP
server, same Strands MCP client — with two production twists: each piece runs
in its own runtime, and authentication is AWS IAM instead of "everything is
localhost".

## Step 1 — Scaffold the MCP server project

```bash
cd 10_agentcore_mcp
agentcore create --project-name diceserver --name diceserver \
  --protocol MCP --build CodeZip --memory none
```

Note what's *not* there: no `--framework Strands`, no `--model-provider`. An
MCP server is not an agent — it's a plain tool server, no LLM anywhere.

## Step 2 — Port the chapter 4 dice server

Open `diceserver/app/diceserver/main.py` and replace the generated example with
the dice server from chapter 4. Only the `FastMCP(...)` line changes:

```python
mcp = FastMCP("D&D Dice Roll Service", host="0.0.0.0", stateless_http=True)
```

- `host="0.0.0.0"` — the runtime routes external traffic to your process
- `stateless_http=True` — AgentCore manages sessions; the server must not

Everything else — `@mcp.tool()`, `roll_dice`, `mcp.run(transport="streamable-http")` —
is copy-paste from chapter 4. Complete the `# TODO` markers.

## Step 3 — Deploy the dice server

```bash
cd diceserver
agentcore deploy
```

Note the runtime ARN in the outputs (also shown by `agentcore status`) — the
Game Master needs it in step 4:

```
arn:aws:bedrock-agentcore:us-west-2:<account>:runtime/diceserver_diceserver-XXXXXXXXXX
```

## Step 4 — Give the Game Master its dice back

Copy your chapter 9 `gamemaster/` project into this folder (it stays deployed —
we're upgrading it, and `agentcore deploy` updates in place).

Two changes, one declarative and one in code:

### 4a. Declare the connection (`gamemaster/agentcore/agentcore.json`)

`agentcore.json` was generated at scaffold time, before the dice server existed.
Cross-runtime access is declared by hand in the runtime entry — the CDK derives
the IAM policy from it at the next deploy:

```jsonc
"envVars": [
  { "name": "DICE_MCP_RUNTIME_ARN", "value": "<the diceserver runtime ARN>" }
],
"connections": [
  {
    "id": "dice-mcp-server",
    "to": { "type": "runtime", "arn": "<the diceserver runtime ARN>" }
  },
  {
    "id": "dice-mcp-server-endpoint",
    "to": { "type": "runtime", "arn": "<the diceserver runtime ARN>/runtime-endpoint/*" }
  }
]
```

> ⚠️ **The second connection matters.** IAM authorizes `InvokeAgentRuntime`
> against the `runtime-endpoint/*` sub-resource, but the policy the CLI derives
> from a bare runtime ARN only covers the runtime itself — without the second
> entry, the Game Master gets a `403 Forbidden` when it dials the dice server.

### 4b. Create the MCP client (`gamemaster/app/gamemaster/main.py`)

Add `mcp-proxy-for-aws` to the gamemaster's dependencies:

```bash
cd gamemaster/app/gamemaster && uv add mcp-proxy-for-aws
```

Then build the client — chapter 4's `MCPClient`, with an IAM-signed transport
instead of a plain `streamablehttp_client`:

```python
return MCPClient(lambda: aws_iam_streamablehttp_client(
    endpoint=dice_server_url,          # the runtime's /invocations URL
    aws_service="bedrock-agentcore",
    aws_region=REGION,
    terminate_on_close=False,
))
```

Complete the `# TODO` markers in `main.py`.

> ⚠️ **Create the Agent lazily, not at import time.** AgentCore gives your
> runtime 30 seconds to initialize. Connecting to the remote MCP server can
> blow that budget (the dice server may be cold-starting too). The solution
> code builds the Agent on the first invocation instead — look at
> `get_or_create_gamemaster()`.

## Step 5 — Redeploy and roll

```bash
cd gamemaster
agentcore deploy       # updates the chapter 9 runtime in place
agentcore invoke '{"prompt": "A goblin jumps out! I attack it with my sword — roll for me."}'
```

This time the roll is real. Verify it end to end in the dice server's logs:

```bash
cd ../diceserver
agentcore logs
# ... 🎲 DICE ROLL: 1d20 = [3]
```

One agent runtime just called a tool served by another runtime, authenticated
by IAM, with zero credentials in your code. ⚔️

## What you've learned

- An MCP server deploys to AgentCore like an agent does — `--protocol MCP`,
  no framework, no model
- `stateless_http=True` + `host="0.0.0.0"` are the only changes your chapter 4
  server needs for production
- Cross-runtime access is declarative: `connections` in `agentcore.json`
  generates the IAM policy (remember the `runtime-endpoint/*` entry!)
- `aws_iam_streamablehttp_client` is chapter 4's transport with SigV4 signing
- Runtime init has a 30s budget — do slow work lazily, on the first invocation

## Next up

The Game Master has its dice — but adventurers are still nowhere to be found.
In **chapter 11**, the character agent from chapter 5 joins the party over
**A2A**, and the whole three-piece architecture is live in production. 🧝
