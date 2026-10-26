# Chapter 2: The Adventurer's Arsenal - Vended Tools

Tools let an agent act beyond text generation. Vended tools are the ones that ship with the Strands SDK, in `strands.vended_tools`, so there is nothing extra to install:

| Tool | What it does |
|---|---|
| `http_request` | calls external APIs (GET, POST, ...) |
| `notebook` | keeps persistent notes in the agent's state |
| `file_editor` | views, creates and edits files |
| `shell` | runs shell commands |
| `web_fetch` | fetches a web page and answers a question about it |
| `handoff_to_user` | pauses to ask the user a question |

## Main quest: `agent_with_vended_tools.py`

The Game Master gets the `http_request` tool and looks up spells and monsters on the free [Open5e API](https://open5e.com/):

```python
from strands.vended_tools import http_request

agent = Agent(tools=[http_request], system_prompt="...")
```

```bash
cd 2_vended_tools
python agent_with_vended_tools.py
```

The agent receives "What does the Fireball spell do, and how much damage does it deal?", decides to call `https://api.open5e.com/v2/spells/srd_fireball/` and answers from the data (8d6 fire damage, half on a successful save).

## Bonus quest: `bonus_quest.py` (optional)

Kiro the Grey Hat writes a Fibonacci script to a file and runs it: two tools and one safeguard.

- `file_editor` writes the scroll and `shell` casts it.
- `HumanInTheLoop(ask="stdio")` is an intervention that asks for your approval in the terminal before every tool call:

```python
from strands.vended_tools import shell, file_editor
from strands.vended_interventions.hitl import HumanInTheLoop

arcane_scribe = Agent(
    tools=[shell, file_editor],
    interventions=[HumanInTheLoop(ask="stdio")],
    system_prompt="...",
)
```

```bash
python bonus_quest.py
```

Answer `y` to each `Approve "file_editor"?` / `Approve "shell"?` prompt. Kiro writes `fibonacci_scroll.py` in this folder and reports the first ten Fibonacci numbers. Try `n` on one call to see how the agent reacts to a refusal.

Tools run with the permissions of your Python process. `allowed_tools=["file_editor"]` lets a tool run freely while the others still ask; `["*"]` disables the prompts entirely (testing only).

Windows: `shell` runs commands through `sh` and `file_editor` expects POSIX paths, so the bonus quest needs WSL.

Next: [Chapter 3](../3_custom_tools/).
