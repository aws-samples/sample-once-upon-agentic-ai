from strands import Agent, tool
# TODO: Step 1 - Import tool from strands

# TODO: Step 1 - Add the decorator to transform your function into a tool
@tool
def roll_dice(faces: int = 6) -> int:
    # TODO: Step 2 - Write a docstring with the description, an Args section and the return value
    """Roll one die with a given number of faces and return the result.

    Use it every time the game needs a random roll: ability scores, attack rolls,
    saving throws, damage. Call it once per die; for "4d6 drop lowest", call it
    four times with faces=6 and discard the lowest result yourself.

    Example response: 14

    Notes:
        - One die per call: there is no count parameter.
        - Each roll is independent and uniformly random.

    Args:
        faces: Number of faces on the die, 1 or more. Use 20 for a d20, 6 for a d6,
            100 for a percentile die. Defaults to 6.

    Returns:
        An integer between 1 and faces, inclusive.
    """

    import random

    if faces < 1:
        raise ValueError("Dice must have at least 1 face")

    return random.randint(1, faces)


print(roll_dice.tool_spec)  # what Strands tells the model about your tool

dice_master = Agent(
    # TODO: Step 3 - Add the tool to the agent
    tools=[roll_dice],
    system_prompt="""You are Lady Luck, the mystical keeper of dice and fortune in D&D adventures.
    You speak with theatrical flair and always announce dice rolls with appropriate drama.
    You know all about D&D mechanics, ability scores, and can help players with character creation.
    When rolling ability scores, remember the traditional method: roll 4d6, drop the lowest die."""
)

dice_master("Help me create a new D&D character! Roll the strength, wisdom, charisma and intelligence abilities scores using 4d6 drop lowest method.")

