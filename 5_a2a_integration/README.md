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
| 2 | Character Agent | `agents/character_agent/character_agent.py` | to do |
| 3 | Game Master Orchestrator | `agents/gamemaster_orchestrator/gamemaster_orchestrator.py` | to do |

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

## Troubleshooting

- `Collection [basic_rules] does not exist`, or an error from `get_collection`: the knowledge base was not built, or was built from the wrong folder. Run `create_knowledge_base.py` from `utils/`.
- `Address already in use` on port 8000: an earlier Rules Agent is still running.
- The agent card loads but questions fail: the agent calls Bedrock, so it needs AWS credentials as in [Chapter 1](../1_strands_basics/). The card itself needs none.

Previous: [Chapter 4](../4_mcp_integration/).