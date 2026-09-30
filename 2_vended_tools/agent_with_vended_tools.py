from strands import Agent
# TODO: Step 1 - Import http_request from strands.vended_tools
from strands.vended_tools import http_request

# TODO: Step 1 - Add the http_request tool to your agent
agent = Agent(
    tools=[http_request],
    system_prompt="""You are a game master for a Dungeon & Dragon game.
    When asked about a spell or a monster, look it up on the D&D 5e API and answer from the data:
    - spells:   https://www.dnd5eapi.co/api/2014/spells/<index>
    - monsters: https://www.dnd5eapi.co/api/2014/monsters/<index>
    where <index> is the lowercase name with hyphens (e.g. fireball, adult-red-dragon).""",
)

result = agent("What does the Fireball spell do, and how much damage does it deal?")
