# Once Upon Agentic AI: A Developer's Epic Journey into the Strands SDK


![Header Image](images/home.png)

_"Roll for Initiative... in Python!"_

# ------> [LINK TO THE AWS WORKSHOP](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/0-pre-requisites)

Welcome, brave adventurer, to the ultimate Strands framework quest! This comprehensive workshop will transform you from a coding apprentice into a master of AI agent orchestration. Through five epic chapters, you'll learn to create, equip, and command digital companions that can think, act, and collaborate like a legendary adventuring party. Follow the instructions in the following [workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/e1493217-4bc7-42f4-87d9-e231acd743bc/en-US/0-pre-requisites).

## ✅ Prerequisites (AWS access and model access)

The agents in this workshop call a model through **Amazon Bedrock**, so you need AWS access set up
before Chapter 1.

1. **An AWS account** and credentials configured for the CLI/SDK. Verify with:
   ```bash
   aws sts get-caller-identity
   ```
2. **A region** with Bedrock model availability (the examples use `us-east-1`):
   ```bash
   export AWS_REGION=us-east-1
   ```
3. **Model access.** The Strands SDK's default Bedrock model is an **Anthropic Claude** model. Anthropic
   requires a one-time **"use case details" form** per account before Claude can be invoked. Until it is
   submitted you will see:
   ```
   ResourceNotFoundException: Model use case details have not been submitted for this account.
   ```
   In the Bedrock console: **Model access / Model catalog, select an Anthropic model, submit the use
   case form**. Access is granted immediately.

### Running without Anthropic (or on an account without Claude enabled)

You do **not** have to change any chapter code to use a different model. The chapters do not hardcode a
model; they use the SDK default. To use, for example, **Amazon Nova** (which needs no use-case form),
pass a model to each `Agent(...)`:

```python
from strands.models import BedrockModel
agent = Agent(
    model=BedrockModel(model_id="us.amazon.nova-lite-v1:0", region_name="us-east-1"),
    system_prompt="...",
)
```

That single argument is the only change; agent logic and every chapter work identically. `BEDROCK_MODEL_ID`
in `.env.example` documents this. Strands also supports Anthropic API, OpenAI, and Ollama models.

### Tested with

These exact versions were verified working end to end (all five chapters):
Python 3.13.5, `strands-agents` 1.55.0, `strands-agents-tools` 0.8.8, `mcp` 1.30.0, `chromadb` 1.5.9,
`onnxruntime` 1.23.2.

## 🛠️ Setup

Dependencies are declared in `pyproject.toml` — that's the single source of truth for both `uv` and plain `pip`.

**Using [uv](https://docs.astral.sh/uv/) (recommended):**

```bash
uv sync
```

Prefix workshop commands with `uv run`, e.g. `uv run python 1_strands_basics/simple_agent.py`.

**Using pip:**

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install .
```

The workshop deliberately does not pin exact versions (no `uv.lock`, no `requirements.txt`), so both commands install against the latest compatible releases of the Strands SDK. If a chapter breaks against a newer release, please open an issue.

## 🌐 ️ The Complete Adventure Map

Your journey through the realms of AI agents is carefully structured as a progressive quest. **Each chapter builds upon the previous one** - complete them in order to unlock the full power of Strands!

### 🐉 [Chapter 0: An Unexpected Adventure](0_pre_requisites/)
**Complete the prerequisites before going on an adventure!**

### 🧙‍♂️ [Chapter 1: The Art of Agent Summoning](1_strands_basics/)
**Master the fundamental ritual of agent creation**
- Learn what Strands is and how it works
- Summon your first AI companion
- Configure models and system prompts
- Understand the core concepts of agent development

### ⚔️ [Chapter 2: The Adventurer's Arsenal](2_built_in_tools/)
**Equip your agents with built-in magical tools**
- Discover Strands' powerful built-in tool library
- Learn how agents autonomously choose and use tools
- Master web scraping and information gathering
- Understand tool consent and safety mechanisms

### 🔨 [Chapter 3: The Art of Magical Forging](3_custom_tools/)
**Forge your own custom tools and enchantments**
- Transform Python functions into agent tools
- Create the legendary Dice of Destiny
- Master the `@tool` decorator and documentation
- Build domain-specific capabilities

### 🌐 [Chapter 4: Planar Portals - MCP Integration](4_mcp_integration/)
**Connect to external realms through Model Context Protocol**
- Build and deploy MCP servers
- Create MCP clients for agent integration
- Understand distributed tool architectures
- Master external service connections

### 🏰 [Chapter 5: The Grand Alliance - A2A Mastery](5_a2a_integration/)
**Command multiple agents in perfect harmony**
- Build a complete multi-agent D&D system
- Master Agent-to-Agent (A2A) communication
- Orchestrate specialized agents working together
- Create complex distributed AI applications

### 🎲 The Adventure Never Ends...

Remember, the most epic adventures are the ones you create yourself. Whether you're building the next great AI application or just exploring the boundaries of what's possible, you now have the tools and knowledge to make it happen.

_May your agents be wise, your tools be sharp, and your code compile on the first try!_ 🎲✨

---

**"The best way to predict the future is to build the agents that will create it."** - Modern Developer Wisdom

_Happy coding, Agent Master! 🐉⚔️🧙‍♂️_
