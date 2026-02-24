import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mount } from '@vue/test-utils'
import MessageList from '../MessageList.vue'
import type { ParsedMessage, StoryOutput, DiceRoll } from '@/types'

/**
 * Property 6: Message narrative content fully rendered
 * Validates: Requirements 5.4
 *
 * For any ParsedMessage with a StoryOutput, the rendered message entry
 * should contain the `response` narrative text.
 */

const diceRollArb: fc.Arbitrary<DiceRoll> = fc.record({
  dice_type: fc.constantFrom('d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'),
  result: fc.integer({ min: 1, max: 100 }).map(String),
  reason: fc.stringMatching(/^[a-zA-Z0-9 ]{1,40}$/),
})

// Generate words then join with single spaces to avoid HTML whitespace collapsing issues
const narrativeArb = fc
  .array(fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/), { minLength: 1, maxLength: 15 })
  .map((words) => words.join(' '))

const storyOutputArb: fc.Arbitrary<StoryOutput> = fc.record({
  response: narrativeArb,
  actions_suggestions: fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,40}$/), {
    minLength: 0,
    maxLength: 4,
  }),
  destails: fc.stringMatching(/^[a-zA-Z0-9]{0,60}$/),
  dice_rolls: fc.array(diceRollArb, { minLength: 0, maxLength: 3 }),
})

const assistantMessageArb: fc.Arbitrary<ParsedMessage> = storyOutputArb.map((storyOutput) => ({
  role: 'assistant' as const,
  storyOutput,
}))

describe('Property 6: Message narrative content fully rendered', () => {
  it('renders the response narrative text for any assistant message with StoryOutput', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(assistantMessageArb, (msg) => {
        const wrapper = mount(MessageList, {
          props: {
            messages: [msg],
            loading: false,
            error: null,
          },
        })

        const text = wrapper.text()
        expect(text).toContain(msg.storyOutput!.response)
      }),
      { numRuns: 100 },
    )
  })
})
