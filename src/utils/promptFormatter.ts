import type { CharacterForm } from '../types'

export function formatInitPrompt(form: CharacterForm): string {
  return `Create a new player named ${form.name} who is a ${form.gender} ${form.race} ${form.characterClass}. You can then welcome them to the game. Describe the surroundings of the player and create an atmosphere that the player can bounce off of. Don't make more than 100 words.`
}
