import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateForm } from '../validation'
import type { CharacterForm } from '../../types'

/**
 * Property 2: URL format validation
 * Validates: Requirements 2.3
 *
 * For any string that does NOT start with "http://" or "https://",
 * the URL validation should return an error.
 * For any string that starts with "http://" or "https://",
 * the URL format validation should pass.
 */

/** A valid base form with all fields filled — only serverUrl will vary */
const baseForm: Omit<CharacterForm, 'serverUrl'> = {
  name: 'Thorn',
  gender: 'Male',
  race: 'Human',
  characterClass: 'Barbarian',
}

/**
 * Generates arbitrary non-empty strings that do NOT start with "http://" or "https://".
 */
const invalidUrlArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => !s.startsWith('http://') && !s.startsWith('https://'))

/**
 * Generates arbitrary strings that start with "http://" or "https://".
 */
const validUrlArb = fc.oneof(
  fc.string({ minLength: 0, maxLength: 100 }).map((s) => 'http://' + s),
  fc.string({ minLength: 0, maxLength: 100 }).map((s) => 'https://' + s),
)

describe('Property 2: URL format validation', () => {
  it('rejects any non-empty URL that does not start with http:// or https://', () => {
    fc.assert(
      fc.property(invalidUrlArb, (url) => {
        const form: CharacterForm = { ...baseForm, serverUrl: url }
        const errors = validateForm(form)
        expect(errors.serverUrl).toBeDefined()
      }),
      { numRuns: 100 },
    )
  })

  it('accepts any URL that starts with http:// or https://', () => {
    fc.assert(
      fc.property(validUrlArb, (url) => {
        const form: CharacterForm = { ...baseForm, serverUrl: url }
        const errors = validateForm(form)
        expect(errors.serverUrl).toBeUndefined()
      }),
      { numRuns: 100 },
    )
  })
})
