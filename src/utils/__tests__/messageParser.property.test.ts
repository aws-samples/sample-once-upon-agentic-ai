import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseMessages } from '../messageParser'
import type {
  RawMessage,
  TextContent,
  ToolUseContent,
  ToolResultContent,
  ContentBlock,
  StoryOutput,
  DiceRoll,
} from '../../types'

/**
 * Property 5: Message parsing extracts displayable messages from raw conversation history
 * Validates: Requirements 5.2, 5.3
 *
 * For any array of RawMessages, parseMessages should:
 * 1. Extract player action text from user messages containing text content blocks
 * 2. Extract StoryOutput data from assistant messages containing a toolUse with name === "StoryOutput"
 * 3. Filter out intermediate tool calls (non-StoryOutput toolUse blocks)
 * 4. Preserve the chronological order of the original raw messages
 * 5. Return only ParsedMessages that have either player text or a StoryOutput
 */

// ---- Arbitraries ----

const textContentArb: fc.Arbitrary<TextContent> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 100 }),
})

const diceRollArb: fc.Arbitrary<DiceRoll> = fc.record({
  dice_type: fc.constantFrom('d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'),
  result: fc.integer({ min: 1, max: 100 }).map(String),
  reason: fc.string({ minLength: 1, maxLength: 80 }),
})

const storyOutputArb: fc.Arbitrary<StoryOutput> = fc.record({
  response: fc.string({ minLength: 1, maxLength: 200 }),
  actions_suggestions: fc.array(fc.string({ minLength: 1, maxLength: 60 }), { minLength: 0, maxLength: 4 }),
  destails: fc.string({ maxLength: 100 }),
  dice_rolls: fc.array(diceRollArb, { minLength: 0, maxLength: 3 }),
})

const storyOutputToolUseArb: fc.Arbitrary<ToolUseContent> = fc.record({
  toolUse: fc.record({
    toolUseId: fc.uuid(),
    name: fc.constant('StoryOutput'),
    input: storyOutputArb.map((s) => s as unknown as Record<string, unknown>),
  }),
})

const nonStoryToolNames = ['roll_dice', 'a2a_send_message', 'a2a_list_discovered_agents']

const nonStoryToolUseArb: fc.Arbitrary<ToolUseContent> = fc.record({
  toolUse: fc.record({
    toolUseId: fc.uuid(),
    name: fc.constantFrom(...nonStoryToolNames),
    input: fc.constant({} as Record<string, unknown>),
  }),
})

const toolResultArb: fc.Arbitrary<ToolResultContent> = fc.record({
  toolResult: fc.record({
    toolUseId: fc.uuid(),
    status: fc.constantFrom('success', 'error'),
    content: fc.array(textContentArb, { minLength: 0, maxLength: 2 }),
  }),
})

/** User message with at least one text block (will produce a ParsedMessage) */
const userMessageWithTextArb: fc.Arbitrary<RawMessage> = fc
  .array(textContentArb, { minLength: 1, maxLength: 3 })
  .map((texts) => ({
    role: 'user' as const,
    content: texts as ContentBlock[],
  }))

/** User message with only non-text blocks (will be filtered out) */
const userMessageNoTextArb: fc.Arbitrary<RawMessage> = fc
  .array(toolResultArb, { minLength: 1, maxLength: 2 })
  .map((blocks) => ({
    role: 'user' as const,
    content: blocks as ContentBlock[],
  }))

/** Assistant message with a StoryOutput (will produce a ParsedMessage) */
const assistantWithStoryArb: fc.Arbitrary<RawMessage> = fc
  .tuple(
    fc.array(nonStoryToolUseArb, { minLength: 0, maxLength: 2 }),
    storyOutputToolUseArb,
    fc.array(fc.oneof(textContentArb, toolResultArb) as fc.Arbitrary<ContentBlock>, {
      minLength: 0,
      maxLength: 2,
    }),
  )
  .map(([before, story, after]) => ({
    role: 'assistant' as const,
    content: [...(before as ContentBlock[]), story as ContentBlock, ...after],
  }))

