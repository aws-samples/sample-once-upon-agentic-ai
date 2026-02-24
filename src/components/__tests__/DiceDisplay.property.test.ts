import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mount } from '@vue/test-utils'
import DiceDisplay from '../DiceDisplay.vue'

/**
 * Property 12: Dice roll visual display
 * Validates: Requirements 5.5, 10.1, 10.2, 10.3
 *
 * For any DiceRoll object with a valid dice_type, result, and reason,
 * the DiceDisplay component should:
 *   (a) reference the correct SVG image path (/dice/{dice_type}.svg)
 *   (b) display the result number in the rendered output
 *   (c) include the reason as a tooltip (title attribute or equivalent)
 */

const diceTypeArb = fc.constantFrom('d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100')
const resultArb = fc.integer({ min: 1, max: 100 }).map(String)
const reasonArb = fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/)

describe('Property 12: Dice roll visual display', () => {
  it('references the correct SVG image path for any valid dice type', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(diceTypeArb, resultArb, reasonArb, (diceType, result, reason) => {
        const wrapper = mount(DiceDisplay, {
          props: { diceType, result, reason },
        })

        const img = wrapper.find('img.dice-svg')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe(`/sample-once-upon-agentic-ai/dice/${diceType}.svg`)
      }),
      { numRuns: 100 },
    )
  })

  it('displays the result number in the rendered output', () => {
    fc.assert(
      fc.property(diceTypeArb, resultArb, reasonArb, (diceType, result, reason) => {
        const wrapper = mount(DiceDisplay, {
          props: { diceType, result, reason },
        })

        expect(wrapper.text()).toContain(result)
      }),
      { numRuns: 100 },
    )
  })

  it('includes the reason as a tooltip on the root element', () => {
    fc.assert(
      fc.property(diceTypeArb, resultArb, reasonArb, (diceType, result, reason) => {
        const wrapper = mount(DiceDisplay, {
          props: { diceType, result, reason },
        })

        expect(wrapper.attributes('title')).toBe(reason)
      }),
      { numRuns: 100 },
    )
  })
})
