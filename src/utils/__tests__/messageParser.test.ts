import { describe, it, expect } from 'vitest'
import { parseMessages } from '../messageParser'
import type { RawMessage } from '../../types'

describe('parseMessages', () => {
  it('returns empty array for empty input', () => {
    expect(parseMessages([])).toEqual([])
  })

  it('extracts text from user messages', () => {
    const raw: RawMessage[] = [
      { role: 'user', content: [{ text: 'I attack the dragon' }] },
    ]
    const result = parseMessages(raw)
    expect(result).toEqual([{ role: 'user', text: 'I attack the dragon' }])
  })

  it('concatenates multiple text blocks in a user message', () => {
    const raw: RawMessage[] = [
      { role: 'user', content: [{ text: 'Hello ' }, { text: 'world' }] },
    ]
    const result = parseMessages(raw)
    expect(result).toEqual([{ role: 'user', text: 'Hello world' }])
  })

  it('extracts StoryOutput from assistant messages', () => {
    const storyInput = {
      response: 'The dragon roars!',
      actions_suggestions: ['Run', 'Fight'],
      destails: 'rolled dice',
      dice_rolls: [{ dice_type: 'd20', result: '15', reason: 'attack roll' }],
    }
    const raw: RawMessage[] = [
      {
        role: 'assistant',
        content: [
          {
            toolUse: {
              toolUseId: '123',
              name: 'StoryOutput',
              input: storyInput,
            },
          },
        ],
      },
    ]
    const result = parseMessages(raw)
    expect(result).toEqual([{ role: 'assistant', storyOutput: storyInput }])
  })

  it('filters out non-StoryOutput tool calls', () => {
    const raw: RawMessage[] = [
      {
        role: 'assistant',
        content: [
          {
            toolUse: {
              toolUseId: '1',
              name: 'a2a_list_discovered_agents',
              input: {},
            },
          },
          {
            toolUse: {
              toolUseId: '2',
              name: 'roll_dice',
              input: { dice: 'd20' },
            },
          },
          {
            toolUse: {
              toolUseId: '3',
              name: 'a2a_send_message',
              input: { msg: 'hi' },
            },
          },
        ],
      },
    ]
    const result = parseMessages(raw)
    expect(result).toEqual([])
  })

  it('skips user messages with no text content', () => {
    const raw: RawMessage[] = [
      {
        role: 'user',
        content: [
          { toolResult: { toolUseId: '1', status: 'success', content: [{ text: 'ok' }] } },
        ],
      },
    ]
    const result = parseMessages(raw)
    expect(result).toEqual([])
  })

  it('preserves chronological order', () => {
    const storyInput = {
      response: 'Welcome!',
      actions_suggestions: [],
      destails: '',
      dice_rolls: [],
    }
    const raw: RawMessage[] = [
      { role: 'user', content: [{ text: 'First' }] },
      {
        role: 'assistant',
        content: [
          { toolUse: { toolUseId: '1', name: 'StoryOutput', input: storyInput } },
        ],
      },
      { role: 'user', content: [{ text: 'Second' }] },
    ]
    const result = parseMessages(raw)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ role: 'user', text: 'First' })
    expect(result[1]).toEqual({ role: 'assistant', storyOutput: storyInput })
    expect(result[2]).toEqual({ role: 'user', text: 'Second' })
  })

  it('picks the first StoryOutput when multiple toolUse blocks exist', () => {
    const story1 = {
      response: 'First story',
      actions_suggestions: [],
      destails: '',
      dice_rolls: [],
    }
    const story2 = {
      response: 'Second story',
      actions_suggestions: [],
      destails: '',
      dice_rolls: [],
    }
    const raw: RawMessage[] = [
      {
        role: 'assistant',
        content: [
          { toolUse: { toolUseId: '1', name: 'roll_dice', input: {} } },
          { toolUse: { toolUseId: '2', name: 'StoryOutput', input: story1 } },
          { toolUse: { toolUseId: '3', name: 'StoryOutput', input: story2 } },
        ],
      },
    ]
    const result = parseMessages(raw)
    expect(result).toHaveLength(1)
    expect(result[0].storyOutput).toEqual(story1)
  })

  it('handles mixed content blocks in assistant messages', () => {
    const storyInput = {
      response: 'You enter the cave.',
      actions_suggestions: ['Look around'],
      destails: 'perception check',
      dice_rolls: [],
    }
    const raw: RawMessage[] = [
      {
        role: 'assistant',
        content: [
          { text: 'Thinking...' },
          { toolUse: { toolUseId: '1', name: 'a2a_send_message', input: {} } },
          { toolResult: { toolUseId: '1', status: 'success', content: [{ text: 'done' }] } },
          { toolUse: { toolUseId: '2', name: 'StoryOutput', input: storyInput } },
        ],
      },
    ]
    const result = parseMessages(raw)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ role: 'assistant', storyOutput: storyInput })
  })
})
