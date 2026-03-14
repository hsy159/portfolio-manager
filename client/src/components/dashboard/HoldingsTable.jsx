import usePortfolioStore from '../../stores/portfolioStore';
import useUiStore from '../../stores/uiStore';
import HoldingsRow from './HoldingsRow';
import HoldingsRowEdit from './HoldingsRowEdit';

export default function HoldingsTable() {
    const holdings = usePortfolioStore((s) => s.holdings);
    const liveData = usePortfolioStore((s) => s.liveData);
    const exchangeRate = usePortfolioStore((s) => s.exchangeRate);
    const summary = usePortfolioStore((s) => s.summary);
    const updateHolding = usePortfolioStore((s) => s.updateHolding);
    const removeHolding = usePortfolioStore((s) => s.removeHolding);
    const currentFilter = useUiStore((s) => s.currentFilter);
    const editingIndex = useUiStore((s) => s.editingIndex);
    const setEditingIndex = useUiStore((s) => s.setEditingIndex);
    const setCurrentFilter = useUiStore((s) => s.setCurrentFilter);
    const showToast = useUiStore((s) => s.showToast);

    const totalValue = summary?.totalValueKRW || 0;
    const filtered = holdings.filter((h) => currentFilter === 'all' || h.market === currentFilter);

    const handleSave = (idx, updates) => {
        updateHolding(idx, updates);
        setEditingIndex(-1);
        showToast('✅', '종목 수정 완료');
    };

    const handleDelete = (idx) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            removeHolding(idx);
            showToast('🗑', '종목 삭제 완료');
        }
    };

    return (
        <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="panel-header">
                <div>
                    <div className="panel-title">보유 종목</div>
                    <div className="panel-subtitle">총 {holdings.length}종목</div>
                </div>
                <div className="tab-group">
                    {['all', 'US', 'KR'].map((f) => (
                        <button key={f} className={`tab-btn${currentFilter === f ? ' active' : ''}`} onClick={() => setCurrentFilter(f)}>
                            {f === 'all' ? '전체' : f === 'US' ? '미국' : '한국'}
                        </button>
                    ))}
                </div>
            </div>
            <table className="holdings-table">
                <thead>
                    <tr>
                        <th>종목</th><th>수량</th><th>평균단가</th><th>현재가</th><th>수익률</th><th>평가금액</th><th>비중</th><th></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>프록시 서버를 연결하고 새로고침하세요</td></tr>
                    ) : filtered.map((h, i) => {
                        const realIdx = holdings.indexOf(h);
                        return editingIndex === realIdx ? (
                            <HoldingsRowEdit key={h.symbol} holding={h} index={realIdx} onSave={handleSave} onCancel={() => setEditingIndex(-1)} />
                        ) : (
                            <HoldingsRow key={h.symbol} holding={h} liveItem={liveData[h.symbol]} totalValue={totalValue} exchangeRate={exchangeRate} index={realIdx} onEdit={setEditingIndex} onDelete={handleDelete} />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
