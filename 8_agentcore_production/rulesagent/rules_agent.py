import os
import boto3
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer, StrandsA2AExecutor
from bedrock_agentcore.runtime import serve_a2a

# Set in agentcore.json (envVars), from the knowledge base id printed by agentcore status
KNOWLEDGE_BASE_ID = os.environ["KNOWLEDGE_BASE_RULES_ID"]
knowledge_base = boto3.client("bedrock-agent-runtime")

@tool
def query_dnd_rules(query: str) -> str:
    """Look up a D&D 5e rule in the Basic Rules knowledge base.

    Use it for any question about game mechanics: ability checks, combat,
    spellcasting, conditions, resting. Ask in plain English, as a player would.
    The lookup is a semantic search over the D&D Basic Rules PDF: the three
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
    results = knowledge_base.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={"managedSearchConfiguration": {"numberOfResults": 3}},
    )["retrievalResults"]
    return "\n\n".join(
        f"[Page {int(result['metadata']['_excerpt_page_number'])}] {result['content']['text']}"
        for result in results
    )

def create_agent(context_id: str) -> Agent:
    return Agent(
        tools=[query_dnd_rules],
        name="Rules Agent",
        description="D&D 5e rules lookup: fast, page-referenced answers from the Basic Rules knowledge base.",
        system_prompt="""You are a D&D 5e rules expert. For each rules question, call query_dnd_rules once, then answer briefly with the page reference.""",
        callback_handler=None,
    )

if __name__ == "__main__":
    # TODO: Step 2 - Serve the create_agent factory with serve_a2a on all interfaces, with the agent card of an A2AServer built on the same factory
    serve_a2a(
        StrandsA2AExecutor(agent_factory=create_agent, enable_a2a_compliant_streaming=True),
        agent_card=A2AServer(agent_factory=create_agent).public_agent_card,
        host="0.0.0.0",
    )
