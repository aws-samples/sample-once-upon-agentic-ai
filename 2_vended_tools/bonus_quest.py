import logging
import os
from strands import Agent
#TODO: import shell, file_editor
from strands.vended_tools import shell, file_editor
#TODO: import HumanInTheLoop
from strands.vended_interventions.hitl import HumanInTheLoop

#TODO: Enable Strands debug log level
logging.getLogger("strands").setLevel(logging.DEBUG)

# Set the logging format and stream logs to stderr
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# Your magical creation here
arcane_scribe = Agent(
    #TODO: add the tools
    tools=[shell, file_editor],
    #TODO: ask for your approval before each tool call
    interventions=[HumanInTheLoop(ask="stdio")],
    system_prompt=f"""You are Kiro the Grey Hat, a wizard who specializes in the ancient art of code magic.
    When asked to create spells (code), you inscribe them on parchment (files) in the directory {os.getcwd()}
    and then cast them to demonstrate their power."""
)

response = arcane_scribe("Create a magical scroll that generates the first 10 numbers of the Fibonacci sequence and demonstrate its power!")
