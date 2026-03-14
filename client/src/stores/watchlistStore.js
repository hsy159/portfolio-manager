import { create } from 'zustand';

export const DEFAULT_WATCHLIST = [
    { symbol: 'AAPL', name: 'Apple', market: 'US', sector: 'Technology', color: '#95a5c4' },
    { symbol: 'GOOG', name: 'Alphabet', market: 'US', sector: 'Technology', color: '#e74c3c' },
    { symbol: 'AMD', name: 'AMD', market: 'US', sector: 'Semiconductor', color: '#e67e22' },
    { symbol: 'AVGO', name: 'Broadcom', market: 'US', sector: 'Semiconductor', color: '#2ecc71' },
    { symbol: 'AMZN', name: 'Amazon', market: 'US', sector: 'Technology', color: '#f39c12' },
    { symbol: '005930.KS', name: '삼성전자', market: 'KR', sector: 'Semiconductor', color: '#3498db' },
    { symbol: '017670.KS', name: 'SK텔레콤', market: 'KR', sector: 'Communication', color: '#1abc9c' },
    { symbol: '035420.KS', name: 'NAVER', market: 'KR', sector: 'Technology', color: '#2ecc71' },
    { symbol: '035720.KS', name: '카카오', market: 'KR', sector: 'Technology', color: '#f39c12' },
    { symbol: 'IONQ', name: 'IonQ', market: 'US', sector: 'Technology', color: '#9b59b6' },
    { symbol: 'RKLB', name: 'Rocket Lab', market: 'US', sector: 'Technology', color: '#d4a843' },
    { symbol: 'COIN', name: 'Coinbase', market: 'US', sector: 'Finance', color: '#3498db' },
];

const useWatchlistStore = create((set, get) => ({
    watchlist: [],
    watchLiveData: {},

    setWatchlist: (watchlist) => set({ watchlist }),

    setWatchLiveData: (watchLiveData) => set({ watchLiveData }),

    updateWatchLiveData: (newData) =>
        set((state) => ({
            watchLiveData: { ...state.watchLiveData, ...newData },
        })),

    addItem: (item) =>
        set((state) => ({
            watchlist: [...state.watchlist, item],
        })),

    removeItem: (symbol) =>
        set((state) => ({
            watchlist: state.watchlist.filter((w) => w.symbol !== symbol),
        })),
}));

export default useWatchlistStore;
