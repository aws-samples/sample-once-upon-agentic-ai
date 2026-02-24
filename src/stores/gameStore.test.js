import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from './gameStore';
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
describe('useGameStore', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        setActivePinia(createPinia());
    });
    it('has correct default state', () => {
        const store = useGameStore();
        expect(store.serverUrl).toBe('');
        expect(store.characterName).toBe('');
        expect(store.isInitialized).toBe(false);
    });
    it('setConnection sets serverUrl and characterName', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', 'Gandalf');
        expect(store.serverUrl).toBe('http://localhost:3000');
        expect(store.characterName).toBe('Gandalf');
    });
    it('setConnection persists serverUrl to localStorage', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', 'Gandalf');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('rpg-gm-server-url', 'http://localhost:3000');
    });
    it('isInitialized returns true when both fields are set', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', 'Gandalf');
        expect(store.isInitialized).toBe(true);
    });
    it('isInitialized returns false when serverUrl is empty', () => {
        const store = useGameStore();
        store.setConnection('', 'Gandalf');
        expect(store.isInitialized).toBe(false);
    });
    it('isInitialized returns false when characterName is empty', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', '');
        expect(store.isInitialized).toBe(false);
    });
    it('reset clears state back to defaults', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', 'Gandalf');
        expect(store.isInitialized).toBe(true);
        store.reset();
        expect(store.serverUrl).toBe('');
        expect(store.characterName).toBe('');
        expect(store.isInitialized).toBe(false);
    });
    it('reset removes serverUrl from localStorage', () => {
        const store = useGameStore();
        store.setConnection('http://localhost:3000', 'Gandalf');
        store.reset();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('rpg-gm-server-url');
    });
    it('restores serverUrl from localStorage on creation', () => {
        localStorageMock.getItem.mockReturnValueOnce('http://saved-server:8080');
        setActivePinia(createPinia());
        const store = useGameStore();
        expect(store.serverUrl).toBe('http://saved-server:8080');
        expect(store.characterName).toBe('');
        expect(store.isInitialized).toBe(false);
    });
});