/** Assistant message with only non-StoryOutput tool calls (will be filtered out) */
const assistantNoStoryArb: fc.Arbitrary<RawMessage> = fc
  .array(nonStoryToolUseArb, { minLength: 1, maxLength: 3 })
  .map((blocks) => ({
    role: 'assistant' as const,
    content: blocks as ContentBlock[],
  }))

/** Mixed RawMessage array */
const rawMessagesArb: fc.Arbitrary<RawMessage[]> = fc.array(
  fc.oneof(
    { weight: 3, arbitrary: userMessageWithTextArb },
    { weight: 1, arbitrary: userMessageNoTextArb },
    { weight: 3, arbitrary: assistantWithStoryArb },
    { weight: 2, arbitrary: assistantNoStoryArb },
  ),
  { minLength: 0, maxLength: 15 },
)

// ---- Helpers ----

function isTextContent(block: ContentBlock): block is TextContent {
  return 'text' in block
}

function isToolUseContent(block: ContentBlock): block is ToolUseContent {
  return 'toolUse' in block
}

function hasUserText(msg: RawMessage): boolean {
  return msg.role === 'user' && msg.content.some(isTextContent)
}

function hasStoryOutput(msg: RawMessage): boolean {
  return (
    msg.role === 'assistant' &&
    msg.content.some((b) => isToolUseContent(b) && b.toolUse.name === 'StoryOutput')
  )
}

// ---- Property Tests ----

describe('Property 5: Message parsing extracts displayable messages from raw conversation history', () => {
  it('extracts player action text from user messages containing text content blocks', () => {
    fc.assert(
      fc.property(userMessageWithTextArb, (msg) => {
        const result = parseMessages([msg])
        expect(result).toHaveLength(1)
        expect(result[0].role).toBe('user')

        const expectedText = msg.content
          .filter(isTextContent)
          .map((b) => b.text)
          .join('')
        expect(result[0].text).toBe(expectedText)
      }),
      { numRuns: 100 },
    )
  })

  it('extracts StoryOutput data from assistant messages with StoryOutput toolUse', () => {
    fc.assert(
      fc.property(assistantWithStoryArb, (msg) => {
        const result = parseMessages([msg])
        expect(result).toHaveLength(1)
        expect(result[0].role).toBe('assistant')
        expect(result[0].storyOutput).toBeDefined()

        const storyBlock = msg.content
          .filter(isToolUseContent)
          .find((b) => b.toolUse.name === 'StoryOutput')!
        expect(result[0].storyOutput).toEqual(storyBlock.toolUse.input)
      }),
      { numRuns: 100 },
    )
  })

  it('filters out intermediate tool calls (non-StoryOutput toolUse blocks)', () => {
    fc.assert(
      fc.property(assistantNoStoryArb, (msg) => {
        const result = parseMessages([msg])
        expect(result).toHaveLength(0)
      }),
      { numRuns: 100 },
    )
  })

  it('preserves the chronological order of the original raw messages', () => {
    fc.assert(
      fc.property(rawMessagesArb, (messages) => {
        const result = parseMessages(messages)

        // Build expected order: indices of messages that should produce output
        const expectedIndices = messages
          .map((msg, i) => ({ msg, i }))
          .filter(({ msg }) => hasUserText(msg) || hasStoryOutput(msg))
          .map(({ i }) => i)

        expect(result).toHaveLength(expectedIndices.length)

        // Verify roles match the expected source messages in order
        result.forEach((parsed, idx) => {
          const sourceMsg = messages[expectedIndices[idx]]
          expect(parsed.role).toBe(sourceMsg.role)
        })
      }),
      { numRuns: 100 },
    )
  })

  it('returns only ParsedMessages that have either player text or a StoryOutput', () => {
    fc.assert(
      fc.property(rawMessagesArb, (messages) => {
        const result = parseMessages(messages)

        for (const parsed of result) {
          const hasText = parsed.text !== undefined && parsed.text !== ''
          const hasStory = parsed.storyOutput !== undefined
          expect(hasText || hasStory).toBe(true)
        }
      }),
      { numRuns: 100 },
    )
  })
})
