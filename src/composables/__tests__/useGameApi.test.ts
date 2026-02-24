import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameApi } from '../useGameApi'

const SERVER_URL = 'http://localhost:3000'

function mockFetch(response: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  })
}

describe('useGameApi', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('sendInquiry', () => {
    it('sends POST to /inquire and unwraps StoryOutput from response', async () => {
      const storyOutput = {
        response: 'You enter a dark cave.',
        actions_suggestions: ['Look around', 'Light a torch'],
        destails: 'none',
        dice_rolls: [],
      }
      globalThis.fetch = mockFetch({ response: storyOutput })

      const { sendInquiry } = useGameApi(SERVER_URL)
      const result = await sendInquiry('What do I see?')

      expect(globalThis.fetch).toHaveBeenCalledWith(`${SERVER_URL}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What do I see?' }),
      })
      expect(result).toEqual(storyOutput)
    })

    it('sets loading to true during request and false after', async () => {
      const storyOutput = {
        response: 'ok',
        actions_suggestions: [],
        destails: '',
        dice_rolls: [],
      }
      globalThis.fetch = mockFetch({ response: storyOutput })

      const { sendInquiry, loading } = useGameApi(SERVER_URL)
      expect(loading.value).toBe(false)

      const promise = sendInquiry('test')
      // loading is set synchronously before await
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })

    it('sets error on failure and throws', async () => {
      globalThis.fetch = mockFetch({}, false, 500)

      const { sendInquiry, error, loading } = useGameApi(SERVER_URL)

      await expect(sendInquiry('test')).rejects.toThrow('Request failed with status 500')
      expect(error.value).toBe('Request failed with status 500')
      expect(loading.value).toBe(false)
    })

    it('handles network errors', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      const { sendInquiry, error } = useGameApi(SERVER_URL)

      await expect(sendInquiry('test')).rejects.toThrow('Failed to fetch')
      expect(error.value).toBe('Failed to fetch')
    })
  })

  describe('fetchUser', () => {
    it('sends GET to /user/{userName} and returns CharacterStats', async () => {
      const stats = {
        name: 'Gandalf',
        gender: 'Male',
        race: 'Human',
        characterClass: 'Wizard',
        level: 20,
        hp: 100,
      }
      globalThis.fetch = mockFetch(stats)

      const { fetchUser } = useGameApi(SERVER_URL)
      const result = await fetchUser('Gandalf')

      expect(globalThis.fetch).toHaveBeenCalledWith(`${SERVER_URL}/user/Gandalf`)
      expect(result).toEqual(stats)
    })

    it('sets error on failure and throws', async () => {
      globalThis.fetch = mockFetch({}, false, 404)

      const { fetchUser, error } = useGameApi(SERVER_URL)

      await expect(fetchUser('Nobody')).rejects.toThrow('Request failed with status 404')
      expect(error.value).toBe('Request failed with status 404')
    })
  })

  describe('fetchMessages', () => {
    it('sends GET to /messages and parses raw messages', async () => {
      const rawMessages = [
        { role: 'user', content: [{ text: 'I attack the goblin' }] },
        {
          role: 'assistant',
          content: [
            {
              toolUse: {
                toolUseId: '1',
                name: 'StoryOutput',
                input: {
                  response: 'You swing your sword!',
                  actions_suggestions: ['Dodge', 'Attack again'],
                  destails: 'combat',
                  dice_rolls: [{ dice_type: 'd20', result: '18', reason: 'attack roll' }],
                },
              },
            },
          ],
        },
      ]
      globalThis.fetch = mockFetch(rawMessages)

      const { fetchMessages } = useGameApi(SERVER_URL)
      const result = await fetchMessages()

      expect(globalThis.fetch).toHaveBeenCalledWith(`${SERVER_URL}/messages`)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ role: 'user', text: 'I attack the goblin' })
      expect(result[1].role).toBe('assistant')
      expect(result[1].storyOutput?.response).toBe('You swing your sword!')
    })

    it('filters out non-StoryOutput tool calls', async () => {
      const rawMessages = [
        {
          role: 'assistant',
          content: [
            {
              toolUse: {
                toolUseId: '1',
                name: 'roll_dice',
                input: { sides: 20 },
              },
            },
          ],
        },
      ]
      globalThis.fetch = mockFetch(rawMessages)

      const { fetchMessages } = useGameApi(SERVER_URL)
      const result = await fetchMessages()

      expect(result).toHaveLength(0)
    })

    it('sets error on failure and throws', async () => {
      globalThis.fetch = mockFetch({}, false, 503)

      const { fetchMessages, error } = useGameApi(SERVER_URL)

      await expect(fetchMessages()).rejects.toThrow('Request failed with status 503')
      expect(error.value).toBe('Request failed with status 503')
    })
  })

  describe('error clearing', () => {
    it('clears previous error when a new request starts', async () => {
      globalThis.fetch = mockFetch({}, false, 500)
      const { sendInquiry, error } = useGameApi(SERVER_URL)

      await expect(sendInquiry('test')).rejects.toThrow()
      expect(error.value).toBe('Request failed with status 500')

      const storyOutput = {
        response: 'ok',
        actions_suggestions: [],
        destails: '',
        dice_rolls: [],
      }
      globalThis.fetch = mockFetch({ response: storyOutput })
      await sendInquiry('test2')
      expect(error.value).toBeNull()
    })
  })
})
