<template>
  <form class="player-input" @submit.prevent="handleSubmit">
    <input
      v-model="message"
      type="text"
      class="player-input-field"
      placeholder="Type your action..."
      :disabled="disabled"
    />
    <button type="submit" class="player-input-btn" :disabled="disabled || !hasContent">
      Send
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  submit: [message: string]
}>()

const message = ref('')
const hasContent = computed(() => message.value.trim().length > 0)

function handleSubmit() {
  const trimmed = message.value.trim()
  if (!trimmed) return
  emit('submit', trimmed)
  message.value = ''
}
</script>

<style scoped>
.player-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background-color: #f0ece8;
  padding: 0.75rem 1rem;
  border-radius: 12px;
}

.player-input-field {
  flex: 1;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: var(--color-bg-card);
  color: var(--color-ink);
  transition: border-color 0.2s ease;
}

.player-input-field:focus {
  outline: none;
  border-color: #999;
}

.player-input-field::placeholder {
  color: #999;
}

.player-input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.player-input-btn {
  padding: 0.6rem 1.25rem;
  font-family: var(--font-ui);
  font-size: 1rem;
  color: #fff;
  background-color: #5a7d9a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.player-input-btn:hover:not(:disabled) {
  background-color: #4a6d8a;
}

.player-input-btn:active:not(:disabled) {
  background-color: #3a5d7a;
}

.player-input-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
