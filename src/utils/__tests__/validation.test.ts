import { describe, it, expect } from 'vitest'
import { validateForm } from '../validation'
import type { CharacterForm } from '../../types'

const validForm: CharacterForm = {
  name: 'Aragorn',
  gender: 'Male',
  race: 'Human',
  characterClass: 'Ranger',
  serverUrl: 'https://example.com',
}

describe('validateForm', () => {
  it('returns no errors for a valid form', () => {
    expect(validateForm(validForm)).toEqual({})
  })

  it('returns error when name is empty', () => {
    const errors = validateForm({ ...validForm, name: '' })
    expect(errors.name).toBeDefined()
    expect(Object.keys(errors)).toHaveLength(1)
  })

  it('returns error when gender is empty', () => {
    const errors = validateForm({ ...validForm, gender: '' as CharacterForm['gender'] })
    expect(errors.gender).toBeDefined()
  })

  it('returns error when race is empty', () => {
    const errors = validateForm({ ...validForm, race: '' as CharacterForm['race'] })
    expect(errors.race).toBeDefined()
  })

  it('returns error when characterClass is empty', () => {
    const errors = validateForm({ ...validForm, characterClass: '' as CharacterForm['characterClass'] })
    expect(errors.characterClass).toBeDefined()
  })

  it('returns error when serverUrl is empty', () => {
    const errors = validateForm({ ...validForm, serverUrl: '' })
    expect(errors.serverUrl).toBeDefined()
  })

  it('returns URL format error for invalid URL', () => {
    const errors = validateForm({ ...validForm, serverUrl: 'ftp://example.com' })
    expect(errors.serverUrl).toContain('http')
  })

  it('accepts http:// URLs', () => {
    const errors = validateForm({ ...validForm, serverUrl: 'http://localhost:3000' })
    expect(errors.serverUrl).toBeUndefined()
  })

  it('returns errors for all empty fields', () => {
    const errors = validateForm({
      name: '',
      gender: '' as CharacterForm['gender'],
      race: '' as CharacterForm['race'],
      characterClass: '' as CharacterForm['characterClass'],
      serverUrl: '',
    })
    expect(Object.keys(errors)).toHaveLength(5)
  })
})
