import os
import chromadb
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer

# The knowledge base built by utils/create_knowledge_base.py, shared by the whole chapter.
KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "utils", "dnd_knowledge_base")
_collection = None


def rules_collection():
    """Open the ChromaDB collection on first use (fails loudly if the knowledge base was not built)."""
    global _collection
    if _collection is None:
        _collection = chromadb.PersistentClient(path=KB_PATH).get_collection("dnd_basic_rules")
    return _collection


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
        - Passages are about 1,000 characters long; the answer is usually in the first one.
        - Fails if the knowledge base has not been built yet (see utils/create_knowledge_base.py).

    Args:
        query: The rules question or topic, in plain English, e.g. "opportunity attack"
            or "what are the rules for dexterity checks".

    Returns:
        The matching passages, each prefixed with its page reference, separated by blank lines.
    """
    results = rules_collection().query(query_texts=[query], n_results=3)
    return "\n\n".join(
        f"[Page {meta['page']}] {doc}"
        for doc, meta in zip(results["documents"][0], results["metadatas"][0])
    )

DESCRIPTION="""D&D 5e rules lookup: fast, page-referenced answers from the Basic Rules knowledge base."""

SYSTEM_PROMPT="""You are a D&D 5e rules expert. For each rules question, call query_dnd_rules once, then answer briefly with the page reference."""

def create_agent(context_id: str) -> Agent:
    # TODO: Step 1 - Configure the agent with:
    # - model: Optional
    # - tools: List containing the query_dnd_rules tool
    # - name: "Rules Agent"
    # - description: DESCRIPTION
    # - system_prompt: SYSTEM_PROMPT
    return Agent(
        tools=[query_dnd_rules],
        name="Rules Agent",
        description=DESCRIPTION,
        system_prompt=SYSTEM_PROMPT,
    )

# TODO: Step 2 - Create an A2AServer instance with:
# - agent_factory: The create_agent function defined above
# - port: 8000 (Rules Agent port)
a2a_server = A2AServer(agent_factory=create_agent, port=8000)

if __name__ == "__main__":
    # TODO: Step 3 - Start the A2A server
    a2a_server.serve()
