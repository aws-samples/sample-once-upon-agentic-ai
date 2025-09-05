# ⚔️ Chapter 2: The Adventurer's Arsenal - Wielding Built-in Tools

![Header Image](../images/header4.jpeg)

_"A wise adventurer never ventures forth without proper equipment..."_

Welcome to the armory, brave coder! In this chapter, you'll learn to equip your AI agents with powerful built-in magical implements. Just as no adventurer would face a dragon empty-handed, no agent should tackle complex quests without the right tools.

## 🎯 Quest Objective

Transform your basic agent into a web-savvy information gatherer by mastering the `http_request` tool. You'll complete the `agent_with_built_in_tools.py` file to create an agent capable of fetching and analyzing web content.

## 🏺 The Ancient Arsenal: Built-in Tools

Strands comes pre-enchanted with legendary artifacts, ready for immediate use. Here are some examples:

- **🌐 `http_request`**: A mystical web-weaver that can fetch content from distant realms
- **⏰ `current_time`**: A chronometer revealing the current date and time
- **🧮 `calculator`**: An enchanted abacus for mathematical sorcery
- **📁 `file_read`/`file_write`**: Magical scrolls for reading and inscribing parchments
- **🐍 `python_repl`**: A code execution chamber for casting Python spells
- **🌐 `browser`**: An automated web navigator for complex interactions

[View the complete arsenal in the documentation →](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/community-tools-package/)

## 📜 The Sacred Steps

Your quest involves two essential enchantments:

### Step 1: Summon the Web-Weaver 🌐
**TODO**: Import the `http_request` built-in tool

The `http_request` tool is your gateway to the vast information networks of the digital realm. It can fetch web pages, call APIs, and retrieve data from distant servers.

```python
# Import the mystical web-weaver
from strands_tools import http_request
```

### Step 2: Arm Your Agent 🗡️
**TODO**: Add the `http_request` tool to your agent's arsenal

Equip your agent with the web-weaver so it can venture beyond its initial knowledge and fetch fresh information from the internet.

```python
agent = Agent(
    tools=[
        http_request  # Grant your agent the power of web access
    ]
)
```

## 🎲 The Challenge: The Creators of D&D

Your agent will be tasked with a specific quest: discovering the legendary creators of Dungeons & Dragons from the vast archives of Wikipedia. The agent must:

1. **Navigate** to the D&D Wikipedia page: `https://en.wikipedia.org/wiki/Dungeons_%26_Dragons`
2. **Parse** the HTML content to find relevant information
3. **Extract** the names of the original designers and creators
4. **Report** back with the historical findings

This quest tests your agent's ability to:
- Use tools autonomously
- Process web content intelligently  
- Extract specific information from unstructured data
- Navigate gaming history and lore

## 🔧 Testing Your Enhanced Agent

Once you've completed both TODOs, run your script:

```bash
python agent_with_built_in_tools.py
```

Watch as your agent:
1. Receives the quest about D&D's creators
2. Automatically decides to use the `http_request` tool
3. Fetches the Wikipedia page content
4. Analyzes the HTML to find historical information
5. Reports the names of D&D's legendary designers back to you

## 🌟 Bonus Quest: The Arcane Codex Challenge

Ready for a more advanced adventure? Try this legendary challenge (code provided in comments):

**The Fibonacci Scroll Quest**: Create an agent equipped with `python_repl` and `file_write` tools that can:
1. Generate a magical scroll (Python file) containing Fibonacci sequence code
2. Execute the spell to demonstrate its power
3. Create visual representations of mathematical beauty

**⚠️ Important: Enable Debug Logs for Interactive Tools!**

Before attempting this bonus quest, you **must** enable debug logging to see the tool consent prompts. The `python_repl` and `file_write` tools will ask for your permission before executing, and you need to see these prompts in your terminal to accept them.

Add this magical incantation at the beginning of your script:

```python
import logging
from strands import Agent
from strands_tools import python_repl, file_write

# Enable debug logs to see tool consent prompts
logging.getLogger("strands").setLevel(logging.DEBUG)
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

arcane_scribe = Agent(
    tools=[python_repl, file_write],
    system_prompt="You are Kiro the Grey Hat, a wizard who specializes in the ancient art of code magic."
)

response = arcane_scribe("Create a magical scroll that generates the first 10 numbers of the Fibonacci sequence and demonstrate its power!")
```

**What you'll see**: When the agent tries to create files or run code, you'll see prompts like:
```
DEBUG | strands.tools | Tool 'file_write' requires consent. Do you want to allow this action? (y/n):
```

Simply type `y` and press Enter to allow the tool to proceed with its magical work!

## 🛡️ Safety Enchantments

**Tool Consent Prompts**: By default, certain powerful tools (like `file_write` and `python_repl`) will ask for your permission before executing. This protective ward ensures you maintain control over potentially system-altering actions.

**Bypass for Testing** (use with caution):
```bash
export BYPASS_TOOL_CONSENT=true
```

## 🚨 Troubleshooting Common Arsenal Issues

**"Tool not found" Error**:
- Verify the import: `from strands_tools import http_request`
- Check Strands installation: `pip install strands-agents-tools`

**"Network Error" when fetching web content**:
- Check your internet connection
- Some websites may block automated requests
- Try a different URL to test the tool

**Agent doesn't use the tool**:
- Ensure the tool is in the `tools=[]` list
- Make your request specific enough to trigger tool usage
- Check that your system prompt doesn't discourage tool use

## 🎉 Quest Complete!

Congratulations, Tool Master! You've successfully armed your agent with the power of web access. Your digital companion can now venture beyond its training data to fetch real-time information from the vast digital realm.

**What you've mastered:**
- ✅ Importing and configuring built-in tools
- ✅ Understanding how agents autonomously choose when to use tools
- ✅ Web content fetching and information extraction
- ✅ The balance between agent autonomy and user control

**Loot Acquired:**
- 🌐 Web-scraping capabilities
- 📊 Real-time information access
- 🔧 Foundation for more complex tool combinations

**Next Adventure**: Journey to Chapter 3 where you'll forge your own custom magical implements and create the legendary Dice Rolling tool for epic D&D adventures!

---

_"Give an agent a fact, and they know it for a moment. Give an agent a tool, and they can discover facts for a lifetime!"_ ⚔️✨