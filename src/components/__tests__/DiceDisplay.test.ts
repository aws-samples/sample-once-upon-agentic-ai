import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DiceDisplay from '../DiceDisplay.vue'

/**
 * DiceDisplay edge case unit tests
 * Validates: Requirements 10.4
 *
 * Tests the CSS fallback rendering when SVG images fail to load,
 * and verifies the reason tooltip is present.
 */

function mountDice(props: { diceType: string; result: string; reason: string }) {
  return mount(DiceDisplay, { props })
}

describe('DiceDisplay CSS fallback (Req 10.4)', () => {
  it('renders the SVG img by default before error', () => {
    const wrapper = mountDice({ diceType: 'd20', result: '17', reason: 'Attack roll' })
    expect(wrapper.find('img.dice-svg').exists()).toBe(true)
    expect(wrapper.find('.dice-fallback').exists()).toBe(false)
  })

  it('renders fallback shape when SVG fails to load', async () => {
    const wrapper = mountDice({ diceType: 'd20', result: '17', reason: 'Attack roll' })

    // Trigger the img error event to simulate SVG load failure
    await wrapper.find('img.dice-svg').trigger('error')

    expect(wrapper.find('.dice-fallback').exists()).toBe(true)
    expect(wrapper.find('.dice-fallback-shape').exists()).toBe(true)
    expect(wrapper.find('img.dice-svg').exists()).toBe(false)
  })

  it('fallback displays the result number', async () => {
    const wrapper = mountDice({ diceType: 'd8', result: '5', reason: 'Damage roll' })
    await wrapper.find('img.dice-svg').trigger('error')

    const fallbackResult = wrapper.find('.dice-fallback-result')
    expect(fallbackResult.exists()).toBe(true)
    expect(fallbackResult.text()).toBe('5')
  })

  it('fallback displays the dice_type label', async () => {
    const wrapper = mountDice({ diceType: 'd12', result: '9', reason: 'Initiative' })
    await wrapper.find('img.dice-svg').trigger('error')

    expect(wrapper.find('.dice-fallback').text()).toContain('d12')
  })

  it('reason tooltip is present on the root element', () => {
    const wrapper = mountDice({ diceType: 'd6', result: '3', reason: 'Saving throw' })
    expect(wrapper.attributes('title')).toBe('Saving throw')
  })
})
