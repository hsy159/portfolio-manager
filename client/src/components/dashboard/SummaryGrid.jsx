import SummaryCard from './SummaryCard';
import usePortfolioStore from '../../stores/portfolioStore';
import useUiStore from '../../stores/uiStore';
import { formatKRW, formatPercent } from '../../utils/format';

export default function SummaryGrid() {
    const summary = usePortfolioStore((s) => s.summary);
    const holdings = usePortfolioStore((s) => s.holdings);
    const targetReturn = useUiStore((s) => s.targetReturn);

    if (!summary) {
        return (
            <div className="summary-grid">
                <SummaryCard label="총 평가금액" value="—" subtext="데이터 로딩 중..." stagger="stagger-1" />
                <SummaryCard label="총 수익률" value="—" subtext="—" stagger="stagger-2" />
                <SummaryCard label="총 수익금" value="—" subtext="—" stagger="stagger-3" />
                <SummaryCard label="보유 종목" value="—" subtext="—" stagger="stagger-4" />
            </div>
        );
    }

    const retClass = summary.totalReturnPct >= 0 ? 'positive' : 'negative';
    const profitClass = summary.totalProfitKRW >= 0 ? 'positive' : 'negative';
    const usCount = holdings.filter((h) => h.market === 'US').length;
    const krCount = holdings.filter((h) => h.market === 'KR').length;

    return (
        <div className="summary-grid">
            <SummaryCard label="총 평가금액" value={formatKRW(summary.totalValueKRW)} subtext={`투자금 ${formatKRW(summary.totalCostKRW)}`} subClass="neutral" stagger="stagger-1" />
            <SummaryCard label="총 수익률" value={formatPercent(summary.totalReturnPct)} subtext={`목표 ${targetReturn}%`} subClass={retClass} stagger="stagger-2" />
            <SummaryCard label="총 수익금" value={formatKRW(summary.totalProfitKRW)} subtext={summary.totalProfitKRW >= 0 ? '▲ 수익' : '▼ 손실'} subClass={profitClass} stagger="stagger-3" />
            <SummaryCard label="보유 종목" value={`${summary.holdingsCount}종목`} subtext={`🇺🇸 ${usCount} · 🇰🇷 ${krCount}`} subClass="neutral" stagger="stagger-4" />
        </div>
    );
}
