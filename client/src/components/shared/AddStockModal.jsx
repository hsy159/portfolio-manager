import { useState } from 'react';
import Modal from './Modal';
import useUiStore from '../../stores/uiStore';
import usePortfolioStore from '../../stores/portfolioStore';
import useWatchlist from '../../hooks/useWatchlist';
import useSearch from '../../hooks/useSearch';
import { SECTOR_OPTIONS } from '../../constants/colors';
import { SECTOR_COLORS } from '../../constants/colors';

export default function AddStockModal() {
    const modalOpen = useUiStore((s) => s.modalOpen);
    const modalMode = useUiStore((s) => s.modalMode);
    const closeModal = useUiStore((s) => s.closeModal);
    const showToast = useUiStore((s) => s.showToast);
    const addHolding = usePortfolioStore((s) => s.addHolding);
    const { addToWatchlist } = useWatchlist();
    const { query, setQuery, results, isSearching } = useSearch(400);

    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('');
    const [sector, setSector] = useState('Technology');
    const [showResults, setShowResults] = useState(false);

    const reset = () => { setName(''); setTicker(''); setPrice(''); setQty(''); setSector('Technology'); setQuery(''); setShowResults(false); };
    const handleClose = () => { reset(); closeModal(); };

    const selectResult = (r) => {
        setName(r.name || r.shortname || '');
        setTicker(r.symbol || '');
        setShowResults(false);
    };

    const handleAdd = async () => {
        if (!ticker) return;
        const isKR = ticker.includes('.KS') || ticker.includes('.KQ') || /^\d{6}$/.test(ticker);
        const market = isKR ? 'KR' : 'US';
        const color = SECTOR_COLORS[sector] || '#5a6d94';

        if (modalMode === 'holding') {
            addHolding({ symbol: ticker, name: name || ticker, market, buyPrice: parseFloat(price) || 0, qty: parseFloat(qty) || 0, sector, color });
            showToast('✅', `${name || ticker} 보유종목에 추가`);
        } else {
            try {
                await addToWatchlist({ symbol: ticker, name: name || ticker, market, sector, color });
                showToast('✅', `${name || ticker} 관심종목에 추가`);
            } catch (e) {
                showToast('❌', '추가 실패: ' + e.message);
            }
        }
        handleClose();
    };

    return (
        <Modal isOpen={modalOpen} onClose={handleClose}>
            <div className="modal-title">{modalMode === 'holding' ? '종목 추가' : '관심종목 추가'}</div>
            <div className="form-group">
                <label className="form-label">종목 검색</label>
                <input type="text" className="form-input" placeholder="종목명 또는 티커를 입력하세요" value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowResults(true); }} />
                {showResults && results.length > 0 && (
                    <div className="search-results" style={{ display: 'block' }}>
                        {results.map((r) => (
                            <div key={r.symbol} className="search-result-item" onClick={() => selectResult(r)}>
                                <span className="search-result-name">{r.name || r.shortname}</span>
                                <span className="search-result-symbol">{r.symbol}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="form-row">
                <div className="form-group"><label className="form-label">종목명</label><input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">티커</label><input type="text" className="form-input" value={ticker} onChange={(e) => setTicker(e.target.value)} /></div>
            </div>
            {modalMode === 'holding' && (
                <div className="form-row">
                    <div className="form-group"><label className="form-label">매입가</label><input type="number" className="form-input" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">수량</label><input type="number" className="form-input" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
                </div>
            )}
            <div className="form-group">
                <label className="form-label">섹터</label>
                <select className="form-input" value={sector} onChange={(e) => setSector(e.target.value)}>
                    {SECTOR_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={handleClose}>취소</button>
                <button className="btn btn-primary" onClick={handleAdd}>추가하기</button>
            </div>
        </Modal>
    );
}
