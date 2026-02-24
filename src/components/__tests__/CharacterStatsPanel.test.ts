import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CharacterStatsPanel from '../CharacterStatsPanel.vue'
import type { CharacterStats } from '@/types'

function mountPanel(props: { stats: CharacterStats | null; loading: boolean; error: string | null }) {
  return mount(CharacterStatsPanel, { props })
}

const sampleStats: CharacterStats = {
  character_id: 'test-id-123',
  name: 'Aragorn',
  gender: 'Male',
  race: 'Human',
  character_class: 'Ranger',
  level: 5,
  experience: 1200,
  stats: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 10,
    wisdom: 13,
    charisma: 12,
  },
  inventory: [
    { item_name: 'Sword', quantity: 1 },
  ],
  created_at: '2026-02-24T16:40:12.348448',
}

describe('CharacterStatsPanel', () => {
  it('shows loading indicator when loading is true', () => {
    const wrapper = mountPanel({ stats: null, loading: true, error: null })
    expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading stats')
  })

  it('shows error message when error prop is set', () => {
    const wrapper = mountPanel({ stats: null, loading: false, error: 'Failed to fetch' })
    expect(wrapper.find('.panel-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to fetch')
  })

  it('shows fallback message when stats is null and not loading/error', () => {
    const wrapper = mountPanel({ stats: null, loading: false, error: null })
    expect(wrapper.text()).toContain('Character stats unavailable')
  })

  it('displays all character stats when stats are provided', () => {
    const wrapper = mountPanel({ stats: sampleStats, loading: false, error: null })
    expect(wrapper.text()).toContain('Aragorn')
    expect(wrapper.text()).toContain('Male')
    expect(wrapper.text()).toContain('Human')
    expect(wrapper.text()).toContain('Ranger')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('1200')
  })

  it('displays ability scores from stats', () => {
    const wrapper = mountPanel({ stats: sampleStats, loading: false, error: null })
    expect(wrapper.text()).toContain('16')
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('13')
    expect(wrapper.text()).toContain('12')
  })

  it('renders section headers for Identity and Vitals', () => {
    const wrapper = mountPanel({ stats: sampleStats, loading: false, error: null })
    const headers = wrapper.findAll('.section-header')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toBe('Identity')
    expect(headers[1].text()).toBe('Vitals')
  })

  it('applies D&D theme classes to the panel', () => {
    const wrapper = mountPanel({ stats: sampleStats, loading: false, error: null })
    const panel = wrapper.find('.character-stats-panel')
    expect(panel.classes()).toContain('panel-parchment')
    expect(panel.classes()).toContain('border-gold')
    expect(panel.classes()).toContain('shadow-panel')
  })
})
