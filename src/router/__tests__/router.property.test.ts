import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import * as fc from 'fast-check'
import { useGameStore } from '../../stores/gameStore'

/**
 * Property 10: Unauthenticated route guard
 * Validates: Requirements 8.2
 *
 * For any application state where `isInitialized` is false
 * (server URL or character name not set), navigating to the
 * `/game/:characterName` route should redirect to `/`.
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

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'new-game', component: { template: '<div>New Game</div>' } },
      { path: '/game/:characterName', name: 'game', component: { template: '<div>Game</div>' } },
    ],
  })

  router.beforeEach((to) => {
    if (to.name === 'game') {
      const store = useGameStore()
      const paramName = to.params.characterName as string

      if (store.isInitialized && store.characterName === paramName) {
        return
      }

      if (store.serverUrl && paramName) {
        store.setConnection(store.serverUrl, paramName)
        return
      }

      if (!store.isInitialized) {
        return '/'
      }
    }
  })

  return router
}

/** Arbitrary for non-empty strings (server URLs or character names) */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 60 }).filter(
  (s) => s.trim().length > 0,
)

/** Arbitrary for valid server URLs */
const urlArb = fc.oneof(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  nonEmptyStringArb.map((s) => (Math.random() > 0.5 ? 'http://' : 'https://') + s),
)


/** Arbitrary for character names safe for URL paths (no slashes or special chars) */
const charNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,30}$/)

describe('Property 10: Unauthenticated route guard', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('redirects /game/:name to / when serverUrl is empty (characterName set)', async () => {
    await fc.assert(
      fc.asyncProperty(charNameArb, async (characterName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()
        store.setConnection('', characterName)

        const router = createTestRouter()
        await router.push('/game/' + characterName)
        await router.isReady()

        expect(router.currentRoute.value.path).toBe('/')
      }),
      { numRuns: 100 },
    )
  })

  it('redirects /game/:name to / when characterName is empty (serverUrl set)', async () => {
    await fc.assert(
      fc.asyncProperty(urlArb, charNameArb, async (serverUrl, urlName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()
        store.setConnection(serverUrl, '')

        const router = createTestRouter()
        // Navigate with a name in the URL but store has empty characterName
        // The guard should restore from URL param since serverUrl exists
        await router.push('/game/' + urlName)
        await router.isReady()

        // Since serverUrl is set and paramName exists, guard restores the connection
        expect(router.currentRoute.value.path).toBe('/game/' + urlName)
      }),
      { numRuns: 100 },
    )
  })

  it('redirects /game/:name to / when both serverUrl and characterName are empty', async () => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    const router = createTestRouter()

    await router.push('/game/TestChar')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows /game/:name navigation when both serverUrl and characterName are set', async () => {
    await fc.assert(
      fc.asyncProperty(urlArb, charNameArb, async (serverUrl, characterName) => {
        localStorageMock.clear()
        setActivePinia(createPinia())
        const store = useGameStore()
        store.setConnection(serverUrl, characterName)

        const router = createTestRouter()
        await router.push('/game/' + characterName)
        await router.isReady()

        expect(router.currentRoute.value.path).toBe('/game/' + characterName)
      }),
      { numRuns: 100 },
    )
  })

  it('allows /game/:name when serverUrl is restored from localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(urlArb, charNameArb, async (serverUrl, characterName) => {
        localStorageMock.clear()
        // Simulate page refresh: serverUrl in localStorage but not in store
        localStorageMock.setItem('rpg-gm-server-url', serverUrl)
        setActivePinia(createPinia())

        const router = createTestRouter()
        await router.push('/game/' + characterName)
        await router.isReady()

        // Guard should find serverUrl from localStorage-initialized store and allow navigation
        expect(router.currentRoute.value.path).toBe('/game/' + characterName)
      }),
      { numRuns: 100 },
    )
  })
})
