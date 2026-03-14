import { create } from 'zustand';

const usePortfolioStore = create((set, get) => ({
    holdings: [],
    holdingsList: [],
    liveData: {},
    summary: null,
    exchangeRate: 1400,
    tickerData: {},
    currentFilter: 'all',

    setHoldings: (holdings) => {
        set({ holdings });
        localStorage.setItem('holdings', JSON.stringify(holdings));
    },

    setHoldingsList: (holdingsList) => set({ holdingsList }),

    setLiveData: (liveData) => set({ liveData }),

    updateLiveData: (newData) =>
        set((state) => ({
            liveData: { ...state.liveData, ...newData },
        })),

    setSummary: (summary) => set({ summary }),

    setExchangeRate: (exchangeRate) => set({ exchangeRate }),

    setTickerData: (tickerData) => set({ tickerData }),

    setCurrentFilter: (currentFilter) => set({ currentFilter }),

    addHolding: (holding) => {
        const { holdings } = get();
        const updated = [...holdings, holding];
        set({ holdings: updated });
        localStorage.setItem('holdings', JSON.stringify(updated));
    },

    removeHolding: (index) => {
        const { holdings, liveData } = get();
        const symbol = holdings[index]?.symbol;
        const updated = holdings.filter((_, i) => i !== index);
        const newLiveData = { ...liveData };
        if (symbol) delete newLiveData[symbol];
        set({ holdings: updated, liveData: newLiveData });
        localStorage.setItem('holdings', JSON.stringify(updated));
    },

    updateHolding: (index, changes) => {
        const { holdings } = get();
        const updated = holdings.map((h, i) => (i === index ? { ...h, ...changes } : h));
        set({ holdings: updated });
        localStorage.setItem('holdings', JSON.stringify(updated));
    },
}));

export default usePortfolioStore;
