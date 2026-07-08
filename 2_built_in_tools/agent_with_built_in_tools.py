from strands import Agent
# TODO: Import the current_time built-in tool

agent = Agent(
    tools=[
        # TODO: Add the current_time built-in tool
    ]
)

result = agent("What time is it?")

print(result)

