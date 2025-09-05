"""
Workshop utilities for A2A communication
Provides working A2A tools for educational purposes with Strands-compatible API
"""
import requests
import json
import uuid
from strands import tool

@tool
def a2a_send_message(message_text: str, target_agent_url: str) -> dict:
    """
    Send a message to a specific A2A agent.
    
    Args:
        message_text: The message content to send to the agent
        target_agent_url: The URL of the target A2A agent
        
    Returns:
        dict: Response data from the agent
    """
    try:
        payload = {
            "jsonrpc": "2.0",
            "method": "message/send",
            "params": {
                "message": {
                    "messageId": str(uuid.uuid4()),
                    "role": "user",
                    "parts": [{"type": "text", "text": message_text}]
                }
            },
            "id": 1
        }
        
        response = requests.post(target_agent_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if "result" in result:
                artifacts = result["result"].get("artifacts", [])
                if artifacts and artifacts[0].get("parts"):
                    return {
                        "success": True,
                        "response": artifacts[0]["parts"][0].get("text", "No response"),
                        "target_agent_url": target_agent_url
                    }
            return {"success": False, "error": result.get("error", "Unknown error")}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

class A2AClientToolProvider:
    """
    Workshop-compatible A2A Client Tool Provider that mimics strands_tools.a2a_client.A2AClientToolProvider
    but uses the correct message format under the hood.
    """
    
    def __init__(self, known_agent_urls: list):
        """
        Initialize the A2A client with known agent URLs.
        
        Args:
            known_agent_urls: List of agent URLs to communicate with
        """
        self.known_agent_urls = known_agent_urls
        self._tools = self._create_tools()
    
    def _create_tools(self):
        """Create the A2A tools with the known URLs."""
        
        @tool
        def a2a_send_message(message_text: str, target_agent_url: str) -> dict:
            """
            Send a message to a specific A2A agent.
            
            Args:
                message_text: The message content to send to the agent
                target_agent_url: The URL of the target A2A agent
                
            Returns:
                dict: Response data from the agent
            """
            return _send_a2a_message(message_text, target_agent_url)
        
        @tool 
        def a2a_list_discovered_agents() -> dict:
            """List discovered A2A agents and their URLs."""
            return _list_known_agents(self.known_agent_urls)
        
        @tool
        def a2a_discover_agent(agent_url: str) -> dict:
            """Discover an A2A agent at the given URL."""
            # Simple implementation - just check if URL is reachable
            try:
                response = requests.get(f"{agent_url}/health", timeout=5)
                if response.status_code == 200:
                    return {"success": True, "agent_url": agent_url, "status": "discovered"}
                else:
                    return {"success": False, "error": f"Agent not reachable at {agent_url}"}
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        return [a2a_send_message, a2a_list_discovered_agents, a2a_discover_agent]
    
    @property
    def tools(self):
        """Get the list of A2A tools."""
        return self._tools

def _send_a2a_message(message_text: str, target_agent_url: str) -> dict:
    """Internal function to send A2A message with correct format."""
    try:
        payload = {
            "jsonrpc": "2.0",
            "method": "message/send",
            "params": {
                "message": {
                    "messageId": str(uuid.uuid4()),
                    "role": "user",
                    "parts": [{"type": "text", "text": message_text}]
                }
            },
            "id": 1
        }
        
        response = requests.post(target_agent_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if "result" in result:
                artifacts = result["result"].get("artifacts", [])
                if artifacts and artifacts[0].get("parts"):
                    return {
                        "success": True,
                        "response": artifacts[0]["parts"][0].get("text", "No response"),
                        "target_agent_url": target_agent_url
                    }
            return {"success": False, "error": result.get("error", "Unknown error")}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def _list_known_agents(known_urls: list) -> dict:
    """Internal function to list known agents."""
    agents = []
    
    # Map URLs to agent info
    url_to_agent = {
        "http://127.0.0.1:8000": {"name": "Rules Agent", "description": "D&D rules lookup"},
        "http://127.0.0.1:8001": {"name": "Character Agent", "description": "Character management"},
    }
    
    for url in known_urls:
        if url in url_to_agent:
            agent_info = url_to_agent[url].copy()
            agent_info["url"] = url
            agents.append(agent_info)
        else:
            # Generic agent info for unknown URLs
            agents.append({
                "name": f"Agent at {url}",
                "url": url,
                "description": "Unknown agent"
            })
    
    return {
        "success": True,
        "agents": agents
    }

# Standalone tools for backward compatibility
@tool
def a2a_send_message(message_text: str, target_agent_url: str) -> dict:
    """Send a message to a specific A2A agent."""
    return _send_a2a_message(message_text, target_agent_url)

@tool
def a2a_list_agents() -> dict:
    """List known A2A agents and their URLs (default implementation)."""
    return _list_known_agents([
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001"
    ])