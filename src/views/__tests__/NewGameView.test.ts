import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NewGameView from '../NewGameView.vue'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  })
}

function mockFetchFailure(status = 500) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  })
}

function mountComponent() {
  return mount(NewGameView, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('NewGameView', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockClear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('form rendering', () => {
    it('renders all 5 form fields and a Start button', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('#character-name').exists()).toBe(true)
      expect(wrapper.find('#gender').exists()).toBe(true)
      expect(wrapper.find('#race').exists()).toBe(true)
      expect(wrapper.find('#character-class').exists()).toBe(true)
      expect(wrapper.find('#server-url').exists()).toBe(true)

      const startButton = wrapper.find('button[type="submit"]')
      expect(startButton.exists()).toBe(true)
      expect(startButton.text()).toBe('Start')
    })
  })

  describe('dropdown options', () => {
    it('gender dropdown has exactly 3 options: Male, Female, Non-binary', () => {
      const wrapper = mountComponent()
      const genderSelect = wrapper.find('#gender')
      const options = genderSelect.findAll('option').filter(o => o.attributes('disabled') === undefined)

      expect(options).toHaveLength(3)
      expect(options.map(o => o.text())).toEqual(['Male', 'Female', 'Non-binary'])
    })

    it('race dropdown has exactly 9 D&D races', () => {
      const wrapper = mountComponent()
      const raceSelect = wrapper.find('#race')
      const options = raceSelect.findAll('option').filter(o => o.attributes('disabled') === undefined)

      const expectedRaces = [
        'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome',
        'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn',
      ]
      expect(options).toHaveLength(9)
      expect(options.map(o => o.text())).toEqual(expectedRaces)
    })

    it('class dropdown has exactly 12 D&D classes', () => {
      const wrapper = mountComponent()
      const classSelect = wrapper.find('#character-class')
      const options = classSelect.findAll('option').filter(o => o.attributes('disabled') === undefined)

      const expectedClasses = [
        'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
        'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
      ]
      expect(options).toHaveLength(12)
      expect(options.map(o => o.text())).toEqual(expectedClasses)
    })
  })

  describe('validation', () => {
    it('shows validation error messages when submitting with empty fields', async () => {
      const wrapper = mountComponent()

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const fieldErrors = wrapper.findAll('.field-error')
      expect(fieldErrors.length).toBeGreaterThanOrEqual(5)
      expect(fieldErrors.some(e => e.text().includes('Character name is required'))).toBe(true)
      expect(fieldErrors.some(e => e.text().includes('Gender is required'))).toBe(true)
      expect(fieldErrors.some(e => e.text().includes('Race is required'))).toBe(true)
      expect(fieldErrors.some(e => e.text().includes('Class is required'))).toBe(true)
      expect(fieldErrors.some(e => e.text().includes('Server URL is required'))).toBe(true)
    })
  })

  describe('loading state', () => {
    it('disables Start button and shows "Starting..." during submission', async () => {
      // Use a fetch that never resolves to keep loading state active
      globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}))

      const wrapper = mountComponent()

      // Fill in all fields
      await wrapper.find('#character-name').setValue('Aragorn')
      await wrapper.find('#gender').setValue('Male')
      await wrapper.find('#race').setValue('Human')
      await wrapper.find('#character-class').setValue('Ranger')
      await wrapper.find('#server-url').setValue('https://example.com')

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.text()).toBe('Starting...')
    })
  })

  describe('error handling', () => {
    it('displays error message when server returns an error', async () => {
      globalThis.fetch = mockFetchFailure(500)

      const wrapper = mountComponent()

      await wrapper.find('#character-name').setValue('Aragorn')
      await wrapper.find('#gender').setValue('Male')
      await wrapper.find('#race').setValue('Human')
      await wrapper.find('#character-class').setValue('Ranger')
      await wrapper.find('#server-url').setValue('https://example.com')

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const errorEl = wrapper.find('.submit-error')
      expect(errorEl.exists()).toBe(true)
      expect(errorEl.text()).toContain('Request failed with status 500')
    })
  })
})
