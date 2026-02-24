import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'rpg-gm-server-url'

export const useGameStore = defineStore('game', () => {
  const serverUrl = ref(localStorage.getItem(STORAGE_KEY) ?? '')
  const characterName = ref('')

  const isInitialized = computed(() => serverUrl.value !== '' && characterName.value !== '')

  function setConnection(url: string, name: string) {
    serverUrl.value = url
    characterName.value = name
    localStorage.setItem(STORAGE_KEY, url)
  }

  function reset() {
    serverUrl.value = ''
    characterName.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    serverUrl,
    characterName,
    isInitialized,
    setConnection,
    reset,
  }
})
