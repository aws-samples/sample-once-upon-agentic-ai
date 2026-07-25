# 🏰 Chapter 9 — Deploy to Production with Bedrock AgentCore

Your Game Master has entertained adventurers on your laptop long enough. Time to
open the tavern to the whole realm: in this chapter you ship the game to
production on **Amazon Bedrock AgentCore Runtime** — a serverless,
session-isolated runtime built for agents.

You'll rebuild the workshop's architecture in production, one piece at a time:

1. **The Game Master** — a bare Strands agent, deployed and invocable (this part)
2. **The dice** — the MCP dice server from chapter 4, deployed as its own runtime
3. **The characters** — the character agent from chapter 5, reachable over A2A

```
Part 1 (you are here)
You ──invoke──▶ AgentCore Runtime (us-west-2)
                └── 🧙 gamemaster (Strands Agent)
```

## Prerequisites

- **Node.js 20+** and the AgentCore CLI: `npm install -g @aws/agentcore`
- **uv** (already installed from chapter 0)
- **AWS credentials** for an account with Bedrock model access in `us-west-2`

## Step 1 — Scaffold the project

The AgentCore CLI generates everything — the `agentcore/` config folder, the CDK
infrastructure, and a starter agent — with one command:

```bash
cd 9_agentcore_deploy
agentcore create --project-name gamemaster --name gamemaster \
  --framework Strands --model-provider Bedrock \
  --protocol HTTP --build CodeZip --memory none
```

You never write the `agentcore/` folder by hand. The generated project looks like:

```
gamemaster/
├── agentcore/              # Generated config + CDK infra (don't edit by hand)
│   ├── agentcore.json      # Runtime definition (name, protocol, entrypoint)
│   ├── aws-targets.json    # Filled at deploy time (your account + region)
│   └── cdk/                # CloudFormation-as-code used by `agentcore deploy`
└── app/gamemaster/
    ├── main.py             # 👈 the only file you work on
    └── pyproject.toml      # Python deps for the runtime
```

> Stuck? The finished project lives on the solution branch — compare with it
> anytime.

## Step 2 — Write the Game Master

Open `app/gamemaster/main.py` and replace the generated example. This is the
same kind of agent you built in chapter 1, plus two AgentCore touches:

1. `app = BedrockAgentCoreApp()` — the runtime wrapper
2. `@app.entrypoint` — marks the function AgentCore calls on each invocation

Complete the `# TODO` markers in `main.py`.

No tools yet — the Game Master narrates without dice for now (they arrive in
part 2, served over MCP, just like in chapter 4).

**Why no `agent_factory` here?** In chapter 5 you learned to isolate sessions
with an agent factory. AgentCore Runtime does that isolation *for you*: every
session runs in its own microVM, so a module-level `Agent` is safe — and within
a session, conversation history persists across invocations. The adventure
continues where it left off!

## Step 3 — Test locally

```bash
cd gamemaster
agentcore dev
```

This starts your agent locally with hot reload and a chat inspector UI at
**http://localhost:8081** (the agent itself listens on another port behind it).
Try it in the browser, or from another terminal:

```bash
curl -X POST http://localhost:8082/invocations \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "I push open the tavern door. What do I see?"}'
```

## Step 4 — Deploy to production

```bash
agentcore deploy
```

First run takes ~4 minutes: it bootstraps CDK in your account, zips your code
(CodeZip — no Docker involved), creates the IAM execution role, and stands up
the runtime. When it finishes:

```bash
agentcore status
```

shows your runtime `READY` with its ARN. Your Game Master is live. 🎉

## Step 5 — Invoke in production

```bash
agentcore invoke '{"prompt": "I push open the tavern door. What do I see?"}'
```

The CLI prints the response **and a session id**. Resume the same adventure —
the Game Master remembers where you left off:

```bash
agentcore invoke --session-id <the-session-id> '{"prompt": "I approach the hooded figure in the corner."}'
```

That's session persistence in production, with zero session code on your side.

## Useful commands

| Command | What it does |
|---|---|
| `agentcore dev` | Local run with hot reload + inspector UI |
| `agentcore deploy` | Deploy (or update) the runtime via CDK |
| `agentcore status` | Show deployed runtimes and their state |
| `agentcore invoke '{...}'` | Invoke the deployed runtime |
| `agentcore logs` | Tail the runtime's CloudWatch logs |

## 🧹 Cleanup

Wait until you've finished parts 2 and 3 — they build on this runtime. When the
campaign is truly over, note there is no `destroy` command; instead:

```bash
agentcore remove all
agentcore deploy
```

(`remove all` empties the project definition; the next `deploy` deletes the
now-empty CloudFormation stack.)

## Next up

Your Game Master is live but unarmed — it narrates around every die roll.
In **part 2** you deploy the chapter 4 MCP dice server as a second AgentCore
runtime and hand the Game Master its dice back, this time over the network. 🎲
