# 🧝 Chapter 11 — The Party Assembles: A2A in Production

The Game Master is live (chapter 9) and rolling real dice (chapter 10). One
piece of the chapter 5 architecture is missing: the **character agent**. In this
final deploy chapter you ship it as a third AgentCore runtime, speaking **A2A**,
and the Game Master delegates character work to it — the full workshop
architecture is now in production.

```
You ──invoke──▶ 🧙 gamemaster (AgentCore Runtime, HTTP)
                    │                        │
        MCP over HTTPS + SigV4       A2A (JSON-RPC) over HTTPS + SigV4
                    ▼                        ▼
        🎲 diceserver (MCP)      🧝 characteragent (A2A)
            roll_dice                create / find / list characters
```

## Step 1 — Scaffold the A2A project

```bash
cd 11_agentcore_a2a
agentcore create --project-name characteragent --name characteragent \
  --framework Strands --model-provider Bedrock \
  --protocol A2A --build CodeZip --memory none
```

Unlike the MCP server (chapter 10), an A2A agent *is* an agent — so
`--framework Strands` and `--model-provider Bedrock` are back.

## Step 2 — Port the chapter 5 character agent

Open `characteragent/app/characteragent/main.py`. The agent itself — the three
tools (`create_character`, `find_character_by_name`, `list_all_characters`),
the TinyDB storage, the prompts — is a straight copy from chapter 5. Two things
change for production:

1. **The serving layer.** Chapter 5's `A2AServer` runs its own HTTP lifecycle;
   on AgentCore Runtime the platform owns that. The current pattern is:

   ```python
   from strands.multiagent.a2a.executor import StrandsA2AExecutor
   from bedrock_agentcore.runtime import serve_a2a

   serve_a2a(StrandsA2AExecutor(agent))
   ```

2. **The database path.** The runtime's code directory (`/var/task`) is
   read-only — TinyDB writes to `/tmp/characters.json` instead. `/tmp` lives
   inside the session's microVM: characters persist within a session, not
   across sessions. (Durable storage is a quest for another day.)

Complete the `# TODO` markers, then deploy and test it directly:

```bash
cd characteragent
agentcore deploy
agentcore invoke '{"prompt": "Create a character named Thorin, a dwarf fighter, male."}'
```

The CLI speaks A2A for you — behind the scenes that prompt travels as a
JSON-RPC `message/send` request.

## Step 3 — The Game Master recruits the specialist

Copy your chapter 10 `gamemaster/` here and wire in the character agent.

### 3a. Declare the connection (`gamemaster/agentcore/agentcore.json`)

Same declarative move as chapter 10 — add the env var and **both** connection
entries (runtime + `runtime-endpoint/*`, remember the 403 lesson):

```jsonc
"envVars": [
  ...,
  { "name": "CHARACTER_AGENT_RUNTIME_ARN", "value": "<the characteragent runtime ARN>" }
],
"connections": [
  ...,
  { "id": "character-agent",
    "to": { "type": "runtime", "arn": "<the characteragent runtime ARN>" } },
  { "id": "character-agent-endpoint",
    "to": { "type": "runtime", "arn": "<the characteragent runtime ARN>/runtime-endpoint/*" } }
]
```

### 3b. Talk A2A from a tool (`gamemaster/app/gamemaster/main.py`)

In chapter 5 the orchestrator used `A2AClientToolProvider`, which discovers
agents by fetching their agent card from `/.well-known/agent-card.json`.
AgentCore Runtime only exposes one invocation URL — there is no card endpoint —
so discovery-based clients don't work here. Instead, the Game Master gets a
plain Strands `@tool` that speaks the A2A wire protocol directly: a JSON-RPC
`message/send` POST, SigV4-signed with the runtime's execution role.

Complete the `# TODO` in `contact_character_agent` — the request is ~15 lines,
and the reply's text comes back in `result.artifacts[].parts[]`.

## Step 4 — The full party, live

```bash
cd gamemaster
agentcore deploy
agentcore invoke '{"prompt": "I want to join the campaign! Create my character: Elara, an elf wizard, female. Then roll a d20 to see how my arrival goes."}'
```

One prompt, three runtimes: the Game Master delegates creation to the character
agent over A2A, rolls the arrival check on the MCP dice server, and narrates
both. Check the proof in each runtime's logs:

```bash
cd ../characteragent && agentcore logs   # ✅ Created character Elara (Wizard Elf)...
cd ../../10_agentcore_mcp/diceserver && agentcore logs   # 🎲 DICE ROLL: 1d20 = [13]
```

**The chapter 5 architecture is in production.** 🎉

## What you've learned

- An A2A agent deploys like an HTTP agent (`--protocol A2A`, framework and
  model back in the scaffold) — only the serving layer differs:
  `serve_a2a(StrandsA2AExecutor(agent))`
- The runtime filesystem is read-only except `/tmp` — and `/tmp` is
  session-scoped (one microVM per session)
- A2A on the wire is just JSON-RPC over HTTPS: `message/send` in,
  `result.artifacts[].parts[]` out — small enough to speak from a `@tool`
- Card-based A2A discovery doesn't apply on AgentCore Runtime; you address
  agents by their invocation URL, authenticated with SigV4
- Cross-runtime IAM is the same declarative `connections` pattern for MCP
  and A2A alike

## 🧹 Cleanup

The campaign is over — tear down all three stacks. In each project directory
(`11_agentcore_a2a/characteragent`, `11_agentcore_a2a/gamemaster`,
`10_agentcore_mcp/diceserver`):

```bash
agentcore remove all
agentcore deploy
```

(`remove all` empties the project definition; the next `deploy` deletes the
now-empty CloudFormation stack. If you also deployed chapter 9's or 10's
gamemaster separately, do the same there.)

## 🏰 The end of the road

From a single `Agent()` on your laptop in chapter 1 to a three-runtime
multi-agent system in production — dice served over MCP, characters over A2A,
sessions isolated in microVMs, IAM guarding every hop, and not one credential
in your code. The tavern is open. Long live the party! ⚔️🎲🧙
