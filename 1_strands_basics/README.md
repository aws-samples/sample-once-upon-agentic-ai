# 🧙‍♂️ Chapter 1: The Art of Agent Summoning

![Header Image](../images/header6.png)



Welcome to your first lesson in the mystical arts of Strands! In this foundational chapter, you'll learn to conjure your very first AI agent companion - a digital familiar that will serve as your guide through the realms of code.

## 🎯 Quest Objective

Master the fundamental ritual of agent creation by completing the `simple_agent.py` file. You'll transform empty TODO comments into a living, breathing AI companion ready for adventure!

## 📜 The Sacred Steps

Your quest involves three essential incantations:

### Step 1: Choose Your School of Magic 🔮
**TODO**: Create a model object (BedrockModel, AnthropicModel, or OllamaModel)

Just as wizards specialize in different schools of magic, AI agents draw their power from different model providers. Choose your preferred source of intelligence:

- **🏛️ [Amazon Bedrock](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/amazon-bedrock/)**: Enterprise-grade magic from the cloud realms
- **🤖 [Anthropic Claude](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/anthropic/)**: Conversational wisdom from the Claude lineage  
- **🤖 [OpenAI](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/openai/)**: Cutting-edge intelligence from the GPT realms

Note that by default, Strands will call Claude 3.7 on Amazon Bedrock.

**Example Incantations:**
```python
# For Bedrock power 
from strands.models.bedrock import BedrockModel
model = BedrockModel(model_id="us.amazon.nova-premier-v1:0")

# For OpenAI power
from strands.models.openai import OpenAIModel
model = OpenAIModel(model_id="gpt-4o")
```

### Step 2: Forge Your Digital Companion 🤖
**TODO**: Create an Agent with the system prompt: "You are a game master for a Dungeon & Dragon game"

The system prompt is your agent's character sheet - it defines their personality, knowledge, and behavior. Think of it as writing the backstory for your digital familiar.

```python
from strands import Agent

agent = Agent(
    model=your_chosen_model,
    system_prompt="You are a game master for a Dungeon & Dragon game"
)
```

### Step 3: Awaken Your Creation 🌟
**TODO**: Call your agent with: "Hi, I am an adventurer ready for adventure!"

Time to breathe life into your creation! This first interaction will test if your summoning ritual was successful.

```python
response = agent("Hi, I am an adventurer ready for adventure!")
print(response)
```

## 🎲 Testing Your Creation

Once you've completed all TODOs, run your script:

```bash
python simple_agent.py
```

If successful, your newly summoned Game Master should respond with enthusiasm, perhaps setting the scene for an epic D&D adventure!

## 🔧 Customization Spells (Optional Enchantments)

Want to make your agent more powerful? Try these advanced techniques:

**Temperature Control** (Creativity vs Consistency):
```python
model = BedrockModel(
    model_id="us.amazon.nova-premier-v1:0",
    temperature=0.7  # 0.0 = very consistent, 1.0 = very creative
)
```

**Custom Personality**:
```python
system_prompt = """You are Gandalf the Grey, a wise wizard who has become a Dungeon Master. 
You speak with ancient wisdom, occasionally referencing your adventures in Middle-earth, 
and you have a particular fondness for hobbits and their courage."""
```

## 🔍 Debug Logs - Seeing Behind the Magic

**TODO**: Add debug logging to see what your agent is thinking

Sometimes you need to peer behind the curtain to understand how your agent makes decisions. Debug logs reveal the agent's internal reasoning process, tool usage, and model interactions.

To enable debug logs in your agent, add this magical incantation at the beginning of your script:

```python
import logging

# Enable Strands debug log level
logging.getLogger("strands").setLevel(logging.DEBUG)

# Set the logging format and stream logs to stderr
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)
```

**What you'll see with debug logs:**
- 🧠 Agent reasoning and decision-making process
- 🔧 Tool selection and execution details
- 📊 Token usage and performance metrics
- 🔄 Model request and response cycles

**Example debug output:**
```
DEBUG | strands.agent | Starting agent execution with prompt: Hi, I am an adventurer ready for adventure!
DEBUG | strands.models.bedrock | Sending request to model: us.amazon.nova-premier-v1:0
DEBUG | strands.agent | Agent response generated in 1.2s
```

This visibility helps you understand your agent's behavior and optimize its performance!

## 🚨 Troubleshooting Common Summoning Failures

**"Model not found" Error**: 
- Check your model_id spelling
- Ensure you have proper credentials configured
- For Ollama, make sure the service is running locally

**"Import Error"**:
- Verify Strands is installed: `pip install strands-agents`
- Check your Python environment

**Agent doesn't respond**:
- Verify your model configuration
- Check network connectivity for cloud models
- Ensure Ollama is running for local models

## 🎉 Quest Complete!

Congratulations! You've successfully summoned your first AI agent. Your digital Game Master is now ready to guide players through epic adventures.

**What you've learned:**
- ✅ How to configure different model providers
- ✅ The importance of system prompts in shaping agent behavior  
- ✅ Basic agent creation and interaction patterns

**Next Adventure**: Head to Chapter 2 to learn about equipping your agent with magical tools and abilities!

---

_"A wizard is never late, nor is he early. He arrives precisely when he means to... just like a well-configured agent!"_ 🧙‍♂️✨