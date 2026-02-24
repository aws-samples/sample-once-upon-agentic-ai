<template>
  <span class="dice-display">
    <!-- SVG loaded successfully -->
    <span v-if="!svgFailed" class="dice-svg-container">
      <span class="dice-image-wrapper" :class="{ 'dice-roll-in': animate }">
        <img
          :src="`${baseUrl}dice/${diceType}.svg`"
          :alt="`${diceType} dice`"
          class="dice-svg"
          :class="{ 'dice-tumble': animate }"
          @error="svgFailed = true"
        />
        <span class="dice-result-overlay" :class="{ 'dice-result-reveal': animate, 'dice-result-hidden': !animate }">{{ result }}</span>
      </span>
    </span>

    <!-- CSS fallback when SVG fails to load -->
    <span v-else class="dice-fallback">
      <span class="dice-fallback-shape" :class="{ 'dice-roll-in': animate }" :style="{ backgroundColor: diceColor }">
        <span class="dice-fallback-result" :class="{ 'dice-result-reveal': animate, 'dice-result-hidden': !animate }">{{ result }}</span>
      </span>
    </span>

    <!-- Custom tooltip -->
    <span v-if="reason" class="dice-tooltip">{{ reason }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const baseUrl = import.meta.env.BASE_URL

const props = defineProps<{
  diceType: string
  result: string
  reason: string
}>()

const svgFailed = ref(false)
const animate = ref(false)

onMounted(() => {
  // Small delay so the browser paints the initial state first
  requestAnimationFrame(() => {
    animate.value = true
  })
})

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
  white-space: nowrap;
  width: max-content;
  max-width: 360px;
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

/* --- Dice roll animations --- */

/* Hide result number until animation triggers */
.dice-result-hidden {
  opacity: 0;
}

/* Bounce-in: the whole dice container drops in and bounces */
.dice-roll-in {
  animation: diceRollIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes diceRollIn {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-30px);
  }
  50% {
    opacity: 1;
    transform: scale(1.15) translateY(4px);
  }
  70% {
    transform: scale(0.95) translateY(-2px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

/* Tumble: the dice image spins while settling */
.dice-tumble {
  animation: diceTumble 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes diceTumble {
  0% {
    transform: rotate(-540deg) scale(0.8);
    filter: blur(2px);
  }
  60% {
    transform: rotate(20deg) scale(1.05);
    filter: blur(0);
  }
  80% {
    transform: rotate(-8deg) scale(0.98);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

/* Result reveal: the number fades in after the tumble finishes */
.dice-result-reveal {
  animation: diceResultReveal 0.4s ease-out 0.7s both;
}

@keyframes diceResultReveal {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.8);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Fallback result uses same reveal but without the translate offset */
.dice-fallback-result.dice-result-reveal {
  animation: diceFallbackReveal 0.4s ease-out 0.7s both;
}

@keyframes diceFallbackReveal {
  0% {
    opacity: 0;
    transform: scale(1.8);
  }
  60% {
    opacity: 1;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
