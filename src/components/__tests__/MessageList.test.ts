import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageList from '../MessageList.vue'
import type { ParsedMessage } from '@/types'

function mountList(props: { messages: ParsedMessage[]; loading: boolean; error: string | null }) {
  return mount(MessageList, { props })
}

const userMsg: ParsedMessage = {
  role: 'user',
  text: 'I open the ancient door',
}

const assistantMsg: ParsedMessage = {
  role: 'assistant',
  storyOutput: {
    response: 'The door creaks open revealing a dark chamber.',
    actions_suggestions: ['Enter the chamber', 'Call out'],
    destails: '',
    dice_rolls: [],
  },
}

const assistantMsgWithDice: ParsedMessage = {
  role: 'assistant',
  storyOutput: {
    response: 'You swing your sword at the goblin.',
    actions_suggestions: [],
    destails: '',
    dice_rolls: [
      { dice_type: 'd20', result: '17', reason: 'Attack roll' },
      { dice_type: 'd6', result: '4', reason: 'Damage roll' },
    ],
  },
}

describe('MessageList', () => {
  it('shows loading indicator when loading is true', () => {
    const wrapper = mountList({ messages: [], loading: true, error: null })
    expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading story')
  })

  it('shows error message when error prop is set', () => {
    const wrapper = mountList({ messages: [], loading: false, error: 'Network error' })
    expect(wrapper.find('.list-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Story history could not be loaded')
  })

  it('shows empty state when messages array is empty', () => {
    const wrapper = mountList({ messages: [], loading: false, error: null })
    expect(wrapper.text()).toContain('No messages yet')
  })

  it('renders user message with player text', () => {
    const wrapper = mountList({ messages: [userMsg], loading: false, error: null })
    expect(wrapper.text()).toContain('I open the ancient door')
    expect(wrapper.find('.message-user').exists()).toBe(true)
    expect(wrapper.find('.user-text').exists()).toBe(true)
  })

  it('renders assistant message with narrative response', () => {
    const wrapper = mountList({ messages: [assistantMsg], loading: false, error: null })
    expect(wrapper.text()).toContain('The door creaks open revealing a dark chamber.')
    expect(wrapper.find('.message-assistant').exists()).toBe(true)
    expect(wrapper.find('.narrative-text').exists()).toBe(true)
  })

  it('renders DiceDisplay for each dice roll in assistant message', () => {
    const wrapper = mountList({ messages: [assistantMsgWithDice], loading: false, error: null })
    const diceDisplays = wrapper.findAll('.dice-display')
    expect(diceDisplays).toHaveLength(2)
    expect(wrapper.text()).toContain('d20')
    expect(wrapper.text()).toContain('17')
    expect(wrapper.text()).toContain('d6')
    expect(wrapper.text()).toContain('4')
  })

  it('renders multiple messages in order', () => {
    const wrapper = mountList({
      messages: [userMsg, assistantMsg],
      loading: false,
      error: null,
    })
    const entries = wrapper.findAll('.message-entry')
    expect(entries).toHaveLength(2)
    expect(entries[0].classes()).toContain('message-user')
    expect(entries[1].classes()).toContain('message-assistant')
  })

  it('applies parchment theme classes to the container', () => {
    const wrapper = mountList({ messages: [], loading: false, error: null })
    const container = wrapper.find('.message-list')
    expect(container.classes()).toContain('panel-parchment')
    expect(container.classes()).toContain('border-wood')
    expect(container.classes()).toContain('shadow-panel')
  })
})
