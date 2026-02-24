import { createRouter, createWebHistory } from 'vue-router'
import NewGameView from '../views/NewGameView.vue'
import GameView from '../views/GameView.vue'
import { useGameStore } from '../stores/gameStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'new-game',
      component: NewGameView,
    },
    {
      path: '/game/:characterName',
      name: 'game',
      component: GameView,
    },
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

export default router
