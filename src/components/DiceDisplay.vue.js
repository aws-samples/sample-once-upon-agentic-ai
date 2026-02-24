import { ref, computed, onMounted } from 'vue';
const baseUrl = import.meta.env.BASE_URL;
const props = defineProps();
const svgFailed = ref(false);
const animate = ref(false);
onMounted(() => {
    requestAnimationFrame(() => {
        animate.value = true;
    });
});
const diceColorMap = {
    d4: '#e74c3c',
    d6: '#27ae60',
    d8: '#2980b9',
    d10: '#8e44ad',
    d12: '#e67e22',
    d20: '#e74c3c',
    d100: '#16a085',
};
const diceColor = computed(() => diceColorMap[props.diceType] || '#7f8c8d');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dice-display']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-tooltip']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dice-display" },
});
if (!__VLS_ctx.svgFailed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-svg-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-image-wrapper" },
        ...{ class: ({ 'dice-roll-in': __VLS_ctx.animate }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (...[$event]) => {
                if (!(!__VLS_ctx.svgFailed))
                    return;
                __VLS_ctx.svgFailed = true;
            } },
        src: (`${baseUrl}dice/${__VLS_ctx.diceType}.svg`),
        alt: (`${__VLS_ctx.diceType} dice`),
        ...{ class: "dice-svg" },
        ...{ class: ({ 'dice-tumble': __VLS_ctx.animate }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-result-overlay" },
        ...{ class: ({ 'dice-result-reveal': __VLS_ctx.animate, 'dice-result-hidden': !__VLS_ctx.animate }) },
    });
    (__VLS_ctx.result);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-fallback" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-fallback-shape" },
        ...{ class: ({ 'dice-roll-in': __VLS_ctx.animate }) },
        ...{ style: ({ backgroundColor: __VLS_ctx.diceColor }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-fallback-result" },
        ...{ class: ({ 'dice-result-reveal': __VLS_ctx.animate, 'dice-result-hidden': !__VLS_ctx.animate }) },
    });
    (__VLS_ctx.result);
}
if (__VLS_ctx.reason) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dice-tooltip" },
    });
    (__VLS_ctx.reason);
}
/** @type {__VLS_StyleScopedClasses['dice-display']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-svg-container']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-result-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-fallback-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-fallback-result']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-tooltip']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            svgFailed: svgFailed,
            animate: animate,
            diceColor: diceColor,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
