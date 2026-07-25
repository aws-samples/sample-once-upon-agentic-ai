import random

from strands import Agent, tool
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()


# TODO: Add the decorator to transform your function into a tool
@tool
def roll_dice(faces: int = 20) -> int:
    """
    🎲 Roll a dice with a specified number of faces.

    Args:
        faces: Number of faces on the dice (default: 20)

    Returns:
        Random integer between 1 and faces (inclusive)
    """
    if faces < 1:
        raise ValueError("Dice must have at least 1 face")

    return random.randint(1, faces)


SYSTEM_PROMPT = """You are an epic D&D Game Master running a live adventure.
You narrate with theatrical flair, describe vivid scenes, and keep the story moving.
Whenever fate must decide an outcome (attacks, saving throws, skill checks),
use the roll_dice tool with the appropriate dice (d20 for checks, d6/d8 for damage...)
and weave the result into the narration.
Keep responses short and punchy — this is a live game, not a novel."""

# One module-level Agent is safe here: AgentCore Runtime isolates each session
# in its own microVM, so no conversation history can leak between players.
# Within a session, history persists across invocations — the adventure continues!
gamemaster = Agent(
    system_prompt=SYSTEM_PROMPT,
    tools=[roll_dice],
)


# TODO: Add the decorator that registers this function as the AgentCore entrypoint
@app.entrypoint
async def invoke(payload, context):
    """Handle one invocation of the deployed gamemaster."""
    prompt = payload.get("prompt", "Greet the adventurer and set the scene.")
    result = await gamemaster.invoke_async(prompt)
    return {"result": str(result)}


if __name__ == "__main__":
    app.run()
