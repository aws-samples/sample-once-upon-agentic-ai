# 🏰 Chapter 5: The Grand Alliance - Agent-to-Agent Mastery

![Header Image](../images/header7.png)

_"No great quest is accomplished alone. Even the mightiest heroes need allies..."_

Welcome to the most epic chapter of your journey, Master Architect! Here you'll learn the ancient art of **Agent Orchestration** with [Agent2Agent (A2A)](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/agent-to-agent/) - commanding multiple specialized AI companions to work in perfect harmony. You'll forge a legendary D&D Game Master system where each agent brings unique expertise to create truly immersive adventures.

## 🎯 Quest Objective

Construct the **Grand Alliance** - a fellowship of three specialized agents working together to run the ultimate D&D experience:

- **🧙‍♂️ The Sage of Rules**: A wise keeper of D&D lore and mechanics
- **⚔️ The Character Chronicler**: A master of heroes, stats, and legendary tales  
- **👑 The Grand Orchestrator**: The supreme Game Master who coordinates all adventures

## 🏰 The Architecture of Legends

```
        🧙‍♂️ The Sage of Rules    ⚔️ Character Chronicler    🎲 Dice Oracle
           (Port 8000)              (Port 8001)            (Port 8080)
                │                        │                      │
                └────────────────────────┼──────────────────────┘
                                         │
                              👑 The Grand Orchestrator
                                   (Port 8009)
                                 [The Master's Throne]
```

## 🗡️ The Fellowship's Powers

Your **Grand Alliance** will possess legendary abilities:
- **📚 Ancient Wisdom**: Instant access to all D&D rules and mechanics
- **👥 Hero Forging**: Create and manage legendary character sheets
- **🎲 Fate Weaving**: Roll dice and determine destinies
- **🎭 Epic Storytelling**: Orchestrate multi-layered adventures with perfect coordination

## 📚 Prerequisites

Make sure you have completed the previous chapters and understand:
- Basic Strands agents
- Tool creation with `@tool` decorator
- MCP integration

## 🚀 Getting Started

### Step 1: Configure Your Environment

The system uses configurable models via environment variables:

```bash
# In your .env file
MODEL_ID=us.anthropic.claude-3-5-haiku-20241022-v1:0
```

You can change this to any supported model of your choice

## 🧙‍♂️ Part 1: Awakening the Sage of Rules

Deep in the mystical archives, we've prepared a legendary **Knowledge Vault** for you! The ancient D&D Basic Rules have been transformed into magical text fragments, stored within the sacred `utils/dnd_knowledge_base/` ChromaDB. This enchanted repository contains all the wisdom needed to answer any rules question that adventurers might pose.

**The Sage's Sacred Duties:**
- Interpreting ancient D&D laws and mechanics
- Providing instant access to combat rules, spells, and abilities
- Guiding adventurers through complex rule interactions

### Your Ritual Tasks:

#### 📚 TODO 1: Forge the Wisdom Conduit
In `agents/rules_agent/rules_agent.py`, complete the sacred `query_dnd_rules` function:

```python
@tool
def query_dnd_rules(query: str) -> str:
    """Fast D&D rule lookup. Returns brief rule with page reference."""
    # TODO: Use the rules_kb to query for D&D rules
    # Call rules_kb.quick_query(query) and return the result
    pass
```

**🔮 Ancient Secret**: The mystical `rules_kb` oracle is already awakened and connected to the Knowledge Vault. Simply channel its power!

#### 🧙‍♂️ TODO 2: Summon the Sage of Rules
Complete the mystical binding ritual:

```python
agent = Agent(
    # TODO: Configure the Sage with:
    # - model: Channel power from os.getenv("MODEL_ID")
    # - tools: Equip with the query_dnd_rules wisdom conduit
    # - name: "Rules Agent" 
    # - description: "Fast D&D rules lookup"
    # - system_prompt: Instruct the Sage to consult the archives when needed
    pass
)
```

#### 🏰 TODO 3: Establish the Sage's Tower
Construct the mystical communication spire:

