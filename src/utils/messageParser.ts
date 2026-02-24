import type { ContentBlock, RawMessage, ParsedMessage, StoryOutput, TextContent, ToolUseContent } from '../types'

function isTextContent(block: ContentBlock): block is TextContent {
  return 'text' in block
}

function isToolUseContent(block: ContentBlock): block is ToolUseContent {
  return 'toolUse' in block
}

export function parseMessages(rawMessages: RawMessage[]): ParsedMessage[] {
  const result: ParsedMessage[] = []

  for (const msg of rawMessages) {
    if (msg.role === 'user') {
      const text = msg.content
        .filter(isTextContent)
        .map((block) => block.text)
        .join('')

      if (text) {
        result.push({ role: 'user', text })
      }
    } else if (msg.role === 'assistant') {
      const storyBlock = msg.content
        .filter(isToolUseContent)
        .find((block) => block.toolUse.name === 'StoryOutput')

      if (storyBlock) {
        result.push({
          role: 'assistant',
          storyOutput: storyBlock.toolUse.input as unknown as StoryOutput,
        })
      }
    }
  }

  // Drop the first user message (character creation init prompt)
  const firstUserIndex = result.findIndex((m) => m.role === 'user')
  if (firstUserIndex !== -1) {
    result.splice(firstUserIndex, 1)
  }

  return result
}
