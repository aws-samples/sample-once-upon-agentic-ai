<template>
  <div class="character-stats-panel panel-parchment border-gold shadow-panel">
    <div v-if="loading" class="panel-status">
      <span class="loading-indicator">Loading stats…</span>
    </div>

    <div v-else-if="error" class="panel-status panel-error">
      {{ error }}
    </div>

    <div v-else-if="!stats" class="panel-status">
      Character stats unavailable
    </div>

    <div v-else class="stats-content">
      <!-- Portrait with scroll unroll reveal -->
      <div class="portrait-scroll" :class="{ 'scroll-revealed': revealed }">
        <!-- Top scroll rod -->
        <div class="scroll-rod scroll-rod--top"></div>
        <!-- Bottom scroll rod -->
        <div class="scroll-rod scroll-rod--bottom"></div>
        <!-- The portrait itself, clipped by the scroll -->
        <div class="portrait-placeholder">
          <img :src="`${baseUrl}avatar-placeholder.jpeg`" alt="Character portrait" class="portrait-image" />
          <!-- Parchment overlay that fades out -->
          <div class="scroll-overlay"></div>
        </div>
      </div>

      <div class="character-name"><span class="stat-label">NAME: </span><span class="stat-value">{{ stats.name }}</span></div>

      <!-- Identity card -->
      <div class="stat-section">
        <h3 class="section-header">Identity</h3>
        <div class="stat-row">
          <span class="stat-label">GENDER:</span>
          <span class="stat-value">{{ stats.gender }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">RACE:</span>
          <span class="stat-value">{{ stats.race }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">CLASS:</span>
          <span class="stat-value">{{ stats.character_class }}</span>
        </div>
      </div>

      <!-- Vitals card -->
      <div class="stat-section">
        <h3 class="section-header">Vitals</h3>
        <div class="stat-row">
          <span class="stat-label">LEVEL:</span>
          <span class="stat-value stat-number">{{ stats.level }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">XP:</span>
          <span class="stat-value stat-number">{{ stats.experience }}</span>
        </div>
      </div>

      <!-- Ability scores -->
      <div class="ability-section">
        <div class="ability-box">
          <span class="ability-label">STRENGTH</span>
          <span class="ability-value">{{ stats.stats.strength }}</span>
        </div>
        <div class="ability-box">
          <span class="ability-label">DEXTERITY</span>
          <span class="ability-value">{{ stats.stats.dexterity }}</span>
        </div>
        <div class="ability-box">
          <span class="ability-label">CONSTITUTION</span>
          <span class="ability-value">{{ stats.stats.constitution }}</span>
        </div>
        <div class="ability-box">
          <span class="ability-label">INTELLIGENCE</span>
          <span class="ability-value">{{ stats.stats.intelligence }}</span>
        </div>
        <div class="ability-box">
          <span class="ability-label">WISDOM</span>
          <span class="ability-value">{{ stats.stats.wisdom }}</span>
        </div>
        <div class="ability-box">
          <span class="ability-label">CHARISMA</span>
          <span class="ability-value">{{ stats.stats.charisma }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { CharacterStats } from '@/types'

const baseUrl = import.meta.env.BASE_URL
const revealed = ref(false)

const props = defineProps<{
  stats: CharacterStats | null
  loading: boolean
  error: string | null
}>()

// Trigger the scroll animation when stats arrive and the portrait renders
watch(() => props.stats, (newStats) => {
  if (newStats && !revealed.value) {
    // Wait for Vue to render, then give the browser time to paint the closed state
    nextTick(() => {
      setTimeout(() => {
        revealed.value = true
      }, 300)
    })
  }
}, { immediate: true })
</script>

<style scoped>
.character-stats-panel {
  position: relative;
  padding: 1.5rem;
  min-width: 240px;
  /* Paper sheet look */
  background-color: #f8f5f0 !important;
  background-image: url('/textures/paper.png') !important;
  background-size: cover;
  border: 1px solid #d5cec4 !important;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.08) !important;
  border-radius: 4px;
  z-index: 1;
}

/* Stacked paper sheets behind the panel */
.character-stats-panel::before,
.character-stats-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #faf7f2;
  background-image: url('/textures/paper.png');
  background-size: cover;
  border: 1px solid #d5cec4;
  border-radius: 4px;
  z-index: -1;
}

.character-stats-panel::before {
  transform: rotate(-1.5deg);
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.06);
}

.character-stats-panel::after {
  transform: rotate(1deg);
  background-color: #f5f1eb;
  background-image: url('/textures/paper.png');
  background-size: cover;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.04);
}

.panel-status {
  font-family: var(--font-handwriting);
  text-align: center;
  color: var(--color-ink-light);
  padding: 1rem 0;
  font-size: 1.2rem;
}

.panel-error {
  color: var(--color-red-accent);
}

.loading-indicator {
  display: inline-block;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.portrait-placeholder {
  width: 150px;
  height: 180px;
  margin: 0 auto;
  border-radius: 8px;
  border: 2px solid #c4b5a3;
  background: linear-gradient(135deg, #c4b5a3, #a89682);
  overflow: hidden;
  position: relative;
}

.portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* --- Scroll unroll reveal --- */
.portrait-scroll {
  position: relative;
  width: 150px;
  margin: 0 auto;
}

/* The portrait clips from a thin center bar to full height */
.portrait-scroll .portrait-placeholder {
  clip-path: inset(48% 0 48% 0);
  transition: clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.portrait-scroll.scroll-revealed .portrait-placeholder {
  clip-path: inset(0 0 0 0);
}

/* Parchment overlay fades out as scroll opens */
.scroll-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    #e8dcc8 0%,
    #d4c4a8 20%,
    transparent 50%,
    #d4c4a8 80%,
    #e8dcc8 100%
  );
  opacity: 1;
  transition: opacity 0.8s ease 0.4s;
  pointer-events: none;
  border-radius: 8px;
}

.scroll-revealed .scroll-overlay {
  opacity: 0;
}

/* Wooden scroll rods */
.scroll-rod {
  position: absolute;
  left: -6px;
  right: -6px;
  height: 10px;
  background: linear-gradient(180deg, #a0845c 0%, #7a6340 40%, #5c4a2e 100%);
  border-radius: 5px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-rod::before,
.scroll-rod::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 14px;
  height: 16px;
  background: linear-gradient(180deg, #b8975a, #7a6340);
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.scroll-rod::before { left: -4px; }
.scroll-rod::after { right: -4px; }

.scroll-rod--top {
  top: 85px; /* starts at center */
  transition: top 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-rod--bottom {
  top: 85px; /* starts at center */
  transition: top 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-revealed .scroll-rod--top {
  top: -5px;
}

.scroll-revealed .scroll-rod--bottom {
  top: 175px;
}

.character-name {
  text-align: center;
  font-family: var(--font-handwriting);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-ink);
}

.stat-section {
  background: transparent;
  border-radius: 0;
  padding: 0 0.25rem;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 0.75rem;
}

.section-header {
  font-family: var(--font-handwriting);
  color: var(--color-ink-light);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
  /* Visually hidden but still in DOM for tests */
  height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
  position: absolute;
  width: 1px;
  clip: rect(0, 0, 0, 0);
}

.stat-row {
  display: block;
  padding: 0.1rem 0;
  font-size: 1.15rem;
  line-height: 1.6;
}

.stat-label {
  font-family: var(--font-handwriting);
  font-weight: 600;
  color: #555;
  font-size: 1.1rem;
  margin-right: 0.25rem;
}

.stat-value {
  font-family: var(--font-handwriting);
  color: var(--color-ink);
  font-size: 1.15rem;
}

.stat-number {
  font-weight: 700;
}

.hp-value {
  color: var(--color-red-deep);
}

.ability-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.ability-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d5cec4;
  border-radius: 4px;
  background: #faf7f2;
}

.ability-label {
  font-family: var(--font-handwriting);
  font-weight: 600;
  font-size: 1.05rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ability-value {
  font-family: var(--font-handwriting);
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-ink);
}
</style>
