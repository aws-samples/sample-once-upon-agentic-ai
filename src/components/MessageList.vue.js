import { marked } from 'marked';
import DiceDisplay from '@/components/DiceDisplay.vue';
// Configure marked for inline-friendly output
marked.setOptions({
    breaks: true,
    gfm: true,
});
const props = defineProps();
function renderMarkdown(text) {
    return marked.parse(text);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dot']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "message-list panel-parchment border-wood shadow-panel" },
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list-status" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "loading-indicator" },
    });
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list-status list-error" },
    });
}
else if (__VLS_ctx.messages.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list-status" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "messages-scroll" },
    });
    for (const [msg, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "message-entry" },
            ...{ class: ([msg.role === 'user' ? 'message-user' : 'message-assistant', msg.role === 'assistant' && msg.storyOutput?.dice_rolls?.length ? 'has-dice' : '']) },
        });
        if (msg.role === 'user' && msg.text) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "user-bubble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "role-tag" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "user-text" },
            });
            (msg.text);
        }
        if (msg.role === 'assistant' && msg.storyOutput) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "assistant-block" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "role-tag" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "narrative-text" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(msg.storyOutput.response)) }, null, null);
            if (msg.storyOutput.dice_rolls && msg.storyOutput.dice_rolls.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "dice-rolls" },
                });
                for (const [roll, rIdx] of __VLS_getVForSourceType((msg.storyOutput.dice_rolls))) {
                    /** @type {[typeof DiceDisplay, ]} */ ;
                    // @ts-ignore
                    const __VLS_0 = __VLS_asFunctionalComponent(DiceDisplay, new DiceDisplay({
                        key: (rIdx),
                        diceType: (roll.dice_type),
                        result: (roll.result),
                        reason: (roll.reason),
                    }));
                    const __VLS_1 = __VLS_0({
                        key: (rIdx),
                        diceType: (roll.dice_type),
                        result: (roll.result),
                        reason: (roll.reason),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
                }
            }
        }
    }
    if (__VLS_ctx.typing) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-entry message-assistant" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "assistant-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "role-tag" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "typing-indicator" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "typing-dot" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "typing-dot" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "typing-dot" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['message-list']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['border-wood']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['list-status']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['list-status']} */ ;
/** @type {__VLS_StyleScopedClasses['list-error']} */ ;
/** @type {__VLS_StyleScopedClasses['list-status']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['message-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['user-text']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-block']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dice-rolls']} */ ;
/** @type {__VLS_StyleScopedClasses['message-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['message-assistant']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-block']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dot']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DiceDisplay: DiceDisplay,
            renderMarkdown: renderMarkdown,
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
