<template>
  <div class="message-list panel-parchment border-wood shadow-panel">
    <div v-if="loading" class="list-status">
      <span class="loading-indicator">Loading story…</span>
    </div>

    <div v-else-if="error" class="list-status list-error">
      Story history could not be loaded
    </div>

    <div v-else-if="messages.length === 0" class="list-status">
      No messages yet
    </div>

    <div v-else class="messages-scroll">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-entry"
        :class="[msg.role === 'user' ? 'message-user' : 'message-assistant', msg.role === 'assistant' && msg.storyOutput?.dice_rolls?.length ? 'has-dice' : '']"
      >
        <!-- User message -->
        <div v-if="msg.role === 'user' && msg.text" class="user-bubble">
          <span class="role-tag">You</span>
          <p class="user-text">{{ msg.text }}</p>
        </div>

        <!-- Assistant message -->
        <div v-if="msg.role === 'assistant' && msg.storyOutput" class="assistant-block">
          <span class="role-tag">Game Master</span>
          <div class="narrative-text" v-html="renderMarkdown(msg.storyOutput.response)"></div>

          <div
            v-if="msg.storyOutput.dice_rolls && msg.storyOutput.dice_rolls.length > 0"
            class="dice-rolls"
          >
            <DiceDisplay
              v-for="(roll, rIdx) in msg.storyOutput.dice_rolls"
              :key="rIdx"
              :dice-type="roll.dice_type"
              :result="roll.result"
              :reason="roll.reason"
            />
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="typing" class="message-entry message-assistant">
        <div class="assistant-block">
          <span class="role-tag">Game Master</span>
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ParsedMessage } from '@/types'
import DiceDisplay from '@/components/DiceDisplay.vue'

// Configure marked for inline-friendly output
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps<{
  messages: ParsedMessage[]
  loading: boolean
  error: string | null
  typing?: boolean
}>()

function renderMarkdown(text: string): string {
  return marked.parse(text) as string
}
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0;
}

.list-status {
  font-family: var(--font-body);
  text-align: center;
  color: var(--color-ink-light);
  padding: 2rem 0;
}

.list-error {
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

.messages-scroll {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-entry {
  border-radius: 8px;
  padding: 0;
  max-width: 85%;
  width: 85%;
}

.message-entry.has-dice {
  margin-bottom: 25px;
}

.message-user {
  align-self: flex-end;
  background-color: #dfc8a0;
  border: solid 1px #b8a178;
}

.message-assistant {
  align-self: flex-start;
  position: relative;
  background-color: rgb(245 241 235 / 50%);
  box-shadow: inset 0em 0em 0.5em 0 rgba(0, 0, 0, 0.2);
  border: solid 1px #b8a178;
  overflow: visible;
}

.user-bubble {
  padding: 1rem 1.25rem;
}

.assistant-block {
  padding: 1.25rem 1.5rem;
}

.role-tag {
  display: block;
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: var(--color-ink);
}

.user-text {
  font-family: var(--font-body);
  color: var(--color-ink);
  line-height: 1.5;
  font-style: normal;
}

.narrative-text {
  font-family: var(--font-body);
  color: var(--color-ink);
  line-height: 1.7;
}

.narrative-text :deep(p) {
  margin-bottom: 0.75rem;
}

.narrative-text :deep(p:last-child) {
  margin-bottom: 0;
}

.narrative-text :deep(strong) {
  font-weight: 700;
}

.narrative-text :deep(em) {
  font-style: italic;
}

.narrative-text :deep(ul),
.narrative-text :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.narrative-text :deep(li) {
  margin-bottom: 0.25rem;
}

.narrative-text :deep(h1),
.narrative-text :deep(h2),
.narrative-text :deep(h3) {
  font-family: var(--font-heading);
  margin: 0.75rem 0 0.35rem;
}

.narrative-text :deep(blockquote) {
  border-left: 3px solid var(--color-gold);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  font-style: italic;
  color: var(--color-ink-light);
}

.narrative-text :deep(hr) {
  border: none;
  border-top: 1px solid #d5cec4;
  margin: 0.75rem 0;
}

.dice-rolls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
  /* margin-bottom: -40px; */
  margin-bottom: calc(-25px - 1.25rem);
  padding-bottom: 0;
  /* transform: translateY(40px); */
  position: relative;
  z-index: 2;
}

.typing-indicator {
  display: flex;
  gap: 0.35rem;
  padding: 0.25rem 0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-ink-light);
  animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
