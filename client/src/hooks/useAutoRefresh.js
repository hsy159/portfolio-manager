import { useEffect, useRef } from 'react';
import useUiStore from '../stores/uiStore';

export default function useAutoRefresh(refreshFn) {
    const refreshInterval = useUiStore((s) => s.refreshInterval);
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (refreshInterval > 0 && refreshFn) {
            timerRef.current = setInterval(refreshFn, refreshInterval * 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [refreshInterval, refreshFn]);
}
