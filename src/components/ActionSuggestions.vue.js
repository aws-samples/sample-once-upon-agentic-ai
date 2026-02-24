const __VLS_props = defineProps();
const emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['suggestion-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.suggestions.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-suggestions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestions-list" },
    });
    for (const [suggestion, index] of __VLS_getVForSourceType((__VLS_ctx.suggestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.suggestions.length > 0))
                        return;
                    __VLS_ctx.emit('select', suggestion);
                } },
            key: (index),
            ...{ class: "suggestion-btn" },
            disabled: (__VLS_ctx.disabled),
        });
        (suggestion);
    }
}
/** @type {__VLS_StyleScopedClasses['action-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
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
