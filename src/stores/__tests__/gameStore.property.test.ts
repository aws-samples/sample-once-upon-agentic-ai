import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as fc from 'fast-check'
import { useGameStore } from '../gameStore'

/**
 * Property 11: State persistence across route transitions
 * Validates: Requirements 8.3
 *
 * For any server URL and character name stored via `setConnection`,
 * reading those values from the store after a route transition
 * should return the same values.
 */

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

/** Arbitrary that generates URLs starting with http:// or https:// */
const urlArb = fc.oneof(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  fc
    .string({ minLength: 1, maxLength: 50 })
    .map((s) => (Math.random() > 0.5 ? 'http://' : 'https://') + s),
)

/** Arbitrary for character names — non-empty strings */
const characterNameArb = fc.string({ minLength: 1, maxLength: 60 }).filter(
  (s) => s.trim().length > 0,
)

describe('Property 11: State persistence across route transitions', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('serverUrl and characterName persist after setConnection', () => {
    fc.assert(
      fc.property(urlArb, characterNameArb, (serverUrl, characterName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()

        store.setConnection(serverUrl, characterName)

        // Simulate reading values as would happen after a route transition
        // (Pinia store is a singleton within the same app instance)
        const storeAgain = useGameStore()

        expect(storeAgain.serverUrl).toBe(serverUrl)
        expect(storeAgain.characterName).toBe(characterName)
      }),
      { numRuns: 100 },
    )
  })

  it('isInitialized is true when both serverUrl and characterName are non-empty', () => {
    fc.assert(
      fc.property(urlArb, characterNameArb, (serverUrl, characterName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()

        store.setConnection(serverUrl, characterName)

        const storeAgain = useGameStore()
        expect(storeAgain.isInitialized).toBe(true)
      }),
      { numRuns: 100 },
    )
  })

  it('isInitialized is false when serverUrl is empty', () => {
    fc.assert(
      fc.property(characterNameArb, (characterName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()

        store.setConnection('', characterName)

        const storeAgain = useGameStore()
        expect(storeAgain.isInitialized).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('isInitialized is false when characterName is empty', () => {
    fc.assert(
      fc.property(urlArb, (serverUrl) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()

        store.setConnection(serverUrl, '')

        const storeAgain = useGameStore()
        expect(storeAgain.isInitialized).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('values survive reset followed by a new setConnection', () => {
    fc.assert(
      fc.property(
        urlArb,
        characterNameArb,
        urlArb,
        characterNameArb,
        (url1, name1, url2, name2) => {
          localStorageMock.clear()
          setActivePinia(createPinia())
          const store = useGameStore()

          store.setConnection(url1, name1)
          expect(store.serverUrl).toBe(url1)
          expect(store.characterName).toBe(name1)

          store.reset()
          expect(store.serverUrl).toBe('')
          expect(store.characterName).toBe('')
          expect(store.isInitialized).toBe(false)

          store.setConnection(url2, name2)

          const storeAgain = useGameStore()
          expect(storeAgain.serverUrl).toBe(url2)
          expect(storeAgain.characterName).toBe(name2)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('serverUrl is restored from localStorage after store recreation', () => {
    fc.assert(
      fc.property(urlArb, (serverUrl) => {
        localStorageMock.clear()
        localStorageMock.getItem.mockImplementation((key: string) => {
          if (key === 'rpg-gm-server-url') return serverUrl
          return null
        })
        setActivePinia(createPinia())
        const store = useGameStore()
        expect(store.serverUrl).toBe(serverUrl)
        // Reset mock to default behavior
        localStorageMock.getItem.mockImplementation((key: string) => {
          const s: Record<string, string> = {}
          return s[key] ?? null
        })
      }),
      { numRuns: 100 },
    )
  })
})
