import { useCallback } from 'react';
import useWatchlistStore, { DEFAULT_WATCHLIST } from '../stores/watchlistStore';
import useUiStore from '../stores/uiStore';
import { apiGet, apiPost, apiDelete } from '../api/client';

export default function useWatchlist() {
    const watchlist = useWatchlistStore((s) => s.watchlist);
    const setWatchlist = useWatchlistStore((s) => s.setWatchlist);
    const updateWatchLiveData = useWatchlistStore((s) => s.updateWatchLiveData);

    const showToast = useUiStore((s) => s.showToast);

    const loadWatchlist = useCallback(async () => {
        const apiStatus = useUiStore.getState().apiStatus;
        if (apiStatus !== 'connected') {
            const saved = localStorage.getItem('watchlist');
            setWatchlist(saved ? JSON.parse(saved) : DEFAULT_WATCHLIST);
            return;
        }
        try {
            const data = await apiGet('/api/watchlist');
            setWatchlist(data.watchlist);
        } catch (e) {
            console.error('Load watchlist:', e);
            const saved = localStorage.getItem('watchlist');
            setWatchlist(saved ? JSON.parse(saved) : DEFAULT_WATCHLIST);
        }
    }, [setWatchlist]);

    const refreshWatchlist = useCallback(async () => {
        const apiStatus = useUiStore.getState().apiStatus;
        if (apiStatus !== 'connected') {
            return;
        }
        try {
            const currentWatchlist = useWatchlistStore.getState().watchlist;
            const syms = currentWatchlist.map((w) => w.symbol).join(',');
            if (!syms) return;
            const data = await apiGet(
                '/api/quote?symbols=' + encodeURIComponent(syms)
            );
            const newData = {};
            data.results.forEach((r) => {
                if (!r.error) newData[r.symbol] = r;
            });
            updateWatchLiveData(newData);
            showToast('✅', '관심종목 업데이트 완료');
        } catch (e) {
            console.error('Watch:', e);
        }
    }, [updateWatchLiveData, showToast]);

    const addToWatchlist = useCallback(
        async (item) => {
            const apiStatus = useUiStore.getState().apiStatus;
            if (apiStatus !== 'connected') {
                const current = useWatchlistStore.getState().watchlist;
                const updated = [...current, item];
                setWatchlist(updated);
                localStorage.setItem('watchlist', JSON.stringify(updated));
                return;
            }
            try {
                const data = await apiPost('/api/watchlist', item);
                setWatchlist(data.watchlist);
            } catch (e) {
                console.error('Add to watchlist:', e);
                throw e;
            }
        },
        [setWatchlist]
    );

    const removeFromWatchlist = useCallback(
        async (symbol) => {
            const apiStatus = useUiStore.getState().apiStatus;
            if (apiStatus !== 'connected') {
                const current = useWatchlistStore.getState().watchlist;
                const updated = current.filter((w) => w.symbol !== symbol);
                setWatchlist(updated);
                localStorage.setItem('watchlist', JSON.stringify(updated));
                return;
            }
            try {
                const data = await apiDelete(
                    '/api/watchlist/' + encodeURIComponent(symbol)
                );
                setWatchlist(data.watchlist);
            } catch (e) {
                console.error('Remove from watchlist:', e);
                throw e;
            }
        },
        [setWatchlist]
    );

    return {
        watchlist,
        loadWatchlist,
        refreshWatchlist,
        addToWatchlist,
        removeFromWatchlist,
    };
}
