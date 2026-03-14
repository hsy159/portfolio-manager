import { useState, useMemo } from 'react';
import usePortfolioStore from '../../stores/portfolioStore';
import { SECTOR_COLORS, COLORS } from '../../constants/colors';

export default function DonutChart() {
    const [chartType, setChartType] = useState('sector');
    const holdings = usePortfolioStore((s) => s.holdings);
    const liveData = usePortfolioStore((s) => s.liveData);

    const groups = useMemo(() => {
        const map = {};
        holdings.forEach((h) => {
            const key = chartType === 'sector' ? (h.sector || '기타') : (h.market || 'US');
            const val = liveData[h.symbol]?.valueKRW || 0;
            map[key] = (map[key] || 0) + val;
        });
        const total = Object.values(map).reduce((s, v) => s + v, 0);
        return Object.entries(map)
            .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }))
            .sort((a, b) => b.value - a.value);
    }, [holdings, liveData, chartType]);

    const r = 90, cx = 100, cy = 100, strokeWidth = 35;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const paths = groups.map((g, i) => {
        const len = (g.pct / 100) * circumference;
        const color = chartType === 'sector' ? (SECTOR_COLORS[g.name] || COLORS[i % COLORS.length]) : (g.name === 'US' ? '#3498db' : '#e74c3c');
        const path = (
            <circle key={g.name} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={`${len} ${circumference - len}`} strokeDashoffset={-offset} strokeLinecap="round" />
        );
        offset += len;
        return { ...g, color, el: path };
    });

    const topItem = groups[0];

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-title">자산 배분</div>
                <div className="tab-group">
                    <button className={`tab-btn${chartType === 'sector' ? ' active' : ''}`} onClick={() => setChartType('sector')}>섹터</button>
                    <button className={`tab-btn${chartType === 'country' ? ' active' : ''}`} onClick={() => setChartType('country')}>국가</button>
                </div>
            </div>
            <div className="chart-container">
                <div className="donut-chart">
                    <svg viewBox="0 0 200 200" width="200" height="200">
                        {groups.length === 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />}
                        {paths.map((p) => p.el)}
                    </svg>
                    <div className="donut-center">
                        <div className="donut-center-value">{topItem ? `${topItem.pct.toFixed(1)}%` : '—'}</div>
                        <div className="donut-center-label">{topItem?.name || ''}</div>
                    </div>
                </div>
                <div className="chart-legend">
                    {paths.map((p) => (
                        <div key={p.name} className="legend-item">
                            <div className="legend-dot" style={{ background: p.color }}></div>
                            <span>{p.name} {p.pct.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
