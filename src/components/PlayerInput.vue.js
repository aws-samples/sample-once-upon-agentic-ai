import { ref, computed } from 'vue';
const __VLS_props = defineProps();
const emit = defineEmits();
const message = ref('');
const hasContent = computed(() => message.value.trim().length > 0);
function handleSubmit() {
    const trimmed = message.value.trim();
    if (!trimmed)
        return;
    emit('submit', trimmed);
    message.value = '';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['player-input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
    ...{ class: "player-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    value: (__VLS_ctx.message),
    type: "text",
    ...{ class: "player-input-field" },
    placeholder: "Type your action...",
    disabled: (__VLS_ctx.disabled),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "player-input-btn" },
    disabled: (__VLS_ctx.disabled || !__VLS_ctx.hasContent),
});
/** @type {__VLS_StyleScopedClasses['player-input']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['player-input-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            message: message,
            hasContent: hasContent,
            handleSubmit: handleSubmit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
