<template>
  <div v-if="suggestions.length > 0" class="action-suggestions">
    <div class="suggestions-list">
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-btn"
        :disabled="disabled"
        @click="emit('select', suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  suggestions: string[]
  disabled: boolean
}>()

const emit = defineEmits<{
  select: [action: string]
}>()
</script>

<style scoped>
.action-suggestions {
  padding: 0.5rem 0;
}

.suggestions-list {
  display: flex;
  /* flex-direction: column; */
  gap: 0.5rem;
  flex-wrap: wrap;
}

.suggestion-btn {
  font-family: var(--font-ui);
  /* font-size: 0.95rem; */
  padding: 0.6rem 1rem;
  color: var(--color-ink);
  background-color: var(--color-bg-card);
  border: 1px solid #ccc;
  /* border-radius: 8px; */
  border-radius: 1rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.suggestion-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #999;
}

.suggestion-btn:active:not(:disabled) {
  background-color: #eee;
}

.suggestion-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
