import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { validateForm } from '@/utils/validation';
import { formatInitPrompt } from '@/utils/promptFormatter';
import { useGameApi } from '@/composables/useGameApi';
import { useGameStore } from '@/stores/gameStore';
const router = useRouter();
const store = useGameStore();
const revealed = ref(false);
onMounted(() => {
    setTimeout(() => {
        revealed.value = true;
    }, 1000);
});
const genderOptions = ['Male', 'Female', 'Non-binary'];
const raceOptions = [
    'Human',
    'Elf',
    'Dwarf',
    'Halfling',
    'Gnome',
    'Half-Elf',
    'Half-Orc',
    'Tiefling',
    'Dragonborn',
];
const classOptions = [
    'Barbarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard',
];
const form = reactive({
    name: '',
    gender: '',
    race: '',
    characterClass: '',
    serverUrl: '',
});
const errors = ref({});
const loading = ref(false);
const submitError = ref(null);
async function handleSubmit() {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
        errors.value = validationErrors;
        return;
    }
    errors.value = {};
    submitError.value = null;
    loading.value = true;
    try {
        const prompt = formatInitPrompt(form);
        const { sendInquiry } = useGameApi(form.serverUrl);
        await sendInquiry(prompt);
        store.setConnection(form.serverUrl, form.name);
        revealed.value = false;
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push({ name: 'game', params: { characterName: form.name } });
    }
    catch (e) {
        submitError.value = e instanceof Error ? e.message : 'Failed to connect to server';
    }
    finally {
        loading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['start-button']} */ ;
/** @type {__VLS_StyleScopedClasses['start-button']} */ ;
/** @type {__VLS_StyleScopedClasses['start-button']} */ ;
/** @type {__VLS_StyleScopedClasses['start-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "new-game-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-card panel-parchment border-wood shadow-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "form-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
    ...{ class: "character-form" },
});
if (__VLS_ctx.submitError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "submit-error" },
    });
    (__VLS_ctx.submitError);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "character-name",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "character-name",
    value: (__VLS_ctx.form.name),
    type: "text",
    ...{ class: "form-input" },
    ...{ class: ({ 'input-error': __VLS_ctx.errors.name }) },
    placeholder: "Enter your character's name",
});
if (__VLS_ctx.errors.name) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "field-error" },
    });
    (__VLS_ctx.errors.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "gender",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "gender",
    value: (__VLS_ctx.form.gender),
    ...{ class: "form-input" },
    ...{ class: ({ 'input-error': __VLS_ctx.errors.gender }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [g] of __VLS_getVForSourceType((__VLS_ctx.genderOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (g),
        value: (g),
    });
    (g);
}
if (__VLS_ctx.errors.gender) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "field-error" },
    });
    (__VLS_ctx.errors.gender);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "race",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "race",
    value: (__VLS_ctx.form.race),
    ...{ class: "form-input" },
    ...{ class: ({ 'input-error': __VLS_ctx.errors.race }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [r] of __VLS_getVForSourceType((__VLS_ctx.raceOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (r),
        value: (r),
    });
    (r);
}
if (__VLS_ctx.errors.race) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "field-error" },
    });
    (__VLS_ctx.errors.race);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "character-class",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "character-class",
    value: (__VLS_ctx.form.characterClass),
    ...{ class: "form-input" },
    ...{ class: ({ 'input-error': __VLS_ctx.errors.characterClass }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [c] of __VLS_getVForSourceType((__VLS_ctx.classOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (c),
        value: (c),
    });
    (c);
}
if (__VLS_ctx.errors.characterClass) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "field-error" },
    });
    (__VLS_ctx.errors.characterClass);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "server-url",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "server-url",
    value: (__VLS_ctx.form.serverUrl),
    type: "text",
    ...{ class: "form-input" },
    ...{ class: ({ 'input-error': __VLS_ctx.errors.serverUrl }) },
    placeholder: "https://your-server.example.com",
});
if (__VLS_ctx.errors.serverUrl) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "field-error" },
    });
    (__VLS_ctx.errors.serverUrl);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "start-button" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? 'Starting...' : 'Start');
/** @type {__VLS_StyleScopedClasses['new-game-view']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['border-wood']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['form-title']} */ ;
/** @type {__VLS_StyleScopedClasses['character-form']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['field-error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['field-error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['field-error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['field-error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['field-error']} */ ;
/** @type {__VLS_StyleScopedClasses['start-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            revealed: revealed,
            genderOptions: genderOptions,
            raceOptions: raceOptions,
            classOptions: classOptions,
            form: form,
            errors: errors,
            loading: loading,
            submitError: submitError,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
