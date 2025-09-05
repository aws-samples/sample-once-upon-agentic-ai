from strands import Agent
# Import the http_request built-in tool
from strands_tools import http_request

# model = your_model_here

agent = Agent(
    # model=model,
    tools=[
        # Add the http_request built-in-tool
        http_request
    ]
)

agent("""
   Using the website https://en.wikipedia.org/wiki/Dungeons_%26_Dragons tell me the name of the designers of
   Dungeons and Dragons.
    """
)
