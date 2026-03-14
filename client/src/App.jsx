import { useEffect, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TickerBar from './components/layout/TickerBar';
import Toast from './components/layout/Toast';
import AddStockModal from './components/shared/AddStockModal';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import RebalancePage from './pages/RebalancePage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import usePortfolio from './hooks/usePortfolio';
import useWatchlist from './hooks/useWatchlist';
import useAutoRefresh from './hooks/useAutoRefresh';
import useTheme from './hooks/useTheme';
import useUiStore from './stores/uiStore';

function AppContent() {
    const { refreshData, connectProxy, loadHoldings, renderWithDummyData } = usePortfolio();
    const { loadWatchlist, refreshWatchlist } = useWatchlist();
    const { theme } = useTheme();
    const proxyUrl = useUiStore((s) => s.proxyUrl);
    const lastUpdate = useUiStore((s) => s.lastUpdate);
    const [proxyInput, setProxyInput] = useState(proxyUrl);
    const setProxyUrl = useUiStore((s) => s.setProxyUrl);

    const refreshAll = useCallback(async () => {
        await refreshData();
        await refreshWatchlist();
    }, [refreshData, refreshWatchlist]);

    useAutoRefresh(refreshAll);

    useEffect(() => {
        const init = async () => {
            await loadHoldings();
            await loadWatchlist();
            try {
                await connectProxy();
            } catch {
                renderWithDummyData();
            }
        };
        init();
    }, []);

    const handleConnect = () => {
        setProxyUrl(proxyInput);
        setTimeout(() => connectProxy(), 100);
    };

    return (
        <div className="app">
            <Sidebar />
            <main className="main">
                <div className="config-bar">
                    <div>
                        <span style={{ color: 'var(--text-secondary)' }}>프록시 서버: </span>
                        <code>{proxyUrl}</code>
                        {lastUpdate && <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>{lastUpdate}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="text" className="form-input" style={{ width: 260, padding: '6px 12px', fontSize: 12 }}
                            value={proxyInput} onChange={(e) => setProxyInput(e.target.value)} />
                        <button className="btn btn-sm btn-primary" onClick={handleConnect}>연결</button>
                    </div>
                </div>
                <TickerBar />
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/rebalance" element={<RebalancePage />} />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
            <AddStockModal />
            <Toast />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
