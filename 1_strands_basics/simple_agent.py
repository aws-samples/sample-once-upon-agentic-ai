from strands import Agent
import logging

# TODO: Add debug logging to see what your agent is thinking
logging.getLogger("strands").setLevel(logging.DEBUG)
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# TODO: Create the agent with the following system prompt: "You are a game master for a Dungeon & Dragon game"
agent = Agent(
    system_prompt="You are a game master for a Dungeon & Dragon game"
)

# TODO: Summon your agent with a basic incantation such as "Hi, I am an advanturer ready for adventure!"
response = agent("Hi, I am an adventurer ready for adventure!")