```python
# TODO: Create an A2AServer fortress with:
a2a_server = A2AServer(
# - agent: The Sage you've just summoned
# - port: 8000 (The Sage's sacred tower number)
)
```

#### 🌟 TODO 4: Open the Tower Gates
Complete the awakening ceremony:

```python
if __name__ == "__main__":
    # TODO: Open the Sage's tower to the realm
    # Call a2a_server.serve() with host="0.0.0.0" and port=8000
    pass
```

If successful, your Sage will stand ready in their tower, ancient knowledge at their fingertips!

## ⚔️ Part 2: Awakening the Character Chronicler

Behold the **Character Chronicler** - master of heroic tales and legendary statistics! This agent wields three powerful artifacts (already forged for your study):

- **🏗️ `create_character`**: Births new heroes with full backstories and abilities
- **🔍 `find_character_by_name`**: Locates heroes across the realm by name
- **📜 `list_all_characters`**: Reveals all heroes in the chronicles

**Study these legendary tools** to understand advanced patterns with dataclasses, databases, and complex character management!

### Your Ritual Tasks:

#### ⚔️ TODO 1: Summon the Character Chronicler
In `agents/character_agent/character_agent.py`, bind the Chronicler to their destiny:

```python
agent = Agent(
    # TODO: Configure the Character Chronicler with:
    # - model: Draw power from os.getenv("MODEL_ID")
    # - tools: Equip with [create_character, find_character_by_name, list_all_characters]
    # - name: "Character Creator Agent"
    # - description: Define their role as keeper of heroic tales and character destinies
    # - callback_handler: None (the Chronicler works alone)
    pass
)
```

#### 🏰 TODO 2: Establish the Hall of Heroes
```python
# TODO: Create an A2AServer stronghold with:
a2a_server = A2AServer(
# - agent: The Character Chronicler you've summoned
# - port: 8001 (The Hall of Heroes' sacred number)
)
```

#### 🌟 TODO 3: Open the Hall's Doors
```python
if __name__ == "__main__":
    # TODO: Welcome visitors to the Hall of Heroes
    # Call a2a_server.serve() with host="0.0.0.0" and port=8001
    pass
```

Watch as the Hall of Heroes opens, ready to forge new legends!

## 👑 Part 3: Crowning the Grand Orchestrator

Behold the **Grand Orchestrator** - the supreme Game Master who commands the entire fellowship! This legendary being coordinates all agents, weaves epic narratives, and provides the mystical API gateway that adventurers use to enter your realm.

**The Orchestrator's Divine Powers:**
- **🌐 Agent Communication**: Commands the fellowship through A2A magic
- **🎲 Fate Integration**: Channels the MCP Dice Oracle for destiny rolls
- **🎭 Epic Storytelling**: Weaves responses from multiple agents into grand narratives
- **⚡ Lightning Responses**: Provides instant access through the sacred FastAPI portal

### Your Supreme Ritual Tasks:

#### 🌐 TODO 1: Forge the Fellowship Bonds
In `agents/gamemaster_orchestrator/gamemaster_orchestrator.py`, establish mystical connections:

```python
# TODO: Initialize A2AClientToolProvider with known_agent_urls containing:
a2a_provider = A2AClientToolProvider(known_agent_urls=[
# - "http://127.0.0.1:8000" (The Sage of Rules' tower)
# - "http://127.0.0.1:8001" (The Hall of Heroes)
])
```

#### 🎲 TODO 2: Channel the Dice Oracle
```python
# TODO: Open a portal to the MCP Dice Oracle
# Initialize MCPClient with a lambda that returns streamablehttp_client("http://localhost:8080/mcp")
mcp_dice_client = None
```
Hint: Look back in Chapter 4 😉

#### 👑 TODO 3: Ascend to the Master's Throne
```python
if __name__ == "__main__":
    # TODO: Open the gates to your realm
    # Use uvicorn.run() with app, host="0.0.0.0", and port=8009
    pass
```

