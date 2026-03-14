export default function SummaryCard({ label, value, subtext, subClass = 'neutral', stagger = '' }) {
    return (
        <div className={`summary-card fade-in ${stagger}`}>
            <div className="card-label">{label}</div>
            <div className="card-value">{value}</div>
            <div className={`card-change ${subClass}`}>{subtext}</div>
        </div>
    );
}
