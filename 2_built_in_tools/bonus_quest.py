import logging
from strands import Agent
#TODO: import python_repl, file_write
from strands_tools import python_repl, file_write

#TODO: Enable Strands debug log level
logging.getLogger("strands").setLevel(logging.DEBUG)

# Set the logging format and stream logs to stderr
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# Your magical creation here
arcane_scribe = Agent(
    tools=[python_repl, file_write],
    system_prompt="""You are Kiro the Grey Hat, a wizard who specializes in the ancient art of code magic. 
    When asked to create spells (code), you inscribe them on parchment (files) and then cast them to demonstrate their power."""
)

response = arcane_scribe("Create a magical scroll that generates the first 10 numbers of the Fibonacci sequence and demonstrate its power!")
print(response)