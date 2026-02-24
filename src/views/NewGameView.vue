<template>
  <div class="new-game-view">
    <div class="form-card panel-parchment border-wood shadow-panel">
      <h1 class="form-title">Create Your Character</h1>

      <form class="character-form" @submit.prevent="handleSubmit">
        <div v-if="submitError" class="submit-error">{{ submitError }}</div>

        <div class="form-group">
          <label for="character-name" class="form-label">Character Name</label>
          <input
            id="character-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.name }"
            placeholder="Enter your character's name"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="gender" class="form-label">Gender</label>
          <select id="gender" v-model="form.gender" class="form-input" :class="{ 'input-error': errors.gender }">
            <option value="" disabled>Select gender</option>
            <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
          </select>
          <span v-if="errors.gender" class="field-error">{{ errors.gender }}</span>
        </div>

        <div class="form-group">
          <label for="race" class="form-label">Race</label>
          <select id="race" v-model="form.race" class="form-input" :class="{ 'input-error': errors.race }">
            <option value="" disabled>Select race</option>
            <option v-for="r in raceOptions" :key="r" :value="r">{{ r }}</option>
          </select>
          <span v-if="errors.race" class="field-error">{{ errors.race }}</span>
        </div>

        <div class="form-group">
          <label for="character-class" class="form-label">Class</label>
          <select id="character-class" v-model="form.characterClass" class="form-input" :class="{ 'input-error': errors.characterClass }">
            <option value="" disabled>Select class</option>
            <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
          </select>
          <span v-if="errors.characterClass" class="field-error">{{ errors.characterClass }}</span>
        </div>

        <div class="form-group">
          <label for="server-url" class="form-label">Server URL</label>
          <input
            id="server-url"
            v-model="form.serverUrl"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.serverUrl }"
            placeholder="https://your-server.example.com"
          />
          <span v-if="errors.serverUrl" class="field-error">{{ errors.serverUrl }}</span>
        </div>

        <button type="submit" class="start-button" :disabled="loading">
          {{ loading ? 'Starting...' : 'Start' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CharacterForm, ValidationErrors } from '@/types'
import { validateForm } from '@/utils/validation'
import { formatInitPrompt } from '@/utils/promptFormatter'
import { useGameApi } from '@/composables/useGameApi'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const store = useGameStore()

const genderOptions: CharacterForm['gender'][] = ['Male', 'Female', 'Non-binary']

const raceOptions: CharacterForm['race'][] = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Dragonborn',
]

const classOptions: CharacterForm['characterClass'][] = [
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
]

const form = reactive<CharacterForm>({
  name: '',
  gender: '' as CharacterForm['gender'],
  race: '' as CharacterForm['race'],
  characterClass: '' as CharacterForm['characterClass'],
  serverUrl: '',
})

const errors = ref<ValidationErrors>({})
const loading = ref(false)
const submitError = ref<string | null>(null)

async function handleSubmit() {
  const validationErrors = validateForm(form)
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  errors.value = {}
  submitError.value = null
  loading.value = true

  try {
    const prompt = formatInitPrompt(form)
    const { sendInquiry } = useGameApi(form.serverUrl)
    await sendInquiry(prompt)
    store.setConnection(form.serverUrl, form.name)
    router.push({ name: 'game', params: { characterName: form.name } })
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Failed to connect to server'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.new-game-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.form-card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
}

.form-title {
  font-family: var(--font-heading);
  color: var(--color-red-deep);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.character-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-family: var(--font-ui);
  font-weight: 600;
  color: var(--color-ink-light);
  font-size: 0.95rem;
}

.form-input {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.6rem 0.75rem;
  border: 2px solid var(--color-parchment-dark);
  border-radius: 4px;
  background-color: var(--color-parchment);
  color: var(--color-ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: var(--shadow-glow);
}

.form-input::placeholder {
  color: var(--color-ink-light);
  opacity: 0.6;
}

.start-button {
  margin-top: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-gold-light);
  background-color: var(--color-wood-medium);
  border: var(--border-gold);
  border-radius: var(--border-radius-panel);
  cursor: pointer;
  box-shadow: var(--shadow-panel);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.start-button:hover {
  background-color: var(--color-wood-dark);
  box-shadow: var(--shadow-glow);
}

.start-button:active {
  transform: translateY(1px);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-wood-light);
  box-shadow: none;
}

.start-button:disabled:hover {
  background-color: var(--color-wood-light);
  box-shadow: none;
}

.field-error {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-red-accent);
}

.input-error {
  border-color: var(--color-red-accent);
}

.submit-error {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-parchment);
  background-color: var(--color-red-deep);
  padding: 0.6rem 0.75rem;
  border-radius: 4px;
  text-align: center;
}
</style>
