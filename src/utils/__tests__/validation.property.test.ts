import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateForm } from '../validation'
import type { CharacterForm } from '../../types'

/**
 * Property 1: Form validation rejects incomplete forms and accepts complete forms
 * Validates: Requirements 2.1, 2.2
 *
 * For any CharacterForm where at least one required field is empty,
 * validateForm should return a non-empty ValidationErrors object.
 * For any CharacterForm where all five fields are non-empty and URL is valid,
 * validateForm should return an empty object.
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

const validUrlArb = fc.oneof(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  fc.string({ minLength: 1, maxLength: 50 }).map((s) => 'https://' + s),
)

const nonEmptyNameArb = fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0)

/** Generates a complete, valid CharacterForm */
const validFormArb: fc.Arbitrary<CharacterForm> = fc.record({
  name: nonEmptyNameArb,
  gender: genderArb,
  race: raceArb,
  characterClass: classArb,
  serverUrl: validUrlArb,
})

/** Field keys that can be blanked out */
const fieldKeys: (keyof CharacterForm)[] = ['name', 'gender', 'race', 'characterClass', 'serverUrl']

describe('Property 1: Form validation rejects incomplete forms and accepts complete forms', () => {
  it('returns no errors for any complete form with valid URL', () => {
    fc.assert(
      fc.property(validFormArb, (form) => {
        const errors = validateForm(form)
        expect(Object.keys(errors)).toHaveLength(0)
      }),
      { numRuns: 100 },
    )
  })

  it('returns errors when at least one required field is empty', () => {
    fc.assert(
      fc.property(
        validFormArb,
        fc.subarray(fieldKeys, { minLength: 1 }),
        (baseForm, fieldsToEmpty) => {
          const form = { ...baseForm }
          for (const key of fieldsToEmpty) {
            ;(form as Record<string, string>)[key] = ''
          }

          const errors = validateForm(form as CharacterForm)
          expect(Object.keys(errors).length).toBeGreaterThan(0)

          // Each emptied field should have a corresponding error
          for (const key of fieldsToEmpty) {
            expect(errors).toHaveProperty(key)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
