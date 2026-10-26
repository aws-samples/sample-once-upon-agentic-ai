# Chapter 3: Forging Custom Tools

Vended tools cover common needs, but a Game Master needs dice. In Strands a custom tool is just a Python function with the `@tool` decorator and a good docstring.

## What you build

`agent_with_dice_roll_tool.py` turns a plain `roll_dice(faces)` function into a tool for Lady Luck, keeper of dice and fortune:

1. **The decorator**: `from strands import tool`, then `@tool` on `roll_dice`. Strands discovers the function and builds a specification from it.
2. **The docstring**: a first paragraph saying what the tool does, an `Args:` section describing `faces`, and a `Returns:` section.
3. **The agent**: `Agent(tools=[roll_dice], system_prompt="...")`. The agent can only use tools listed in `tools=[]`.

```python
@tool
def roll_dice(faces: int = 6) -> int:
    """Roll a single die and return the result.

    Args:
        faces: Number of faces on the die (e.g. 6 for a d6, 20 for a d20). Must be at least 1.

    Returns:
        An integer between 1 and faces (inclusive), the result of the roll.
    """
    ...
```

## Why the docstring matters

The model never reads your code. It only receives what Strands builds from the function name, the docstring and the typed parameters. The script prints that specification with `print(roll_dice.tool_spec)`:

| | Without a docstring | With the docstring |
|---|---|---|
| `description` | `roll_dice` (only the name) | the first paragraph of the docstring |
| `faces` description | `Parameter faces` | the `Args:` entry for `faces` |

With a name as explicit as `roll_dice` the model manages either way, but with a vaguer name or several parameters it would have nothing else to go on, so make the docstring a habit.

## Run it

```bash
cd 3_custom_tools
python agent_with_dice_roll_tool.py
```

The script asks Lady Luck to roll strength, wisdom, charisma and intelligence with the 4d6-drop-lowest method: four six-sided dice per ability, keep the three highest. That is always **16 rolls** (4 abilities × 4 dice), and every one must go through your tool. Check the log for 16 `roll_dice` calls and that each ability total drops its lowest die.

## Example output

The printed specification, with the docstring in place:

```
{'name': 'roll_dice', 'description': 'Roll a single die and return the result.\n\nUse this tool every time a die must be rolled. It rolls one die per call,\nso call it once for each die needed (e.g. four times for 4d6).\n\nReturns:\n    An integer between 1 and faces (inclusive), the result of the roll.', 'inputSchema': {'json': {'properties': {'faces': {'default': 6, 'description': 'Number of faces on the die (e.g. 6 for a d6, 20 for a d20). Must be at least 1.', 'type': 'integer'}}, 'type': 'object'}}}
```

Then Lady Luck makes 16 `roll_dice` calls (`Tool #1: roll_dice` ... `Tool #16: roll_dice`) and reports:

| Ability | Dice Rolled | Dropped | Final Score | Modifier |
|---|---|---|---|---|
| Strength | 2, 3, 4, 3 | 2 | 10 | +0 |
| Wisdom | 6, 2, 6, 3 | 2 | 15 | +2 |
| Charisma | 5, 4, 6, 2 | 2 | 15 | +2 |
| Intelligence | 3, 3, 6, 2 | 2 | 12 | +1 |

Your dice will differ, since every roll is random. The narration also varies from run to run.

Like the other chapters, it needs AWS credentials allowed to invoke the Bedrock model, see [Chapter 1](../1_strands_basics/).

Previous: [Chapter 2](../2_vended_tools/).
