import usePortfolioStore from '../../stores/portfolioStore';
import useUiStore from '../../stores/uiStore';

export default function GaugeBar() {
    const summary = usePortfolioStore((s) => s.summary);
    const targetReturn = useUiStore((s) => s.targetReturn);
    const currentReturn = summary?.totalReturnPct || 0;
    const fillPct = Math.min(Math.max((currentReturn / 30) * 100, 0), 100);

    return (
        <div className="gauge-container">
            <div className="gauge-header">
                <span className="gauge-title">연간 목표 수익률 달성도</span>
                <span className="gauge-value">{currentReturn.toFixed(1)}% / {targetReturn}%</span>
            </div>
            <div className="gauge-bar">
                <div className="gauge-fill" style={{ width: `${fillPct}%` }}></div>
            </div>
            <div className="gauge-labels">
                <span>0%</span>
                <span style={{ color: 'var(--accent)' }}>목표 {targetReturn}%</span>
                <span>30%</span>
            </div>
        </div>
    );
}
