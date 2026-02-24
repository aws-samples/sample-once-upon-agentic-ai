import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import NewGameView from '@/views/NewGameView.vue'
import GameView from '@/views/GameView.vue'
import { useGameStore } from '@/stores/gameStore'



function createTestRouter(pinia: ReturnType<typeof createPinia>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'new-game', component: NewGameView },
      { path: '/game/:characterName', name: 'game', component: GameView },
    ],
  })

  router.beforeEach((to) => {
    if (to.name === 'game') {
      const store = useGameStore(pinia)
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

const AppWrapper = defineComponent({
  setup() {
    return () => h('div', { id: 'app' }, [h(resolveComponent('RouterView'))])
  },
})


import { resolveComponent } from 'vue'

describe('Navigation Integration', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    localStorage.clear()
  })

  describe('Character creation → navigation to /game/:characterName', () => {
    it('navigates to /game/Gandalf after successful character creation', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const router = createTestRouter(pinia)

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/inquire')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                response: {
                  response: 'Welcome, brave adventurer!',
                  actions_suggestions: ['Look around', 'Talk to innkeeper'],
                  destails: '',
                  dice_rolls: [],
                },
              }),
          })
        }
        if (url.includes('/user/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                character_id: '1',
                name: 'Gandalf',
                character_class: 'Wizard',
                race: 'Human',
                gender: 'Male',
                level: 1,
                experience: 0,
                stats: {
                  strength: 10,
                  dexterity: 12,
                  constitution: 14,
                  intelligence: 18,
                  wisdom: 16,
                  charisma: 11,
                },
                inventory: [],
                created_at: '2024-01-01T00:00:00Z',
              }),
          })
        }
        if (url.includes('/messages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      router.push('/')
      await router.isReady()

      const wrapper = mount(AppWrapper, {
        global: {
          plugins: [pinia, router],
        },
      })

      await flushPromises()

      // Fill in all form fields
      await wrapper.find('#character-name').setValue('Gandalf')
      await wrapper.find('#gender').setValue('Male')
      await wrapper.find('#race').setValue('Human')
      await wrapper.find('#character-class').setValue('Wizard')
      await wrapper.find('#server-url').setValue('https://example.com')

      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      // Verify navigation to /game/Gandalf
      expect(router.currentRoute.value.path).toBe('/game/Gandalf')

      // Verify the store was updated
      const store = useGameStore(pinia)
      expect(store.serverUrl).toBe('https://example.com')
      expect(store.characterName).toBe('Gandalf')
      expect(store.isInitialized).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Redirect from /game/:characterName to / when not initialized', () => {
    it('redirects to / when navigating to /game/SomeChar without initialization', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const router = createTestRouter(pinia)

      // Navigate directly to /game/SomeChar without setting store values
      router.push('/game/SomeChar')
      await router.isReady()

      // The guard should have redirected to /
      expect(router.currentRoute.value.path).toBe('/')

      const wrapper = mount(AppWrapper, {
        global: {
          plugins: [pinia, router],
        },
      })

      await flushPromises()

      // Confirm we're on the NewGameView
      expect(wrapper.find('.new-game-view').exists()).toBe(true)

      wrapper.unmount()
    })
  })
})
