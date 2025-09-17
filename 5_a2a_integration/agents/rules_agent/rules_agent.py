import os
import chromadb
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer


class RulesKnowledgeBase:
    """Fast knowledge base interface"""
    
    def __init__(self):
        # Use the shared KB at the chapter root level
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up to chapter root: rules_agent -> agents -> 5_a2a_integration
        chapter_root = os.path.dirname(os.path.dirname(current_dir))
        self.db_path = os.path.join(chapter_root, "utils", "dnd_knowledge_base")
        self._client = None
        self._collection = None
        print(f"KB path: {self.db_path}")
    
    def _get_collection(self):
        if self._collection is None:
            try:
                print(f"Attempting to connect to ChromaDB at: {self.db_path}")
                print(f"Path exists: {os.path.exists(self.db_path)}")
                self._client = chromadb.PersistentClient(path=self.db_path)
                print("ChromaDB client created successfully")
                
                # List available collections
                collections = self._client.list_collections()
                print(f"Available collections: {[c.name for c in collections]}")
                
                self._collection = self._client.get_collection("dnd_basic_rules")
                print("Collection 'dnd_basic_rules' found successfully")
            except Exception as e:
                print(f"Error connecting to KB: {e}")
                return None
        return self._collection
    
    def quick_query(self, query: str) -> str:
        """Fast query with minimal processing"""
        print(f"Querying KB with: {query}")
        collection = self._get_collection()
        if not collection:
            print("Collection is None - KB unavailable")
            return "KB unavailable"
        
        try:
            results = collection.query(query_texts=[query], n_results=1)
            if results['documents'][0]:
                doc = results['documents'][0][0]
                page = results['metadatas'][0][0].get('page', '?')
                # Very short response
                return f"Page {page}: {doc[:100]}..."
            return "No rules found"
        except:
            return "KB error"

rules_kb = RulesKnowledgeBase()

@tool
def query_dnd_rules(query: str) -> str:
    """Fast D&D rule lookup. Returns brief rule with page reference."""
    return rules_kb.quick_query(query)

DESCRIPTION="""
Specialized D&D 5e rules lookup agent that provides fast, authoritative rule clarifications from the Basic Rules. 
Queries the ChromaDB knowledge base containing indexed D&D content and returns brief, page-referenced rule explanations. 
Designed for quick consultation by other agents or players during gameplay.
"""

SYSTEM_PROMPT="""
You are a D&D rules expert. When asked about rules, use the query_dnd_rules tool once to find the relevant rule, 
then provide a clear, concise answer with the page reference. Keep responses brief and focused on the specific rule requested.
"""

agent = Agent(
    # TODO: Configure the agent with:
    tools=[query_dnd_rules],
    name="Rules Agent", 
    description= DESCRIPTION,
    system_prompt= SYSTEM_PROMPT
)

# TODO: Create an A2AServer instance with:
# - agent: The agent instance created above
# - port: 8000 (Rules Agent port)
a2a_server = A2AServer(agent=agent, port=8000)

if __name__ == "__main__":
    # TODO: Start the A2A server
    a2a_server.serve()
