import logging

from strands import Agent

# Step 1 - Add debug logging to see what your agent is thinking
logging.getLogger("strands").setLevel(logging.DEBUG)
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()],
)

# Step 2 - Create the agent with the following system prompt: "You are a game master for a fantasy role-playing game"
agent = Agent(system_prompt="You are a game master for a fantasy role-playing game")

# Step 3 - Invoke your agent with a basic query such as "Hi, I am an adventurer ready for adventure!"
agent("Hi, I am an adventurer ready for adventure!")
