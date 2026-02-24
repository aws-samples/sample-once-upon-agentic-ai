<template>
  <span class="dice-display" :title="reason">
    <!-- SVG loaded successfully -->
    <span v-if="!svgFailed" class="dice-svg-container">
      <span class="dice-image-wrapper">
        <img
          :src="`${baseUrl}dice/${diceType}.svg`"
          :alt="`${diceType} dice`"
          class="dice-svg"
          @error="svgFailed = true"
        />
        <span class="dice-result-overlay">{{ result }}</span>
      </span>
    </span>

    <!-- CSS fallback when SVG fails to load -->
    <span v-else class="dice-fallback">
      <span class="dice-fallback-shape" :style="{ backgroundColor: diceColor }">
        <span class="dice-fallback-result">{{ result }}</span>
      </span>
    </span>

    <!-- Custom tooltip -->
    <span v-if="reason" class="dice-tooltip">{{ reason }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const baseUrl = import.meta.env.BASE_URL

const props = defineProps<{
  diceType: string
  result: string
  reason: string
}>()

const svgFailed = ref(false)

const diceColorMap: Record<string, string> = {
  d4: '#e74c3c',
  d6: '#27ae60',
  d8: '#2980b9',
  d10: '#8e44ad',
  d12: '#e67e22',
  d20: '#e74c3c',
  d100: '#16a085',
}

const diceColor = computed(() => diceColorMap[props.diceType] || '#7f8c8d')
</script>

<style scoped>
.dice-display {
  display: inline-flex;
  align-items: center;
  cursor: default;
  padding: 0.15rem;
  position: relative;
}

/* --- SVG image path --- */
.dice-svg-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.dice-image-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
}

.dice-svg {
  /* width: 100%;
  height: 100%; */
  width: 50px;
  height: auto;
  object-fit: contain;
}

.dice-result-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-ui);
  font-weight: 900;
  font-size: 1.4rem;
  color: #1a1a1a;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* --- CSS fallback path --- */
.dice-fallback {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.dice-fallback-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 3px solid #333;
}

.dice-fallback-result {
  font-family: var(--font-ui);
  font-weight: 900;
  font-size: 1.6rem;
  color: #1a1a1a;
}

/* --- Custom tooltip --- */
.dice-tooltip {
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  background-color: #2c2c2c;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  white-space: normal;
  max-width: 220px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.dice-display:hover .dice-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
