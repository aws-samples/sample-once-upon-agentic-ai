import type { CharacterForm, ValidationErrors } from '../types'

export function validateForm(form: CharacterForm): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!form.name) {
    errors.name = 'Character name is required'
  }

  if (!form.gender) {
    errors.gender = 'Gender is required'
  }

  if (!form.race) {
    errors.race = 'Race is required'
  }

  if (!form.characterClass) {
    errors.characterClass = 'Class is required'
  }

  if (!form.serverUrl) {
    errors.serverUrl = 'Server URL is required'
  } else if (!form.serverUrl.startsWith('http://') && !form.serverUrl.startsWith('https://')) {
    errors.serverUrl = 'Server URL must start with http:// or https://'
  }

  return errors
}
