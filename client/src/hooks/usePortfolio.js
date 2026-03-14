import { useState, useCallback } from 'react';
import usePortfolioStore from '../stores/portfolioStore';
import useUiStore from '../stores/uiStore';
import { apiGet, apiPost } from '../api/client';

const TICKER_SYMBOLS = 'USDKRW=X,^GSPC,^IXIC,^DJI,^KS11,^KQ11,BTC-USD';

export default function usePortfolio() {
    const [isLoading, setIsLoading] = useState(false);

    const holdings = usePortfolioStore((s) => s.holdings);
    const setHoldings = usePortfolioStore((s) => s.setHoldings);
    const setHoldingsList = usePortfolioStore((s) => s.setHoldingsList);
    const liveData = usePortfolioStore((s) => s.liveData);
    const updateLiveData = usePortfolioStore((s) => s.updateLiveData);
    const setLiveData = usePortfolioStore((s) => s.setLiveData);
    const setSummary = usePortfolioStore((s) => s.setSummary);
    const exchangeRate = usePortfolioStore((s) => s.exchangeRate);
    const setExchangeRate = usePortfolioStore((s) => s.setExchangeRate);
    const setTickerData = usePortfolioStore((s) => s.setTickerData);

    const apiStatus = useUiStore((s) => s.apiStatus);
    const setApiStatus = useUiStore((s) => s.setApiStatus);
    const showToast = useUiStore((s) => s.showToast);
    const setLastUpdate = useUiStore((s) => s.setLastUpdate);

    const loadHoldings = useCallback(async () => {
        try {
            const r = await fetch('/holdinglist.json', {
                signal: AbortSignal.timeout(8000),
            });
            if (!r.ok) throw new Error('Failed to load: ' + r.status);
            const defaultHoldings = await r.json();
            setHoldingsList(defaultHoldings);
            const saved = localStorage.getItem('holdings');
            setHoldings(saved ? JSON.parse(saved) : defaultHoldings);
        } catch (e) {
            console.error('Load holdings:', e);
            setHoldingsList([]);
            const saved = localStorage.getItem('holdings');
            setHoldings(saved ? JSON.parse(saved) : []);
        }
    }, [setHoldings, setHoldingsList]);

    const renderWithDummyData = useCallback(() => {
        const currentHoldings = usePortfolioStore.getState().holdings;
        const currentLiveData = usePortfolioStore.getState().liveData;
        const currentExchangeRate = usePortfolioStore.getState().exchangeRate;
        const newLiveData = { ...currentLiveData };

        currentHoldings.forEach((h) => {
            if (!newLiveData[h.symbol]) {
                const isKR = h.market === 'KR';
                const mp = h.buyPrice * (1 + (Math.random() * 0.4 - 0.05));
                const cp = isKR ? Math.round(mp) : Math.round(mp * 100) / 100;
                const vKRW = isKR ? cp * h.qty : cp * h.qty * currentExchangeRate;
                const cKRW = isKR
                    ? h.buyPrice * h.qty
                    : h.buyPrice * h.qty * currentExchangeRate;
                newLiveData[h.symbol] = {
                    symbol: h.symbol,
                    name: h.name,
                    currentPrice: cp,
                    change: 0,
                    changePercent: 0,
                    currency: isKR ? 'KRW' : 'USD',
                    qty: h.qty,
                    buyPrice: h.buyPrice,
                    returnPct: ((cp - h.buyPrice) / h.buyPrice) * 100,
                    valueKRW: vKRW,
                    costKRW: cKRW,
                    profitKRW: vKRW - cKRW,
                };
            }
        });

        setLiveData(newLiveData);

        const tv = currentHoldings.reduce(
            (s, h) => s + (newLiveData[h.symbol]?.valueKRW || 0),
            0
        );
        const tc = currentHoldings.reduce(
            (s, h) => s + (newLiveData[h.symbol]?.costKRW || 0),
            0
        );
        setSummary({
            totalValueKRW: tv,
            totalCostKRW: tc,
            totalProfitKRW: tv - tc,
            totalReturnPct: tc > 0 ? ((tv - tc) / tc) * 100 : 0,
            holdingsCount: currentHoldings.length,
        });
    }, [setLiveData, setSummary]);

    const refreshData = useCallback(async () => {
        const currentApiStatus = useUiStore.getState().apiStatus;
        if (currentApiStatus !== 'connected') {
            renderWithDummyData();
            return;
        }

        setApiStatus('loading', '데이터 조회 중...');
        setIsLoading(true);

        try {
            const currentHoldings = usePortfolioStore.getState().holdings;
            const req = currentHoldings.map((h) => ({
                symbol: h.symbol,
                qty: h.qty,
                buyPrice: h.buyPrice,
            }));
            const data = await apiPost('/api/portfolio-quote', { holdings: req });

            // Update exchange rate
            const newExchangeRate = data.exchangeRate?.USDKRW || 1400;
            setExchangeRate(newExchangeRate);

            // Update liveData keyed by symbol
            const newLiveData = {};
            data.holdings.forEach((h) => {
                newLiveData[h.symbol] = h;
            });
            updateLiveData(newLiveData);

            // Update summary
            setSummary(data.summary || {
                totalValueKRW: data.holdings.reduce((s, h) => s + (h.valueKRW || 0), 0),
                totalCostKRW: data.holdings.reduce((s, h) => s + (h.costKRW || 0), 0),
                totalProfitKRW: data.holdings.reduce((s, h) => s + (h.profitKRW || 0), 0),
                totalReturnPct: 0,
                holdingsCount: currentHoldings.length,
            });

            // Fetch ticker bar data
            try {
                const td = await apiGet('/api/quote?symbols=' + TICKER_SYMBOLS);
                const tickerMap = {};
                td.results.forEach((r) => {
                    tickerMap[r.symbol] = r;
                });
                setTickerData(tickerMap);
            } catch (e) {
                // ticker bar fetch is non-critical
            }

            const now = new Date().toLocaleTimeString('ko-KR');
            setApiStatus('connected', '연결됨 · ' + now);
            setLastUpdate('마지막: ' + now);
        } catch (e) {
            console.error('Refresh:', e);
            setApiStatus('disconnected', '오류: ' + e.message);
            renderWithDummyData();
        } finally {
            setIsLoading(false);
        }
    }, [
        setApiStatus,
        setExchangeRate,
        updateLiveData,
        setSummary,
        setTickerData,
        setLastUpdate,
        renderWithDummyData,
    ]);

    const connectProxy = useCallback(async () => {
        setApiStatus('loading', '연결 중...');
        try {
            const h = await apiGet('/api/health');
            if (h.status === 'ok') {
                setApiStatus('connected', '연결됨');
                showToast('✅', '프록시 서버 연결 성공!');
                await loadHoldings();
                await refreshData();
            }
        } catch (e) {
            setApiStatus('disconnected', '연결 실패');
            showToast('❌', '프록시 서버 연결 실패');
            renderWithDummyData();
        }
    }, [setApiStatus, showToast, loadHoldings, refreshData, renderWithDummyData]);

    return { refreshData, connectProxy, loadHoldings, renderWithDummyData, isLoading };
}
