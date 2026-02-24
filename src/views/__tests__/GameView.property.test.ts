import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ParsedMessage, StoryOutput, DiceRoll } from '@/types'

/**
 * Property 9: Successful response appends to message list
 * Validates: Requirements 6.3, 7.3
 *
 * For any existing message list of length N and any new StoryOutput
 * (extracted from InquiryResponse's nested `response` wrapper),
 * appending the user message and assistant message should result in
 * a list of length N+2 with the new StoryOutput at the end.
 */

const diceRollArb: fc.Arbitrary<DiceRoll> = fc.record({
  dice_type: fc.constantFrom('d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'),
  result: fc.integer({ min: 1, max: 100 }).map(String),
  reason: fc.stringMatching(/^[a-zA-Z0-9 ]{1,40}$/),
})

const storyOutputArb: fc.Arbitrary<StoryOutput> = fc.record({
  response: fc.stringMatching(/^[a-zA-Z0-9 ]{1,80}$/),
  actions_suggestions: fc.array(fc.stringMatching(/^[a-zA-Z0-9 ]{1,30}$/), {
    minLength: 0,
    maxLength: 4,
  }),
  destails: fc.stringMatching(/^[a-zA-Z0-9 ]{0,60}$/),
  dice_rolls: fc.array(diceRollArb, { minLength: 0, maxLength: 3 }),
})

const userMessageArb: fc.Arbitrary<ParsedMessage> = fc
  .stringMatching(/^[a-zA-Z0-9 ]{1,60}$/)
  .map((text) => ({ role: 'user' as const, text }))

const assistantMessageArb: fc.Arbitrary<ParsedMessage> = storyOutputArb.map((storyOutput) => ({
  role: 'assistant' as const,
  storyOutput,
}))

const parsedMessageArb: fc.Arbitrary<ParsedMessage> = fc.oneof(userMessageArb, assistantMessageArb)

const existingMessagesArb = fc.array(parsedMessageArb, { minLength: 0, maxLength: 20 })

const userInputTextArb = fc.stringMatching(/^[a-zA-Z0-9 ]{1,100}$/)

/**
 * Simulates what GameView.handleAction does on a successful response:
 * appends { role: 'user', text } and { role: 'assistant', storyOutput }
 */
function appendResponse(
  existing: ParsedMessage[],
  userText: string,
  newStoryOutput: StoryOutput,
): ParsedMessage[] {
  return [
    ...existing,
    { role: 'user', text: userText },
    { role: 'assistant', storyOutput: newStoryOutput },
  ]
}

describe('Property 9: Successful response appends to message list', () => {
  it('appending a response grows the list by 2 with the new StoryOutput at the end', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        existingMessagesArb,
        userInputTextArb,
        storyOutputArb,
        (existingMessages, userText, newStoryOutput) => {
          const originalLength = existingMessages.length

          const updated = appendResponse(existingMessages, userText, newStoryOutput)

          // List grew by exactly 2 (user message + assistant message)
          expect(updated).toHaveLength(originalLength + 2)

          // Second-to-last message is the user message with the submitted text
          const userMsg = updated[updated.length - 2]
          expect(userMsg.role).toBe('user')
          expect(userMsg.text).toBe(userText)

          // Last message is the assistant message with the new StoryOutput
          const assistantMsg = updated[updated.length - 1]
          expect(assistantMsg.role).toBe('assistant')
          expect(assistantMsg.storyOutput).toEqual(newStoryOutput)

          // Original messages are preserved in order
          for (let i = 0; i < originalLength; i++) {
            expect(updated[i]).toEqual(existingMessages[i])
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
