import { ref } from 'vue';
import { parseMessages } from '../utils/messageParser';
export function useGameApi(serverUrl) {
    const loading = ref(false);
    const error = ref(null);
    async function sendInquiry(question) {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch(`${serverUrl}/inquire`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            const data = await res.json();
            return data.response;
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            error.value = msg;
            throw e;
        }
        finally {
            loading.value = false;
        }
    }
    async function fetchUser(userName) {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch(`${serverUrl}/user/${userName}`);
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            return (await res.json());
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            error.value = msg;
            throw e;
        }
        finally {
            loading.value = false;
        }
    }
    async function fetchMessages() {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch(`${serverUrl}/messages`);
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            const raw = await res.json();
            return parseMessages(raw);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            error.value = msg;
            throw e;
        }
        finally {
            loading.value = false;
        }
    }
    return { loading, error, sendInquiry, fetchUser, fetchMessages };
}
