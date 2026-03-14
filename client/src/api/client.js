import useUiStore from '../stores/uiStore';

function getBaseUrl() {
    const proxyUrl = useUiStore.getState().proxyUrl;
    // In dev mode, use Vite proxy (empty string) when using default localhost
    // In production or custom proxy URL, use the full URL
    if (import.meta.env.DEV && (proxyUrl === 'http://localhost:3001' || !proxyUrl)) {
        return '';
    }
    return proxyUrl;
}

export async function apiGet(path) {
    const r = await fetch(getBaseUrl() + path, {
        signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error('API ' + r.status);
    return r.json();
}

export async function apiPost(path, body) {
    const r = await fetch(getBaseUrl() + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error('API ' + r.status);
    return r.json();
}

export async function apiDelete(path) {
    const r = await fetch(getBaseUrl() + path, {
        method: 'DELETE',
        signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error('API ' + r.status);
    return r.json();
}
