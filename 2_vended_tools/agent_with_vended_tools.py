from strands import Agent
# TODO: Step 1 - Import http_request from strands.vended_tools
from strands.vended_tools import http_request

# TODO: Step 1 - Add the http_request tool to your agent
agent = Agent(
    tools=[http_request],
    system_prompt="""You are a game master for a fantasy role-playing game.
    When asked about a spell or a monster, look it up on the Open5e API and answer from the data:
    - spells:   https://api.open5e.com/v2/spells/srd_<key>/
    - monsters: https://api.open5e.com/v2/creatures/srd_<key>/
    where <key> is the lowercase name with hyphens (e.g. fireball, adult-red-dragon).""",
)

result = agent("What does the Fireball spell do, and how much damage does it deal?")
