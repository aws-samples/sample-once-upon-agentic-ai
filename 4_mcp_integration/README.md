# Chapter 4: MCP Integration

In Chapter 3 `roll_dice` lived inside the agent's process. Here it moves into its own server and the Game Master reaches it through the [Model Context Protocol](https://modelcontextprotocol.io/): an open standard for how AI applications talk to external tools. An MCP server exposes tools (name, description, JSON schema) over a transport, and an MCP client lists and calls them without custom code for that server.

The `roll_dice` function is the Chapter 3 one, same signature and docstring. Only the way it is served changes, from `@tool` to `@mcp.tool()`.

## Part 1: the server, `dice_roll_mcp_server.py`

1. **Create the server**: `from mcp.server import FastMCP`, then `FastMCP(port=8002)`. It needs no name, since the model only sees the tools.
2. **Expose the tool**: `@mcp.tool()` on `roll_dice`. Note the parentheses, the decorator is called. FastMCP builds the specification from the docstring and sends it to whoever connects.
3. **Choose the transport**: `mcp.run(transport="streamable-http")`.

| Transport | How it works |
|---|---|
| `stdio` | the client launches the server as a child process and talks over stdin/stdout; the server lives and dies with that client |
| `streamable-http` | the server is an independent process listening on a URL, here `http://localhost:8002/mcp`; any number of clients can connect |

Streamable HTTP is what we need: the Game Master runs in a second terminal, and in Chapter 5 several agents share this dice server.

```bash
cd 4_mcp_integration
python dice_roll_mcp_server.py
```

You should see `Starting Dice Roll MCP Server...` followed by Uvicorn running on `http://127.0.0.1:8002`. Leave this terminal open.

## Part 2: the client, `gamemaster_mcp_client.py`

1. **Create the client**: `from strands.tools.mcp import MCPClient`, then `mcp_dice_client = MCPClient(url="http://localhost:8002/mcp")`. From a URL Strands builds the streamable HTTP transport itself.
2. **Give it to the agent**: `Agent(tools=[mcp_dice_client], ...)`. No `with` block is needed: `MCPClient` is a tool provider, so Strands opens the connection on first use to list the tools and closes it when the agent shuts down. The `with mcp_client:` form is the manual variant, only required when you call `list_tools_sync()` or `call_tool_sync()` yourself.

In a second terminal, in the same folder:

```bash
python gamemaster_mcp_client.py
```

Lady Luck asks the server for its tool list, receives the `roll_dice` specification and rolls four ability scores with 4d6 drop lowest: 16 rolls. Watch both terminals:

- **server terminal**: 16 log lines like `🎲 DICE ROLL: d6 = 4`, one per roll
- **client terminal**: the narration and the final scores

Same agent, same tool as Chapter 3, but the dice now live in another process.

## Checking the server without an agent

You can test the server without Bedrock credentials by listing and calling the tool yourself:

```python
from strands.tools.mcp import MCPClient

with MCPClient(url="http://localhost:8002/mcp") as client:
    print([t.tool_name for t in client.list_tools_sync()])  # ['roll_dice']
    print(client.call_tool_sync("t1", "roll_dice", {"faces": 6}))
```

## Troubleshooting

- `ConnectionError` / connection refused in the client: the server is not running, or is not on port 8002.
- `Address already in use` when starting the server: another process holds port 8002, for example an earlier server you forgot to stop.
- The client needs AWS credentials for Bedrock, as in Chapter 1. The server does not.

Once the character is created you can stop the client. If you continue with Chapter 5, keep the server running.

Previous: [Chapter 3](../3_custom_tools/).