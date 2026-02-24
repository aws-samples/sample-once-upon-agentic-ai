import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mount } from '@vue/test-utils'
import ActionSuggestions from '../ActionSuggestions.vue'

/**
 * Property 7: Action suggestions rendered as prominent clickable elements
 * Validates: Requirements 6.1
 *
 * For any non-empty list of action suggestion strings, the ActionSuggestions
 * component should render one prominent clickable button per suggestion,
 * each containing the suggestion text.
 */

const suggestionArb = fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 ]{0,49}$/).map((s) => s.trimEnd())

const suggestionsArrayArb = fc.array(suggestionArb, { minLength: 1, maxLength: 6 })

describe('Property 7: Action suggestions rendered as prominent clickable elements', () => {
  it('renders one clickable button per suggestion with matching text', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(suggestionsArrayArb, (suggestions) => {
        const wrapper = mount(ActionSuggestions, {
          props: {
            suggestions,
            disabled: false,
          },
        })

        const buttons = wrapper.findAll('button')

        // 1. The number of buttons matches the number of suggestions
        expect(buttons).toHaveLength(suggestions.length)

        // 2. Each button's text content matches the corresponding suggestion string
        buttons.forEach((button, index) => {
          expect(button.text()).toBe(suggestions[index])
        })

        // 3. Each button is a <button> element (clickable)
        buttons.forEach((button) => {
          expect(button.element.tagName).toBe('BUTTON')
        })
      }),
      { numRuns: 100 },
    )
  })
})
