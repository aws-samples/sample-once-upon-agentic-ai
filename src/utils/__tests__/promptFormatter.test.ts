import { describe, it, expect } from 'vitest'
import { formatInitPrompt } from '../promptFormatter'
import type { CharacterForm } from '../../types'

describe('formatInitPrompt', () => {
  it('interpolates all character fields into the prompt template', () => {
    const form: CharacterForm = {
      name: 'Thorin',
      gender: 'Male',
      race: 'Dwarf',
      characterClass: 'Fighter',
      serverUrl: 'http://localhost:3000',
    }

    const result = formatInitPrompt(form)

    expect(result).toBe(
      "Create a new player named Thorin who is a Male Dwarf Fighter. You can then welcome them to the game. Describe the surroundings of the player and create an atmosphere that the player can bounce off of. Don't make more than 100 words.",
    )
  })

  it('works with different character combinations', () => {
    const form: CharacterForm = {
      name: 'Aria',
      gender: 'Female',
      race: 'Half-Elf',
      characterClass: 'Sorcerer',
      serverUrl: 'https://example.com',
    }

    const result = formatInitPrompt(form)

    expect(result).toContain('Aria')
    expect(result).toContain('Female')
    expect(result).toContain('Half-Elf')
    expect(result).toContain('Sorcerer')
  })
})
