import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerInput from '../PlayerInput.vue'

function mountInput(disabled = false) {
  return mount(PlayerInput, { props: { disabled } })
}

describe('PlayerInput', () => {
  it('renders a text input and submit button', () => {
    const wrapper = mountInput()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Send')
  })

  it('emits submit with trimmed message on form submit', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('  Attack the dragon  ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0]).toEqual(['Attack the dragon'])
  })

  it('clears input after submit', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('Cast fireball')
    await wrapper.find('form').trigger('submit')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('does not emit submit when input is empty', async () => {
    const wrapper = mountInput()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('does not emit submit when input is only whitespace', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('disables input and button when disabled prop is true', () => {
    const wrapper = mountInput(true)
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
    expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('enables input and button when disabled prop is false', () => {
    const wrapper = mountInput(false)
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(false)
    expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(false)
  })
})
