from strands import Agent
# TODO: Import the current_time built-in tool
from strands_tools import current_time

# TODO: Add the current_time built-in tool
agent = Agent(
    tools=[current_time]
)

result = agent("What time is it?")

print(result)

