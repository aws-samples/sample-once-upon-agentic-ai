import os
import boto3
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer, StrandsA2AExecutor
from bedrock_agentcore.runtime import serve_a2a

# Set in agentcore.json (envVars), from the knowledge base id printed by agentcore status
KNOWLEDGE_BASE_ID = os.environ["KNOWLEDGE_BASE_RULES_ID"]
knowledge_base = boto3.client("bedrock-agent-runtime")

@tool
def query_rules(query: str) -> str:
    """Look up a rule in the Basic Rules knowledge base.

    Use it for any question about game mechanics: ability checks, combat,
    spellcasting, conditions, resting. Ask in plain English, as a player would.
    The lookup is a semantic search over the Basic Rules PDF: the three
    passages closest to the question come back, each with its page number.

    Example response:
        "[Page 74] When a hostile creature that you can see moves out of your reach, ...

        [Page 73] ..."

    Notes:
        - The answer is usually in the first passage.
        - Returns nothing until the ingestion of the knowledge base is complete.

    Args:
        query: The rules question or topic, in plain English, e.g. "opportunity attack"
            or "what are the rules for dexterity checks".

    Returns:
        The matching passages, each prefixed with its page reference, separated by blank lines.
    """
    # TODO: Step 1 - Retrieve the 3 passages closest to the query from the knowledge base and prefix each one with its page number

def create_agent(context_id: str) -> Agent:
    return Agent(
        tools=[query_rules],
        name="Rules Agent",
        description="Rules lookup: fast, page-referenced answers from the Basic Rules knowledge base.",
        system_prompt="""You are a rules expert for a fantasy role-playing game. For each rules question, call query_rules once, then answer briefly with the page reference.""",
        callback_handler=None,
    )

if __name__ == "__main__":
    # TODO: Step 2 - Serve the create_agent factory with serve_a2a on all interfaces, with the agent card of an A2AServer built on the same factory
    pass