The Grand Orchestrator will take their throne, ready to command epic adventures!

## ⚔️ Part 4: The Grand Alliance Awakening Ceremony

### 🏰 Summon the Complete Fellowship:

Open 4 different termninals and run the following commands

**🎲 Awaken the Dice Oracle** (Sacred Terminal 0):
```bash
cd 4_mcp_integration
python dice_roll_mcp_server.py
```
*The Grand Orchestrator requires the mystical dice powers from Chapter 4!*

**🧙‍♂️ Awaken the Sage of Rules** (Sacred Terminal 1):
```bash
cd 5_a2a_integration/agents/rules_agent
python rules_agent.py
```

**⚔️ Open the Hall of Heroes** (Sacred Terminal 2):
```bash
cd 5_a2a_integration/agents/character_agent
python character_agent.py
```

**👑 Ascend the Master's Throne** (Sacred Terminal 3):
```bash
cd 5_a2a_integration/agents/gamemaster_orchestrator
python gamemaster_orchestrator.py
```

### 🎭 Epic Adventure Testing:

Channel your requests through the mystical `test/test.http` scroll or use these incantations:

```bash
# 📚 Consult the Ancient Wisdom
curl -X POST http://0.0.0.0:8009/inquire \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the rules for dexterity checks?"}'

# ⚔️ Forge a New Hero
curl -X POST http://0.0.0.0:8009/inquire \
  -H "Content-Type: application/json" \
  -d '{"question": "Create a character named Thorin, a Dwarf Fighter with strength 16, dexterity 12, constitution 15"}'

# 🔍 Seek Hero Knowledge
curl -X POST http://0.0.0.0:8009/inquire \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Thorin'\''s constitution?"}'

# 🎲 Call Upon the Dice Oracle
curl -X POST http://0.0.0.0:8009/inquire \
  -H "Content-Type: application/json" \
  -d '{"question": "Roll a d20 for initiative!"}'
```

**🎲 Watch the Magic Unfold:**
1. The Grand Orchestrator receives your quest
2. Automatically discovers and consults the appropriate fellowship members
3. The Sage provides ancient rule wisdom
4. The Chronicler manages heroic destinies
5. All responses are woven into epic narratives!

## 🎯 Learning Objectives

By completing this chapter, you'll understand:

- **Multi-Agent Architecture**: How to design systems with specialized agents
- **A2A Communication**: Agent-to-agent messaging and discovery
- **Service Orchestration**: Coordinating multiple services
- **Knowledge Base Integration**: Using vector databases for information retrieval
- **MCP Protocol**: Integrating external tools and services
- **Distributed Systems**: Building resilient, scalable agent networks

## 🏆 Bonus Challenges

1. **Add New Agents**: Create a Combat Agent for battle mechanics
2. **Enhance Discovery**: Implement dynamic agent discovery
3. **Add Persistence**: Store game sessions and character progression
4. **Create Adventures**: Build multi-step quest workflows
5. **Add Authentication**: Secure your API endpoints

## 🔧 Troubleshooting

### Common Issues:

1. **Port Already in Use**: Kill existing processes with `lsof -ti:8000 | xargs kill -9`
2. **Model Not Found**: Check your `.env` file and model availability
3. **A2A Connection Failed**: Ensure all agents are running on correct ports
4. **Knowledge Base Error**: The ChromaDB is pre-built in `utils/dnd_knowledge_base/`

### Debug Tips:

- Check agent logs for connection status
- Verify ports with `lsof -i :8000-8009`
- Test individual agents before running the orchestrator
- Use the health endpoints: `curl http://localhost:8009/health`

## 🎉 Congratulations!

You've built a complete multi-agent D&D system! This architecture pattern can be applied to many domains where you need specialized agents working together to solve complex problems.

Your system demonstrates key concepts in distributed AI systems, microservices architecture, and agent orchestration that are essential for building production-scale AI applications.

Ready for your next adventure? Check out the advanced patterns in the solutions folder! 🚀