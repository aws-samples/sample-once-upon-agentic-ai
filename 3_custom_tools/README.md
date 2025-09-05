# 🔨 Chapter 3: The Art of Magical Forging - Creating Custom Tools

![Header Image](../images/header4.jpeg)

_"Every great adventurer forges their own weapons..."_

Welcome to the mystical forge, brave artisan! In this chapter, you'll learn the ancient art of creating your own magical tools. While built-in artifacts are powerful, true masters forge their own enchantments for specific quests.

## 🎯 Quest Objective

Master the art of custom tool creation by forging the legendary **Dice of Destiny** - an essential tool for any self-respecting Dungeon Master. You'll transform a simple Python function into a magical tool that your agent can invoke.

## 🔮 The Philosophy of Custom Tools

In Strands, a custom tool is nothing more than a Python function blessed with special enchantments:

- **🎭 The `@tool` Decorator**: The magical rune that transforms an ordinary function into an agent tool
- **📜 The Sacred Docstring**: The description that guides the agent on when and how to use the tool
- **⚡ Business Logic**: Your specialized code that accomplishes unique tasks

## 📜 The Sacred Steps

Your quest involves two essential enchantments:

### Step 1: Invoke the Transformation Rune 🪄
**TODO**: Add the decorator to transform your function into a tool

The `@tool` decorator is the incantation that transforms an ordinary Python function into a tool that your agent can automatically discover and use.

**Important**: You must first import `tool` from `strands`:

```python
from strands import Agent, tool  # Add 'tool' to the existing import

@tool  # This magical rune transforms the function into an agent tool
def roll_dice(faces: int = 6) -> int:
    # Your magical logic here
```

**Why does this magic work?**
- The agent can automatically discover all available tools
- It understands parameters and return types
- It intelligently decides when to use each tool

### Step 2: Write the Documentation Grimoire 📚
**TODO**: Modify the docstring with information about arguments and return value

The docstring isn't just simple documentation - it's the instruction manual that your agent uses to understand the tool. A good docstring guides the agent on:

- **What** the tool does
- **When** to use it
- **How** to use it correctly

```python
@tool
def roll_dice(faces: int = 6) -> int:
    """
    🎲 Roll a dice with a specified number of faces.
    
    Args:
        faces: Number of faces on the dice (default: 6)
        
    Returns:
        Random integer between 1 and faces (inclusive)
    """
```

**Essential Elements of a Tool Docstring:**
- **Clear description**: What exactly does the tool do?
- **Args section**: Parameters with descriptions and default values
- **Returns section**: What the tool returns
- **Examples** (optional): Typical use cases

**Tips:** LLMs are generally really good at creating docstrings for agents. Try different iterations to see what fits best for your use case.

## 🎲 The Challenge: Lady Luck and Ability Scores

Your agent **Lady Luck** will be challenged with a complex D&D character creation quest:

**The Quest**: "Help me create a new D&D character! Roll the strength, wisdom, charisma and intelligence abilities scores using 4d6 drop lowest method."

**What your agent must accomplish:**
1. **Understand** the traditional 4d6 drop lowest method
2. **Use** the `roll_dice` tool repeatedly and intelligently
3. **Calculate** final scores for each ability
4. **Present** results with theatrical flair

**Why is this challenge perfect?**
- It tests repeated tool usage
- It requires complex logic (4d6, keep the best 3)
- It combines domain knowledge (D&D) with tool usage
- It showcases the agent's personality (Lady Luck's theatrical flair)

## 🔧 Testing Your Creation

Once both TODOs are completed, run your script:

```bash
python agent_with_dice_roll_tool.py
```

Watch Lady Luck in action:
1. **Analyze** the character creation request
2. **Plan** necessary rolls (4 abilities × 4d6 each)
3. **Execute** dice rolls with your custom tool
4. **Calculate** final scores (keep the best 3 dice)
5. **Present** results with theatrical drama

## 🌟 Advanced Tool Forging Concepts

### Supported Parameter Types
```python
@tool
def advanced_spell(
    text: str,           # Strings
    count: int,          # Integers
    ratio: float,        # Decimal numbers
    active: bool,        # Booleans
    items: list[str],    # Lists
    config: dict         # Dictionaries
) -> dict:
    """Advanced tool with different parameter types."""
```

### Elegant Error Handling
```python
@tool
def safe_dice_roll(faces: int) -> dict:
    """Tool with robust error handling."""
    try:
        if faces < 1:
            return {"error": "Dice must have at least 1 face"}
        
        result = random.randint(1, faces)
        return {"success": True, "result": result}
    
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
```

## 🚨 Troubleshooting Forging Failures

**"NameError: name 'tool' is not defined"**:
- Check the import: `from strands import tool`
- Make sure the decorator is `@tool`

**Agent doesn't use the tool**:
- Verify the tool is in the `tools=[]` list
- Improve the docstring to be more descriptive
- Test with a more explicit request

**Errors during tool execution**:
- Add robust error handling
- Check parameter types
- Test the function independently of the agent

## 🎉 Quest Complete!

Congratulations, Master Forger! You've mastered the ancient art of custom tool creation. Your agent can now use unique capabilities that you've forged specifically for your adventures.

**What you've mastered:**
- ✅ Transforming Python functions into agent tools
- ✅ Writing effective docstrings to guide agents
- ✅ Creating specialized tools for specific domains
- ✅ Integrating custom tools into complex workflows

**Loot Acquired:**
- 🎲 The legendary Dice of Destiny
- 🔨 Custom tool forging skills
- 🎭 An agent with theatrical personality
- 📊 D&D character creation capabilities

**Next Adventure**: Head to Chapter 4 where you'll discover the planar portals of the Model Context Protocol (MCP) and learn to connect your agents to distant realms!

---

_"A tool forged with care is worth a thousand artifacts found by chance!"_ 🔨✨