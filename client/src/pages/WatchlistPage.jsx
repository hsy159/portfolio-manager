import PageHeader from '../components/shared/PageHeader';
import useWatchlistStore from '../stores/watchlistStore';
import useWatchlist from '../hooks/useWatchlist';
import useUiStore from '../stores/uiStore';
import { cleanSymbol } from '../utils/symbol';
import { formatVolume, formatMarketCap } from '../utils/format';

export default function WatchlistPage() {
    const watchlist = useWatchlistStore((s) => s.watchlist);
    const watchLiveData = useWatchlistStore((s) => s.watchLiveData);
    const { refreshWatchlist, removeFromWatchlist } = useWatchlist();
    const openModal = useUiStore((s) => s.openModal);
    const showToast = useUiStore((s) => s.showToast);

    const handleRemove = async (symbol) => {
        await removeFromWatchlist(symbol);
        showToast('🗑', '관심종목 삭제 완료');
    };

    return (
        <>
            <PageHeader greeting="관심종목 모니터링" title="관심종목">
                <button className="btn btn-ghost" onClick={refreshWatchlist}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    새로고침
                </button>
                <button className="btn btn-primary" onClick={() => openModal('watchlist')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    관심종목 추가
                </button>
            </PageHeader>
            <div className="watchlist-grid">
                {watchlist.map((item) => {
                    const d = watchLiveData[item.symbol] || {};
                    const price = d.price ?? '—';
                    const chg = d.changePercent;
                    const chgClass = chg > 0 ? 'positive-text' : chg < 0 ? 'negative-text' : '';
                    const priceStr = typeof price === 'number' ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price;
                    return (
                        <div className="watch-card" key={item.symbol}>
                            <div className="watch-card-header">
                                <div className="watch-card-info">
                                    <div className="watch-card-icon" style={{ background: item.color || '#5a6d94' }}>{cleanSymbol(item.symbol).slice(0, 2)}</div>
                                    <div>
                                        <div className="watch-card-name">{item.name}</div>
                                        <div className="watch-card-symbol">{cleanSymbol(item.symbol)}</div>
                                    </div>
                                </div>
                                <button className="watch-card-remove" onClick={() => handleRemove(item.symbol)}>✕</button>
                            </div>
                            <div className="watch-card-price">{priceStr}</div>
                            <div className={`watch-card-change ${chgClass}`}>{chg != null ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : '—'}</div>
                            <div className="watch-card-meta">
                                <div className="watch-meta-item"><span className="watch-meta-label">거래량</span><span className="watch-meta-value">{formatVolume(d.volume)}</span></div>
                                <div className="watch-meta-item"><span className="watch-meta-label">시총</span><span className="watch-meta-value">{formatMarketCap(d.marketCap)}</span></div>
                                <div className="watch-meta-item"><span className="watch-meta-label">섹터</span><span className="watch-meta-value">{item.sector}</span></div>
                            </div>
                        </div>
                    );
                })}
                <div className="watch-add-card" onClick={() => openModal('watchlist')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>관심종목 추가</div>
                </div>
            </div>
        </>
    );
}
