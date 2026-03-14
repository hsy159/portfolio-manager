import { create } from 'zustand';

const useUiStore = create((set) => ({
    theme: localStorage.getItem('theme') || 'dark',
    apiStatus: 'disconnected', // 'connected' | 'disconnected' | 'loading'
    statusText: '프록시 서버 연결 안됨',
    proxyUrl: localStorage.getItem('proxyUrl') || 'http://localhost:3001',
    refreshInterval: parseInt(localStorage.getItem('refreshInterval') || '60', 10),
    targetReturn: parseInt(localStorage.getItem('targetReturn') || '15', 10),
    toast: { icon: '', message: '', visible: false },
    lastUpdate: null,
    modalOpen: false,
    modalMode: 'holding', // 'holding' | 'watchlist'
    currentFilter: 'all', // 'all' | 'US' | 'KR'
    editingIndex: -1,

    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            return { theme: next };
        }),

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
    },

    setApiStatus: (apiStatus, statusText) =>
        set({ apiStatus, ...(statusText !== undefined ? { statusText } : {}) }),

    setProxyUrl: (url) => {
        const clean = url.trim().replace(/\/$/, '');
        localStorage.setItem('proxyUrl', clean);
        set({ proxyUrl: clean });
    },

    setRefreshInterval: (seconds) => {
        localStorage.setItem('refreshInterval', String(seconds));
        set({ refreshInterval: seconds });
    },

    setTargetReturn: (value) => {
        localStorage.setItem('targetReturn', String(value));
        set({ targetReturn: value });
    },

    showToast: (icon, message) => {
        set({ toast: { icon, message, visible: true } });
        setTimeout(() => {
            set((state) => ({
                toast: { ...state.toast, visible: false },
            }));
        }, 3000);
    },

    setLastUpdate: (time) => set({ lastUpdate: time }),

    openModal: (mode = 'holding') => set({ modalOpen: true, modalMode: mode }),
    closeModal: () => set({ modalOpen: false }),

    setCurrentFilter: (filter) => set({ currentFilter: filter }),

    setEditingIndex: (index) => set({ editingIndex: index }),
    clearEditing: () => set({ editingIndex: -1 }),
}));

export default useUiStore;
