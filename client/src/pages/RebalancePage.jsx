import { useState, useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import usePortfolioStore from '../stores/portfolioStore';
import { SECTOR_COLORS, COLORS } from '../constants/colors';
import { formatKRW } from '../utils/format';
import { cleanSymbol } from '../utils/symbol';

export default function RebalancePage() {
    const holdings = usePortfolioStore((s) => s.holdings);
    const liveData = usePortfolioStore((s) => s.liveData);
    const summary = usePortfolioStore((s) => s.summary);
    const totalValue = summary?.totalValueKRW || 0;

    const initWeights = useMemo(() => {
        return holdings.map((h) => {
            const val = liveData[h.symbol]?.valueKRW || 0;
            return totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
        });
    }, [holdings, liveData, totalValue]);

    const [weights, setWeights] = useState(initWeights);
    const [results, setResults] = useState(null);

    const totalTarget = weights.reduce((s, w) => s + w, 0);

    const updateWeight = (i, val) => {
        const next = [...weights];
        next[i] = parseInt(val) || 0;
        setWeights(next);
    };

    const resetTargets = () => setWeights([...initWeights]);

    const simulate = () => {
        const res = holdings.map((h, i) => {
            const currentVal = liveData[h.symbol]?.valueKRW || 0;
            const currentPct = totalValue > 0 ? (currentVal / totalValue) * 100 : 0;
            const targetPct = weights[i] || 0;
            const diff = targetPct - currentPct;
            const diffKRW = (diff / 100) * totalValue;
            return { symbol: h.symbol, name: h.name, currentPct, targetPct, diff, diffKRW, action: diff > 1 ? 'BUY' : diff < -1 ? 'SELL' : 'HOLD' };
        });
        setResults(res);
    };

    // Distribution calculations
    const calcDistribution = (type) => {
        const map = {};
        holdings.forEach((h) => {
            const key = type === 'sector' ? (h.sector || '기타') : (h.market || 'US');
            const val = liveData[h.symbol]?.valueKRW || 0;
            map[key] = (map[key] || 0) + val;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value, pct: totalValue > 0 ? (value / totalValue) * 100 : 0 })).sort((a, b) => b.value - a.value);
    };

    const sectorBars = calcDistribution('sector');
    const countryBars = calcDistribution('country');

    return (
        <>
            <PageHeader greeting="리밸런싱 시뮬레이터" title="목표 비중 조정">
                <button className="btn btn-ghost" onClick={resetTargets}>초기화</button>
                <button className="btn btn-primary" onClick={simulate}>시뮬레이션 실행</button>
            </PageHeader>
            <div className="content-grid fade-in stagger-2">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">목표 비중 설정</div>
                        <div className="panel-subtitle">합계: {totalTarget}%</div>
                    </div>
                    {holdings.map((h, i) => (
                        <div className="target-row" key={h.symbol}>
                            <div className="target-label">{cleanSymbol(h.symbol)}</div>
                            <input type="range" className="target-slider" min="0" max="50" value={weights[i] || 0} onChange={(e) => updateWeight(i, e.target.value)} />
                            <div className="target-value">{weights[i] || 0}%</div>
                        </div>
                    ))}
                    {results && (
                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                            <div className="panel-title" style={{ marginBottom: 16 }}>리밸런싱 결과</div>
                            <div className="rebalance-grid">
                                {results.map((r) => (
                                    <div className="rebalance-item" key={r.symbol}>
                                        <div>
                                            <div className="rebalance-ticker">{r.name}</div>
                                            <div className="rebalance-detail">{r.currentPct.toFixed(1)}% → {r.targetPct.toFixed(1)}%</div>
                                        </div>
                                        <div className={`rebalance-action action-${r.action.toLowerCase()}`}>
                                            {r.action} {r.action !== 'HOLD' && formatKRW(Math.abs(r.diffKRW))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="panel">
                    <div className="panel-title" style={{ marginBottom: 20 }}>섹터별 분포</div>
                    {sectorBars.map((b, i) => (
                        <div className="bar-item" key={b.name}>
                            <div className="bar-label-row"><span className="bar-label">{b.name}</span><span className="bar-value">{b.pct.toFixed(1)}%</span></div>
                            <div className="bar-track"><div className="bar-fill" style={{ width: `${b.pct}%`, background: SECTOR_COLORS[b.name] || COLORS[i % COLORS.length] }}></div></div>
                        </div>
                    ))}
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <div className="panel-title" style={{ marginBottom: 20 }}>국가별 분포</div>
                        {countryBars.map((b) => (
                            <div className="bar-item" key={b.name}>
                                <div className="bar-label-row"><span className="bar-label">{b.name === 'US' ? '🇺🇸 미국' : '🇰🇷 한국'}</span><span className="bar-value">{b.pct.toFixed(1)}%</span></div>
                                <div className="bar-track"><div className="bar-fill" style={{ width: `${b.pct}%`, background: b.name === 'US' ? '#3498db' : '#e74c3c' }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
