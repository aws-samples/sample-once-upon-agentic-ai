# 🌐 Chapter 4: Planar Portals - MCP Integration (Model Context Protocol)

![Header Image](../images/header5.jpeg)

_"Opening portals to distant realms..."_

Welcome to the arcane arts of planar connections, brave traveler! In this chapter, you'll learn the mystical art of the [Model Context Protocol (MCP)](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/mcp-tools/) - the magic that allows your agents to connect to external services and invoke powers from distant realms.

## 🎯 Quest Objective

Master the art of MCP portals by creating a two-component system:
1. **An MCP Server** (`dice_roll_mcp_server.py`) - That exposes the dice rolling service
2. **An MCP Client** (`gamemaster_mcp_client.py`) - That connects to the server and uses its tools

## 🔮 The MCP Philosophy

The Model Context Protocol allows separation of tools from agents:
- **🏰 MCP Servers**: Expose specialized tools via a standardized protocol
- **🧙‍♂️ MCP Clients**: Connect to servers to use their tools
- **🌉 Benefits**: Reusability, scalability, separation of concerns

## 📜 Part 1: Forging the MCP Server (`dice_roll_mcp_server.py`)

### Step 1: Invoke the Necessary Modules 📚
**TODOs**: Import FastMCP, random and logging

MCP servers need specific modules to function:

```python
# TODO: Import FastMCP from mcp.server
from mcp.server import FastMCP

# TODO: Import random and logging modules  
import random
import logging
```

**Why these imports?**
- `FastMCP`: The MCP server that exposes your tools
- `random`: To generate random dice results
- `logging`: To trace dice rolls in the logs

### Step 2: Create the MCP Server 🏰
**TODO**: Create an MCP server with the name "D&D Dice Roll Service" on port 8080

```python
# TODO: Create an MCP server with name "D&D Dice Roll Service" on port 8080

mcp = FastMCP(
    name="D&D Dice Roll Service",
    host="0.0.0.0", 
    port=8080
)
```

### Step 3: Transform the Function into an MCP Tool 🔧
**TODO**: Add the @mcp.tool() decorator

```python
# TODO: Add the @mcp.tool() decorator to transform the function into an MCP tool
@mcp.tool()
def roll_dice(faces: int = 6) -> dict:
    # The function is already implemented
```

### Step 4: Start the Server 🚀
**TODO**: Launch the MCP server

```python
if __name__ == "__main__":
    print("Starting D&D Dice Roll MCP Server on port 8080...")
    # TODO: Add the line to run the MCP server
    mcp.run(transport="streamable-http")
```

## 📜 Part 2: Create the MCP Client (`gamemaster_mcp_client.py`)

### Step 1: Import Connection Tools 🔗
**TODOs**: Import Agent, MCPClient and streamablehttp_client

```python
# TODO: Import Agent from strands
from strands import Agent

# TODO: Import MCPClient from strands.tools.mcp  
from strands.tools.mcp import MCPClient

# TODO: Import streamablehttp_client from mcp.client.streamable_http
from mcp.client.streamable_http import streamablehttp_client
```

### Step 2: Establish the Planar Connection 🌉
**TODO**: Create the MCP client

```python
# TODO: Create MCPClient connecting to "http://localhost:8080/mcp"
mcp_dice_server = MCPClient(lambda: streamablehttp_client("http://localhost:8080/mcp"))
```

### Step 3: Use the Context Manager 🔒
**TODO**: Use the MCP client in a context manager

```python
# TODO: Use the MCP client in a context manager (with statement)
with mcp_dice_server:
    # The rest of the code here
```

### Step 4: Create the Agent 🧙‍♂️
**TODO**: Create the gamemaster agent with Lady Luck system prompt
```python
# TODO: Create the gamemaster agent with Lady Luck system prompt
gamemaster = Agent(
    system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
    You speak with theatrical flair and always announce dice rolls with appropriate drama.
    
    You know all about D&D mechanics, always use the appropriate tools when applicable - never make up results!"""
)
```

### Step 5: Retrieve and Integrate Tools 🛠️
**TODOs**: List available tools and add them to the agent

```python
# TODO: Get available tools from MCP server using list_tools_sync()
mcp_tools = mcp_dice_server.list_tools_sync()

# TODO: Print the available tool names
print(f"Available tools: {[tool.tool_name for tool in mcp_tools]}")

# TODO: Add MCP tools to the agent using tool_registry.process_tools()
gamemaster.tool_registry.process_tools(mcp_tools)
```

## 🎲 Testing Your MCP System

### Step 1: Launch the Server
```bash
python dice_roll_mcp_server.py
```
You should see: "Starting D&D Dice Roll MCP Server on port 8080..."

### Step 2: Launch the Client (in another terminal)
```bash
python gamemaster_mcp_client.py
```

### Step 3: Test Dice Rolling
Try these commands:
- "Roll a d20"
- "Roll a d6" 
- "Roll a d100"
- "Roll 4d6 for ability scores"

## 🌟 Benefits of MCP Architecture

**🔄 Reusability**: The dice server can be used by multiple clients
**📈 Scalability**: Easy to add new tools to the server
**🛡️ Isolation**: Services are separated and independent
**🔧 Maintenance**: Update one service without affecting others

## 🚨 Troubleshooting MCP Portals

**"Connection failed" Error**:
- Check that the MCP server is running on port 8080
- Ensure the URL is correct: `http://localhost:8080/mcp`

**"Tool not found" Error**:
- Verify that the `@mcp.tool()` decorator is present
- Confirm that `list_tools_sync()` and `process_tools()` are called

**Import Errors**:
- Check installation: `pip install strands-agents`
- Ensure all imports are correct

## 🎉 Quest Complete!

Congratulations, Portal Master! You've mastered the mystical art of the Model Context Protocol. Your system can now:

**What you've mastered:**
- ✅ Creating MCP servers that expose tools
- ✅ Connecting MCP clients to remote services
- ✅ Integrating MCP tools into Strands agents
- ✅ Distributed architecture for agent systems

**Loot Acquired:**
- 🌐 MCP dice rolling server
- 🧙‍♂️ MCP client with Lady Luck
- 🔗 Distributed architecture skills
- 🎲 Centralized and reusable dice system

**Next Adventure**: Head to Chapter 5 where you'll discover Agent-to-Agent (A2A) communication and learn to orchestrate teams of specialized agents!

---

_"A well-opened portal is worth a thousand local tools!"_ 🌐✨