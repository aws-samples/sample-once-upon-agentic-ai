from strands import Agent
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

SYSTEM_PROMPT = """You are an epic D&D Game Master running a live adventure.
You narrate with theatrical flair, describe vivid scenes, and keep the story moving.
You don't have your dice with you yet — when an outcome would normally require a
roll, describe the tension and resolve it narratively instead of inventing numbers.
Keep responses short and punchy — this is a live game, not a novel."""

# One module-level Agent is safe here: AgentCore Runtime isolates each session
# in its own microVM, so no conversation history can leak between players.
# Within a session, history persists across invocations — the adventure continues!
gamemaster = Agent(
    system_prompt=SYSTEM_PROMPT,
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
