import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { useGameApi } from '../useGameApi'

/**
 * Property 8: Submitted text matches POST body with question field
 * Validates: Requirements 6.2, 7.2
 *
 * For any text string (whether from an action suggestion click or custom player input),
 * the HTTP POST request sent to `/inquire` should contain a JSON body
 * {"question": "<that exact text>"}.
 */

const SERVER_URL = 'http://localhost:3000'

const validStoryResponse = {
  response: {
    response: '',
    actions_suggestions: [],
    destails: '',
    dice_rolls: [],
  },
}

describe('Property 8: Submitted text matches POST body with question field', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends the exact text as the question field in the POST body for any string', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 200 }), async (text) => {
        const fetchMock = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(validStoryResponse),
        })
        globalThis.fetch = fetchMock

        const { sendInquiry } = useGameApi(SERVER_URL)
        await sendInquiry(text)

        expect(fetchMock).toHaveBeenCalledOnce()
        expect(fetchMock).toHaveBeenCalledWith(
          SERVER_URL + '/inquire',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text }),
          }),
        )
      }),
      { numRuns: 100 },
    )
  })
})
