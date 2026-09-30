import logging
import os
from strands import Agent
# TODO: Step 1 - Import shell and file_editor from strands.vended_tools
# TODO: Step 2 - Import HumanInTheLoop from strands.vended_interventions.hitl

logging.getLogger("strands").setLevel(logging.DEBUG)

logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

arcane_scribe = Agent(
    # TODO: Step 1 - Add the shell and file_editor tools to your agent
    # TODO: Step 2 - Ask for your approval before each tool call with HumanInTheLoop
    system_prompt=f"""You are Kiro the Grey Hat, a wizard who specializes in the ancient art of code magic.
    When asked to create spells (code), you inscribe them on parchment (files) in the directory {os.getcwd()}
    and then cast them to demonstrate their power."""
)

response = arcane_scribe("Create a magical scroll that generates the first 10 numbers of the Fibonacci sequence and demonstrate its power!")
