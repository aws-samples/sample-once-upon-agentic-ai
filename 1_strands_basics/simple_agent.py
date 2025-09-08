import logging
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands.models.openai import OpenAIModel
from strands.models.anthropic import AnthropicModel

# Enable Strands debug log level
logging.getLogger("strands").setLevel(logging.DEBUG)

# Set the logging format and stream logs to stderr
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# Create a BedrockModel, AnthropicModel or OllamaModel object and configure the model
# model = BedrockModel(model_id="us.amazon.nova-premier-v1:0")
# model = OpenAIModel(model_id="gpt-4o")
# model = AnthropicModel(model_id="claude-sonnet-4-20250514")

# Create the agent with the following system prompt: "You are a game master for a Dungeon & Dragon game"
agent = Agent(
    # model=model,
    system_prompt="You are a game master for a Dungeon & Dragon game"
)

# Call your agent with a basic prompt such as "Hi, I am an adventurer ready for adventure!"
response = agent("Hi, I am an adventurer ready for adventure!")
print(response)