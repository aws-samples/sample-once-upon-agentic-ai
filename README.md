# Once Upon Agentic AI: A Developer's Epic Journey into the Strands SDK

![Header Image](images/home.png)

_"Roll for Initiative... in Python!"_

A hands-on workshop that teaches the [Strands Agents SDK](https://strandsagents.com/) by building a Dungeons & Dragons Game Master: one agent first, then tools, an MCP server, remote agents over A2A, a web interface, and finally the same system rebuilt with Strands harness.

**The instructions live in the AWS workshop: [Once Upon Agentic AI](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/0-pre-requisites).** This repository holds the code you complete along the way: each chapter folder contains files with `# TODO` markers that the workshop walks you through.

## Quick Start

```bash
git clone https://github.com/aws-samples/sample-once-upon-agentic-ai.git
cd sample-once-upon-agentic-ai
uv python install          # if you don't have Python yet (3.10+)
uv sync                    # creates .venv/ with every dependency
source .venv/bin/activate  # .venv\Scripts\activate on Windows
```

No `uv`? Install it from [docs.astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/), or use plain pip: `pip install .` from the repository root.

The agents run on Amazon Bedrock by default (Claude Sonnet 4.6; chapter 7 uses Claude Opus 5). You need AWS credentials with access to those models, see [Chapter 0](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/0-pre-requisites).

## The Adventure Map

| Chapter | Folder | What you build |
|---|---|---|
| 0. An Unexpected Adventure | [instructions](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/0-pre-requisites) | Set up Python, uv and this repository |
| 1. The Art of Agent Summoning | [`1_strands_basics/`](1_strands_basics/) | Your first agent, a system prompt, debug logs |
| 2. The Adventurer's Arsenal | [`2_built_in_tools/`](2_built_in_tools/) | Built-in (vended) tools: `http_request` on the D&D 5e API; bonus: `shell` + `file_editor` gated by `HumanInTheLoop` |
| 3. The Art of Magical Forging | [`3_custom_tools/`](3_custom_tools/) | Your own `@tool`: the dice roller |
| 4. Planar Portals - MCP | [`4_mcp_integration/`](4_mcp_integration/) | The same dice roller served over MCP, and an agent that consumes it |
| 5. The Grand Alliance - A2A | [`5_a2a_integration/`](5_a2a_integration/) | Rules Agent + Character Agent over A2A, a Game Master orchestrator with structured output |
| 6. Web Interface Testing | [web UI](https://aws-samples.github.io/sample-once-upon-agentic-ai/) | Play with your Game Master through the browser |
| 7. The Enchanted Armour - Strands harness | [`7_strands_harness/`](7_strands_harness/) | The Game Master API rebuilt with `create_harness()` |
| Final cleanup | [instructions](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/cleanup) | Stop your services and delete the generated files |

Complete the chapters in order: each one reuses what the previous one built.

## Branches

- `main`: the skeleton you clone, with `# TODO` markers to fill in.
- `solution-*`: the same files with the answers written below each TODO. Use the latest one if you get stuck.

## Dependencies

The workshop ships no lockfile (`uv.lock` is gitignored), so `uv sync` installs the latest compatible releases. Three bounds are pinned in `pyproject.toml`, each with a comment explaining why: a floor on `strands-agents` (the release the instructions were written against), `strands-harness` for chapter 7, and a `mcp<2` ceiling because mcp 2.0 renamed the `FastMCP` and `streamablehttp_client` symbols chapters 4 and 5 teach. If a chapter breaks against a newer release, please open an issue.

## Tests

```bash
uv run pytest tests/
```

The tests cover the chapter 5 A2A servers: module imports, the per-context `agent_factory` isolation, and the agent card served over HTTP.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

_"The best way to predict the future is to build the agents that will create it."_ - Modern Developer Wisdom

_Happy coding, Agent Master! 🐉⚔️🧙‍♂️_
