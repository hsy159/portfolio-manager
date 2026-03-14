import usePortfolioStore from '../../stores/portfolioStore';

const TICKERS = [
    { key: 'USDKRW=X', label: 'USD/KRW' },
    { key: '^GSPC', label: 'S&P 500' },
    { key: '^IXIC', label: 'Nasdaq' },
    { key: '^DJI', label: 'Dow' },
    { key: '^KS11', label: 'KOSPI' },
    { key: '^KQ11', label: 'KOSDAQ' },
    { key: 'BTC-USD', label: 'BTC' },
];

export default function TickerBar() {
    const tickerData = usePortfolioStore((s) => s.tickerData);

    return (
        <div className="ticker-bar">
            {TICKERS.map(({ key, label }) => {
                const d = tickerData[key];
                const price = d ? d.price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';
                const chg = d ? d.changePercent : null;
                const chgColor = chg > 0 ? 'var(--positive)' : chg < 0 ? 'var(--negative)' : 'var(--text-muted)';
                const chgText = chg != null ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : '—';
                return (
                    <div className="ticker-item" key={key}>
                        <span className="ticker-item-label">{label}</span>
                        <span className="ticker-item-value">{price}</span>
                        <span style={{ fontSize: 11, color: chgColor }}>{chgText}</span>
                    </div>
                );
            })}
        </div>
    );
}
