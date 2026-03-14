import PageHeader from '../components/shared/PageHeader';
import useSearch from '../hooks/useSearch';
import usePortfolioStore from '../stores/portfolioStore';
import useUiStore from '../stores/uiStore';
import useWatchlist from '../hooks/useWatchlist';
import { cleanSymbol } from '../utils/symbol';
import { SECTOR_COLORS } from '../constants/colors';

export default function SearchPage() {
    const { query, setQuery, results, quotes, isSearching } = useSearch(500);
    const addHolding = usePortfolioStore((s) => s.addHolding);
    const showToast = useUiStore((s) => s.showToast);
    const { addToWatchlist } = useWatchlist();

    const handleAddHolding = (r) => {
        const isKR = r.symbol.includes('.KS') || r.symbol.includes('.KQ');
        addHolding({ symbol: r.symbol, name: r.name || r.shortname || r.symbol, market: isKR ? 'KR' : 'US', buyPrice: quotes[r.symbol]?.price || 0, qty: 0, sector: 'Technology', color: SECTOR_COLORS['Technology'] });
        showToast('✅', `${r.name || r.symbol} 보유종목에 추가`);
    };

    const handleAddWatchlist = async (r) => {
        const isKR = r.symbol.includes('.KS') || r.symbol.includes('.KQ');
        try {
            await addToWatchlist({ symbol: r.symbol, name: r.name || r.shortname || r.symbol, market: isKR ? 'KR' : 'US', sector: 'Technology', color: SECTOR_COLORS['Technology'] });
            showToast('✅', `${r.name || r.symbol} 관심종목에 추가`);
        } catch (e) { showToast('❌', '추가 실패'); }
    };

    return (
        <>
            <PageHeader greeting="종목 탐색" title="종목 검색" />
            <div className="search-page-input-wrap fade-in stagger-1">
                <svg className="search-page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" className="search-page-input" placeholder="종목명, 티커, 또는 키워드를 입력하세요" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="search-page-results fade-in stagger-2">
                {!query && (
                    <div className="search-empty">
                        <div className="search-empty-icon">🔍</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>종목을 검색해 보세요</div>
                        <div>종목명이나 티커를 입력하면 실시간 검색 결과가 표시됩니다</div>
                    </div>
                )}
                {isSearching && <div className="search-loading">검색 중...</div>}
                {query && !isSearching && results.length === 0 && (
                    <div className="search-empty">
                        <div className="search-empty-icon">📭</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>검색 결과가 없습니다</div>
                    </div>
                )}
                {results.map((r) => {
                    const q = quotes[r.symbol] || {};
                    const priceStr = q.price ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';
                    const chg = q.changePercent;
                    const chgClass = chg > 0 ? 'positive-text' : chg < 0 ? 'negative-text' : '';
                    return (
                        <div className="search-card" key={r.symbol}>
                            <div className="search-card-left">
                                <div className="search-card-icon">{cleanSymbol(r.symbol).slice(0, 2)}</div>
                                <div className="search-card-info">
                                    <div className="search-card-name">{r.name || r.shortname}</div>
                                    <div className="search-card-meta">
                                        <span className="search-card-meta-tag">{r.symbol}</span>
                                        <span>{r.typeDisp || r.type}</span>
                                        <span>{r.exchange}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="search-card-price">
                                <div className="search-card-price-value">{priceStr}</div>
                                <div className={`search-card-price-change ${chgClass}`}>{chg != null ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : ''}</div>
                            </div>
                            <div className="search-card-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleAddHolding(r)}>+ 보유</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleAddWatchlist(r)}>+ 관심</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
