import os
import uuid
from datetime import datetime
from dataclasses import dataclass, asdict
from strands import Agent, tool
from strands.multiagent.a2a import A2AServer
from tinydb import TinyDB, Query

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
    inventory: list[InventoryItem]
    created_at: str | None = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

CHARACTERS_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "characters.json")
characters_db = TinyDB(CHARACTERS_DB, indent=4, separators=(',', ': '))
Character_Query = Query()


@tool
def find_character_by_name(name: str) -> dict:
    """Find a stored D&D character by its exact name.

    Use it when a player refers to an existing character and you need its sheet:
    class, race, level, ability scores, inventory. Names are matched exactly and
    are case-sensitive; use list_all_characters if you are unsure of the spelling.

    Example response:
        {"character_id": "6ca1…", "name": "Thorin", "character_class": "Fighter",
         "race": "Dwarf", "gender": "Male", "level": 1, "experience": 0,
         "stats": {"strength": 16, "dexterity": 12, …}, "inventory": […]}

    Args:
        name: The character's name exactly as it was created, e.g. "Thorin".

    Notes:
        - Fails with an error if no character with that name exists.

    Returns:
        The stored character record as a dict (see the example above).
    """
    print(f"🔍 Searching for character with name: '{name}'")
    result = characters_db.search(Character_Query.name == name)

    if not result:
        # Strands turns the exception into an error result the model can see
        raise ValueError(f"Character with name {name!r} not found")

    character = result[0]
    print(f"✅ Found character: {character['name']} (ID: {character['character_id']}, {character['character_class']} {character['race']})")
    return character


@tool
def list_all_characters() -> list[dict]:
    """List every character stored in the database.

    Use it to see which characters exist before creating or looking one up, or
    when a player asks for the whole party.

    Example response:
        [{"character_id": "6ca1…", "name": "Thorin", "character_class": "Fighter",
          "race": "Dwarf", "gender": "Male", "level": 1, "experience": 0,
          "stats": {"strength": 16, …}, "inventory": […]},
         …]

    Notes:
        - Takes no parameters and returns every character in full; prefer
          find_character_by_name when you already know the name.
        - Returns an empty list if no character has been created yet.

    Returns:
        A list of character records, same shape as find_character_by_name.
    """
    print("📋 Listing all characters in database")
    all_chars = characters_db.all()

    if not all_chars:
        print("📋 No characters found in database")
        return []

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
    stats_dict: dict[str, int]
    ) -> dict:
    """Create a new D&D character and save it to the database.

    Use it once per new character, after the ability scores have been decided
    (roll them with the 4d6-drop-lowest method first). Every new character starts
    at level 1 with 0 experience, a Starting Equipment Pack and 100 gold pieces.

    Example response:
        {"character_id": "6ca1…", "name": "Thorin", "character_class": "Fighter",
         "race": "Dwarf", "gender": "Male", "level": 1, "experience": 0,
         "stats": {"strength": 16, "dexterity": 12, "constitution": 14,
                   "intelligence": 10, "wisdom": 11, "charisma": 9},
         "inventory": [{"item_name": "Starting Equipment Pack", "quantity": 1},
                       {"item_name": "Gold Pieces", "quantity": 100}]}

    Notes:
        - Names are not checked for uniqueness: creating "Thorin" twice stores two
          characters. Check with find_character_by_name if in doubt.
        - Any ability score missing from stats_dict defaults to 10.

    Args:
        name: The character's name, e.g. "Thorin".
        character_class: A D&D class such as "Fighter", "Wizard" or "Rogue".
        race: A D&D race such as "Dwarf", "Elf" or "Human".
        gender: The character's gender, e.g. "Female"; pick one if the player did not say.
        stats_dict: Ability scores as a dict with the keys strength, dexterity,
            constitution, intelligence, wisdom and charisma, each an integer
            (typically 3 to 18), e.g. {"strength": 16, "dexterity": 12}.

    Returns:
        The newly created character record as a dict, including its generated
        character_id.
    """
    character_id = str(uuid.uuid4())
    stats = Stats(
        strength=stats_dict.get('strength', 10),
        dexterity=stats_dict.get('dexterity', 10),
        constitution=stats_dict.get('constitution', 10),
        intelligence=stats_dict.get('intelligence', 10),
        wisdom=stats_dict.get('wisdom', 10),
        charisma=stats_dict.get('charisma', 10),
    )
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
            InventoryItem("Gold Pieces", 100),
        ],
    )
    record = asdict(character)
    characters_db.insert(record)
    print(f"✅ Created character {name} ({character_class} {race}) with id {character_id}")
    return record

def create_agent(context_id: str) -> Agent:
    return Agent(
        # TODO: Step 1 - Add the create_character, find_character_by_name and list_all_characters tools to the agent
        # TODO: Step 2 - Add the name "Character Creator Agent" to the agent
        # TODO: Step 3 - Add the description "D&D character management: creates characters (ability scores rolled 4d6 drop lowest), stores them, finds and lists them." to the agent
        system_prompt="""You are a D&D character manager. Use your tools to create, find or list characters.
When creating a character, roll each ability score with 4d6 drop lowest. If details are missing (gender, some scores), choose or roll them yourself instead of asking back.
Confirm creations and summarize found characters briefly: class, race, key stats.""",
    )

# TODO: Step 4 - Create an A2AServer with the create_agent factory on port 8001
a2a_server = None

if __name__ == "__main__":
    # TODO: Step 5 - Start the A2A server
    pass
