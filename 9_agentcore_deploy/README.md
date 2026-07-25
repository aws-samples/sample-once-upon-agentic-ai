# 🏰 Chapter 9 — Deploy to Production with Bedrock AgentCore

Your Game Master has entertained adventurers on your laptop long enough. Time to
open the tavern to the whole realm: in this chapter you deploy the agent to
**Amazon Bedrock AgentCore Runtime** — a serverless, session-isolated runtime
built for agents — and invoke it in production.

## What you'll build

A minimal Game Master agent (Strands + a local `roll_dice` tool) wrapped in
`BedrockAgentCoreApp`, deployed to AWS with the AgentCore CLI. No Docker, no
servers to manage: the CLI zips your code, ships it, and gives you a runtime URL.

```
You ──invoke──▶ AgentCore Runtime (us-west-2)
                └── 🧙 gamemaster (Strands Agent + 🎲 roll_dice @tool)
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

> Already-scaffolded copy: this repo ships the finished project under
> `9_agentcore_deploy/gamemaster/` as a safety net — compare with it if you
> get stuck.

## Step 2 — Write the Game Master

Open `app/gamemaster/main.py` and replace the generated example. The pattern is
the same agent you built in chapter 3, plus two AgentCore touches:

1. `app = BedrockAgentCoreApp()` — the runtime wrapper
2. `@app.entrypoint` — marks the function AgentCore calls on each invocation

Complete the `# TODO` markers in `main.py`.

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
  -d '{"prompt": "A goblin jumps out! I attack it with my sword — roll for me."}'
```

You should see Lady Luck's cousin rolling a d20 for you. ⚔️

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
agentcore invoke '{"prompt": "A goblin jumps out! I attack it with my sword — roll for me."}'
```

The CLI prints the response **and a session id**. Resume the same adventure —
the agent remembers the wounded goblin:

```bash
agentcore invoke --session-id <the-session-id> '{"prompt": "I finish it off with my dagger!"}'
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

There is no `destroy` command. To tear everything down:

```bash
agentcore remove all
agentcore deploy
```

(`remove all` empties the project definition; the next `deploy` deletes the
now-empty CloudFormation stack.)

## Going further (optional quests)

The gamemaster you deployed rolls its own dice. In the full workshop
architecture (chapters 4–5), dice live in an **MCP server** and characters in an
**A2A agent** — both of which AgentCore can also host (`--protocol MCP` /
`--protocol A2A`). Deploying the three-piece architecture to production is left
as an epic-level quest. 🐉
