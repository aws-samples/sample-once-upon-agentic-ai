// ---- Form Data ----

export interface CharacterForm {
  name: string
  gender: 'Male' | 'Female' | 'Non-binary'
  race:
    | 'Human'
    | 'Elf'
    | 'Dwarf'
    | 'Halfling'
    | 'Gnome'
    | 'Half-Elf'
    | 'Half-Orc'
    | 'Tiefling'
    | 'Dragonborn'
  characterClass:
    | 'Barbarian'
    | 'Bard'
    | 'Cleric'
    | 'Druid'
    | 'Fighter'
    | 'Monk'
    | 'Paladin'
    | 'Ranger'
    | 'Rogue'
    | 'Sorcerer'
    | 'Warlock'
    | 'Wizard'
  serverUrl: string
}

// ---- Validation ----

export interface ValidationErrors {
  name?: string
  gender?: string
  race?: string
  characterClass?: string
  serverUrl?: string
}

// ---- Raw API types (from GET /messages) ----

export interface TextContent {
  text: string
}

export interface ToolUseContent {
  toolUse: {
    toolUseId: string
    name: string
    input: Record<string, unknown>
  }
}

export interface ToolResultContent {
  toolResult: {
    toolUseId: string
    status: string
    content: TextContent[]
  }
}

export type ContentBlock = TextContent | ToolUseContent | ToolResultContent

export interface RawMessage {
  role: 'user' | 'assistant'
  content: ContentBlock[]
}

// ---- Parsed / display-ready types ----

export interface DiceRoll {
  dice_type: string
  result: string
  reason: string
}

export interface StoryOutput {
  response: string
  actions_suggestions: string[]
  destails: string
  dice_rolls: DiceRoll[]
}

export interface ParsedMessage {
  role: 'user' | 'assistant'
  text?: string
  storyOutput?: StoryOutput
}

// ---- Character Stats ----

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface InventoryItem {
  item_name: string
  quantity: number
}

export interface CharacterStats {
  character_id: string
  name: string
  character_class: string
  race: string
  gender: string
  level: number
  experience: number
  stats: AbilityScores
  inventory: InventoryItem[]
  created_at: string
}

// ---- Inquiry Request / Response ----

export interface InquiryRequest {
  question: string
}

export interface InquiryResponse {
  response: StoryOutput
}
