import os
import uuid
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict
from dotenv import load_dotenv
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer
from tinydb import TinyDB, Query

# Load environment variables
load_dotenv()

@dataclass
class Stats:
    strength: int
    dexterity: int
    constitution: int
    intelligence: int
    wisdom: int
    charisma: int

@dataclass
class InventoryItem:
    item_name: str
    quantity: int

@dataclass
class Character:
    character_id: str
    name: str
    character_class: str  # "class" is reserved in Python too
    race: str
    gender: str
    level: int
    experience: int
    stats: Stats
    inventory: List[InventoryItem]
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

characters_db = TinyDB('characters.json')
Character_Query = Query()


@tool
def find_character_by_name(name: str) -> str:
    """
    Find a character by name
    
    Args:
        name: The character's name to search for
    """
    print(f"🔍 Searching for character with name: '{name}'")
    result = characters_db.search(Character_Query.name == name)
    
    if not result:
        print(f"❌ Character with name '{name}' not found")
        return f":x: Character with name '{name}' not found"
    
    character = result[0]
    print(f"✅ Found character: {character['name']} (ID: {character['character_id']}, {character['character_class']} {character['race']})")
    return character


@tool
def list_all_characters() -> str:
    """
    List all characters in the database
    """
    print("📋 Listing all characters in database")
    all_chars = characters_db.all()
    
    if not all_chars:
        print("❌ No characters found in database")
        return ":scroll: No characters found in the database"

    print(f"✅ Found {len(all_chars)} character(s) in database")
    for char in all_chars:
        print(f"  - {char['name']} ({char['character_class']} {char['race']})")
    
    return all_chars


@tool
def create_character(
    name: str,
    character_class: str,
    race: str,
    gender: str,
    stats_dict: Dict[str, int]
    ) -> str:
    """
    Character details respecting the GameCharacters object fields.
    Roll a dice to generate the stats_dic (ability scores). 
    When rolling ability scores, remember the traditional method: roll 4d6, drop the lowest die.
    
    Args:
        name: Character's name
        character_class: D&D class (Fighter, Wizard, etc.)
        race: D&D race (Human, Elf, etc.)
        gender: Character's gender
        stats_dict: Dictionary with strength, dexterity, constitution, intelligence, wisdom, charisma
    """
    # Generate unique character ID
    character_id = str(uuid.uuid4())
    print(character_id)
    # Create stats object
    stats = Stats(
        strength=stats_dict.get('strength', 10),
        dexterity=stats_dict.get('dexterity', 10),
        constitution=stats_dict.get('constitution', 10),
        intelligence=stats_dict.get('intelligence', 10),
        wisdom=stats_dict.get('wisdom', 10),
        charisma=stats_dict.get('charisma', 10)
    )

    print(stats)
    # Create character with updated CurrentStatus
    character = Character(
        character_id=character_id,
        name=name,
        character_class=character_class,
        race=race,
        gender=gender,
        level=1,
        experience=0,
        stats=stats,
        inventory=[
            InventoryItem("Starting Equipment Pack", 1),
            InventoryItem("Gold Pieces", 100)
        ]
    )
    print(character)
    
    characters_db.insert(asdict(character))
    print("Inserted")
    return character


agent = Agent(
    # TODO: Configure the Character Agent with:
    # - model: Use os.getenv("MODEL_ID") to get the model from environment
    # - tools: List containing [create_character, find_character_by_name, list_all_characters]
    # - name: "Character Creator Agent"
    # - description: Describe the agent's role in creating and managing D&D characters
    # - callback_handler: None (optional)
)



# TODO: Create an A2AServer instance with:
# - agent: The agent instance created above
# - port: 8001 (Character Agent port)
a2a_server = None

if __name__ == "__main__":
    # TODO: Start the A2A server
    # Call a2a_server.serve() with host="0.0.0.0" and port=8001
    pass