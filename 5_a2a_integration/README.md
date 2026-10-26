# Chapter 5: Agent-to-Agent Communication

Chapter 4 connected an agent to tools with MCP. Here agents talk to each other with [A2A](https://a2a-protocol.org/) (Agent2Agent), an open protocol that works across frameworks. Each agent publishes an **agent card** (name, description, skills, URL) and accepts messages over HTTP; a client reads the card, sends a task and gets the answer back. In Strands, `A2AServer` exposes an agent this way and the vended tool `make_a2a_client` lets another agent call it.

```
   Rules Agent          Character Agent         Dice Service
   (port 8000)            (port 8001)           (port 8002)
        │                      │                     │
        └──────────────────────┼─────────────────────┘
                               │
                    Game Master Orchestrator
                          (port 8009)
```

| Part | What | File | Status |
|---|---|---|---|
| 1 | Rules Agent | `agents/rules_agent/rules_agent.py` | done |
| 2 | Character Agent | `agents/character_agent/character_agent.py` | done |
| 3 | Game Master Orchestrator | `agents/gamemaster_orchestrator/gamemaster_orchestrator.py` | done |

## Part 1: the Rules Agent

### Build the knowledge base first

The agent searches the D&D Basic Rules, so they must be indexed in ChromaDB before it can work.

1. Download the Basic Rules 2018 PDF and name it exactly `DnD_BasicRules_2018.pdf`.
2. Put it in `utils/`, next to `create_knowledge_base.py`.
3. Run the script **from the `utils` folder**:

```bash
cd utils
python create_knowledge_base.py
```

You should see `Knowledge base creation complete!` and a `utils/rules_knowledge_base/` folder containing `chroma.sqlite3`.

The script reads the PDF page by page with `pypdf` and cuts each page into passages of about 1,000 characters, with 200 characters of overlap so a rule split in two stays findable. Each passage keeps its page number. ChromaDB embeds the passages with its default model (`all-MiniLM-L6-v2`, about 80 MB, downloaded on the first run). At query time the question is embedded the same way and the three closest passages come back. No LLM is involved in the lookup: it is pure semantic search, and the model only reads the results to write its answer.

### Complete `create_agent`

An `Agent` keeps its conversation in memory, so one instance is one conversation. An A2A server can have several callers at once, each with their own `context_id`, and they must not see each other's history. So `A2AServer` takes an **agent factory**: a function that builds a fresh `Agent` for each new context and is reused for the rest of that conversation. The configuration is the same as in earlier chapters, it just lives in a function.

| Step | Change | Why |
|---|---|---|
| 1 | `tools=[query_rules]` | what the agent can do: look up a rule |
| 2 | `name="Rules Agent"` | top of the agent card; without it every agent is called "Strands Agents" |
| 3 | `description="Rules lookup: fast, page-referenced answers from the Basic Rules knowledge base."` | what the orchestrator reads to decide whom to ask; the server refuses to start without one |
| 4 | `a2a_server = A2AServer(agent_factory=create_agent, port=8000)` | wraps the factory in an HTTP server speaking A2A |
| 5 | `a2a_server.serve()` under `if __name__ == "__main__":` | starts the server and blocks; the guard keeps imports (the tests) from starting it |

The card's `skills` are filled by Strands from the tool names and docstrings.

### Launch it

In a new terminal (activate the virtual environment again: `source ../.venv/bin/activate`):

```bash
cd agents/rules_agent
python rules_agent.py
```

You should see Uvicorn running on `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/.well-known/agent-card.json`:

```json
{
  "name": "Rules Agent",
  "description": "Rules lookup: fast, page-referenced answers from the Basic Rules knowledge base.",
  "url": "http://127.0.0.1:8000/",
  "version": "0.0.1",
  "skills": [{"id": "query_rules", "name": "query_rules", "description": "Look up a rule in the Basic Rules knowledge base. ..."}],
  "capabilities": {"streaming": true},
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"]
}
```

The real card also has `protocolVersion` (`0.3.0`) and `preferredTransport` (`JSONRPC`), added by the SDK. The `query_rules` skill description holds the whole docstring except the `Args:` section, which becomes the tool's parameter schema.

Leave this terminal open: the orchestrator needs the agent in Part 4.

## Part 2: the Character Agent

The Character Agent creates, finds and lists characters. Its three tools are already written and store the sheets in a local TinyDB file, `agents/character_agent/characters.json`:

| Tool | What it does |
|---|---|
| `create_character` | stores a new level 1 character with the given class, race, gender and ability scores, a Starting Equipment Pack and 100 gold pieces |
| `find_character_by_name` | exact, case-sensitive lookup; raises an error if the name is unknown |
| `list_all_characters` | returns every stored character |

The same steps as the Rules Agent, with this agent's tools and card:

| Step | Change |
|---|---|
| 1 | `tools=[create_character, find_character_by_name, list_all_characters]` |
| 2 | `name="Character Agent"` |
| 3 | `description="Character management for a fantasy role-playing game: creates characters (ability scores rolled 4d6 drop lowest), stores them, finds and lists them."` |
| 4 | `a2a_server = A2AServer(agent_factory=create_agent, port=8001)`: every agent needs its own port |
| 5 | `a2a_server.serve()` under `if __name__ == "__main__":` |

Launch it in a second terminal, the Rules Agent keeps running in the first (activate the virtual environment again):

```bash
cd agents/character_agent
python character_agent.py
```

You should see Uvicorn running on `http://127.0.0.1:8001`. The card is at `http://127.0.0.1:8001/.well-known/agent-card.json`. It has the name and description above, `url` `http://127.0.0.1:8001/`, and one skill per tool: `create_character`, `find_character_by_name` and `list_all_characters`. Each skill description is the tool's docstring without its `Args:` section. Leave this terminal open too.

The system prompt asks for 4d6 drop lowest, but this agent has no dice tool. The dice come from the MCP server on port 8002, which the orchestrator will use in Part 3, so ask for scores to be rolled there rather than by this agent alone.

## Part 3: the Game Master Orchestrator

The orchestrator is the chapter's API (FastAPI, port 8009). It has no rules or character logic of its own: it calls the Rules and Character agents over A2A and rolls dice through the Chapter 4 MCP server. The API routes (`/inquire`, `/health`, `/messages`, `/user/{name}`) were already written; the four steps configure the agent.

| Step | Change | Why |
|---|---|---|
| 1 | `mcp_client = MCPClient(url="http://localhost:8002/mcp")` | same client as Chapter 4; passed straight to `tools=[...]`, no `with` block |
| 2 | `a2a_client = make_a2a_client(allowed_endpoints=["http://127.0.0.1:8000", "http://127.0.0.1:8001"])` | one tool: `operation="discover"` reads an agent card, `operation="send_message"` sends it a request; any other URL is rejected before a connection is made |
| 3 | `tools=[mcp_client, a2a_client]` | `roll_dice` from the dice server, plus access to both agents |
| 4 | `structured_output_model=StoryOutput` | every turn comes back as validated JSON: `response`, `actions_suggestions`, `details`, `dice_rolls` |

Structured output matters because the Chapter 6 interface renders those fields separately.

### Launch it

Four terminals are needed. **Start the dice server before the Game Master**: the agent lists the MCP tools at startup, and the file's `try/except` hides a failure there, so the API still comes up with `/health` returning 200 but without a working agent.

```bash
# terminal 3
cd 4_mcp_integration && python dice_roll_mcp_server.py
# terminal 4
cd 5_a2a_integration/agents/gamemaster_orchestrator && python gamemaster_orchestrator.py
```

You should see Uvicorn running on `http://127.0.0.1:8009`. The Rules and Character agents are only contacted when a question needs them.

### Try it

```bash
curl -X POST http://0.0.0.0:8009/inquire \
  -H "Content-Type: application/json" \
  -d '{"question": "Roll a d20 for initiative!"}'
```

Output from a real run (abridged):

```json
{
  "response": {
    "response": "The air crackles with tension ... Thorin rolls for Initiative: 5 + 1 (Dexterity modifier) = 6 ...",
    "actions_suggestions": ["Take your turn in combat - attack an enemy!", "Use your action to Dodge ...", "Survey the battlefield ..."],
    "details": "Rolled a d20 for initiative using roll_dice (result: 5). Added Thorin's Dexterity modifier of +1 ...",
    "dice_rolls": [{"dice_type": "d20", "result": 5, "reason": "Initiative roll + Dexterity modifier (+1) = 6"}]
  }
}
```

`result` is the raw die value; the total goes in `reason`.

What each kind of question showed:

| Question | Result |
|---|---|
| "What are the rules for dexterity checks?" | worked: answer cites "Basic Rules, Page 63", so it came from the Rules Agent |
| "Roll a d20 for initiative!" | worked: one `roll_dice` call through MCP, correct arithmetic |
| "Create a character named Thorin, a Dwarf Fighter ..." | dice worked (12 rolls for 4d6 drop lowest, totals correct), but the Character Agent call ended in task state `failed` three times; nothing was stored. The Game Master reported this honestly |
| "What is Thorin's constitution?" | the Character Agent again failed to respond; the Game Master said so and answered from the earlier conversation |

In that run the Character Agent's terminal showed the cause: `AccessDeniedException` on `bedrock:InvokeModelWithResponseStream` in `us-east-1`, because that terminal had a different AWS region than the others (see Troubleshooting). Restart it with the same `AWS_REGION` and repeat the two character requests.

### Things to know

- **One agent, one history.** The orchestrator is a single global `Agent`, so conversation carries across requests (`GET /messages` shows it). It can answer about "Thorin" from earlier turns even if he was never stored. Fine for one player.
- **Markdown in answers.** The narration uses markdown and emoji; a UI that does not render markdown will show it raw.

## Troubleshooting

- `Collection [basic_rules] does not exist`, or an error from `get_collection`: the knowledge base was not built, or was built from the wrong folder. Run `create_knowledge_base.py` from `utils/`.
- `Address already in use` on port 8000: an earlier Rules Agent is still running.
- `Address already in use` on port 8001: an earlier Character Agent is still running.
- `client failed to initialize` when starting the Game Master: the dice server on port 8002 is not running. Start it first.
- `Address already in use` on port 8009: an earlier Game Master is still running.
- The Game Master reports the Character Agent as unreachable or `failed`: read the Character Agent terminal (port 8001) for the real error, and test it directly with a `message/send` POST to `http://127.0.0.1:8001/`.
- `AccessDeniedException ... bedrock:InvokeModelWithResponseStream` in an agent's terminal, with `Bedrock region: us-east-1`: that agent started with a different AWS region or profile than your other terminals, and the Game Master only sees task state `failed`. Every terminal needs the same `AWS_REGION` (and `AWS_PROFILE`, if you use one); check with `aws sts get-caller-identity`. If it still fails in the right region, the IAM policy lacks that Bedrock action.
- The agent card loads but questions fail: the agent calls Bedrock, so it needs AWS credentials as in [Chapter 1](../1_strands_basics/). The card itself needs none.

Previous: [Chapter 4](../4_mcp_integration/).