import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatInitPrompt } from '../promptFormatter'
import type { CharacterForm } from '../../types'

/**
 * Property 3: Inquiry prompt formatting
 * Validates: Requirements 3.1
 *
 * For any valid CharacterForm (with non-empty name, gender, race, and class),
 * the generated prompt should contain the character's name, gender, race, and class
 * interpolated into the expected template string.
 */

const genderArb = fc.constantFrom('Male', 'Female', 'Non-binary') as fc.Arbitrary<
  CharacterForm['gender']
>

const raceArb = fc.constantFrom(
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Dragonborn',
) as fc.Arbitrary<CharacterForm['race']>

const classArb = fc.constantFrom(
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
) as fc.Arbitrary<CharacterForm['characterClass']>

const nonEmptyNameArb = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => s.trim().length > 0)

const validUrlArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .map((s) => 'https://' + s)

const validFormArb: fc.Arbitrary<CharacterForm> = fc.record({
  name: nonEmptyNameArb,
  gender: genderArb,
  race: raceArb,
  characterClass: classArb,
  serverUrl: validUrlArb,
})

describe('Property 3: Inquiry prompt formatting', () => {
  it('contains the character name, gender, race, and class in the prompt', () => {
    fc.assert(
      fc.property(validFormArb, (form) => {
        const prompt = formatInitPrompt(form)

        expect(prompt).toContain(form.name)
        expect(prompt).toContain(form.gender)
        expect(prompt).toContain(form.race)
        expect(prompt).toContain(form.characterClass)
      }),
      { numRuns: 100 },
    )
  })

  it('matches the expected template format', () => {
    fc.assert(
      fc.property(validFormArb, (form) => {
        const prompt = formatInitPrompt(form)
        const expected = `Create a new player named ${form.name} who is a ${form.gender} ${form.race} ${form.characterClass}. You can then welcome them to the game. Describe the surroundings of the player and create an atmosphere that the player can bounce off of. Don't make more than 100 words.`

        expect(prompt).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })
})
