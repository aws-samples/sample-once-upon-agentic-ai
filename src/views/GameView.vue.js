import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useGameApi } from '@/composables/useGameApi';
import CharacterStatsPanel from '@/components/CharacterStatsPanel.vue';
import MessageList from '@/components/MessageList.vue';
import ActionSuggestions from '@/components/ActionSuggestions.vue';
import PlayerInput from '@/components/PlayerInput.vue';
const route = useRoute();
const store = useGameStore();
const stats = ref(null);
const statsLoading = ref(false);
const statsError = ref(null);
const messages = ref([]);
const messagesLoading = ref(false);
const messagesError = ref(null);
const sending = ref(false);
const sendError = ref(null);
const latestSuggestions = computed(() => {
    for (let i = messages.value.length - 1; i >= 0; i--) {
        const msg = messages.value[i];
        if (msg.role === 'assistant' && msg.storyOutput?.actions_suggestions?.length) {
            return msg.storyOutput.actions_suggestions;
        }
    }
    return [];
});
async function handleAction(text) {
    const api = useGameApi(store.serverUrl);
    sending.value = true;
    sendError.value = null;
    // Show user message immediately
    messages.value = [...messages.value, { role: 'user', text }];
    try {
        const storyOutput = await api.sendInquiry(text);
        messages.value = [...messages.value, { role: 'assistant', storyOutput }];
    }
    catch (e) {
        sendError.value = e instanceof Error ? e.message : 'Failed to send message';
    }
    finally {
        sending.value = false;
    }
}
onMounted(async () => {
    const characterName = route.params.characterName;
    const api = useGameApi(store.serverUrl);
    statsLoading.value = true;
    try {
        stats.value = await api.fetchUser(characterName);
    }
    catch (e) {
        statsError.value = e instanceof Error ? e.message : 'Failed to load character stats';
    }
    finally {
        statsLoading.value = false;
    }
    messagesLoading.value = true;
    try {
        messages.value = await api.fetchMessages();
    }
    catch (e) {
        messagesError.value = e instanceof Error ? e.message : 'Failed to load message history';
    }
    finally {
        messagesLoading.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['game-view__main']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__main']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__main']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__main']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__sidebar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "game-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "game-view__sidebar" },
});
/** @type {[typeof CharacterStatsPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CharacterStatsPanel, new CharacterStatsPanel({
    stats: (__VLS_ctx.stats),
    loading: (__VLS_ctx.statsLoading),
    error: (__VLS_ctx.statsError),
}));
const __VLS_1 = __VLS_0({
    stats: (__VLS_ctx.stats),
    loading: (__VLS_ctx.statsLoading),
    error: (__VLS_ctx.statsError),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "game-view__main" },
});
/** @type {[typeof MessageList, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(MessageList, new MessageList({
    messages: (__VLS_ctx.messages),
    loading: (__VLS_ctx.messagesLoading),
    error: (__VLS_ctx.messagesError),
    typing: (__VLS_ctx.sending),
}));
const __VLS_4 = __VLS_3({
    messages: (__VLS_ctx.messages),
    loading: (__VLS_ctx.messagesLoading),
    error: (__VLS_ctx.messagesError),
    typing: (__VLS_ctx.sending),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
if (__VLS_ctx.sendError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "game-view__send-error" },
    });
    (__VLS_ctx.sendError);
}
if (!__VLS_ctx.sending) {
    /** @type {[typeof ActionSuggestions, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(ActionSuggestions, new ActionSuggestions({
        ...{ 'onSelect': {} },
        suggestions: (__VLS_ctx.latestSuggestions),
        disabled: (__VLS_ctx.sending),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onSelect': {} },
        suggestions: (__VLS_ctx.latestSuggestions),
        disabled: (__VLS_ctx.sending),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onSelect: (__VLS_ctx.handleAction)
    };
    var __VLS_8;
}
/** @type {[typeof PlayerInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(PlayerInput, new PlayerInput({
    ...{ 'onSubmit': {} },
    disabled: (__VLS_ctx.sending),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onSubmit': {} },
    disabled: (__VLS_ctx.sending),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onSubmit: (__VLS_ctx.handleAction)
};
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['game-view']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__main']} */ ;
/** @type {__VLS_StyleScopedClasses['game-view__send-error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CharacterStatsPanel: CharacterStatsPanel,
            MessageList: MessageList,
            ActionSuggestions: ActionSuggestions,
            PlayerInput: PlayerInput,
            stats: stats,
            statsLoading: statsLoading,
            statsError: statsError,
            messages: messages,
            messagesLoading: messagesLoading,
            messagesError: messagesError,
            sending: sending,
            sendError: sendError,
            latestSuggestions: latestSuggestions,
            handleAction: handleAction,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
