import { cleanSymbol, getFlag } from '../../utils/symbol';
import { formatKRW, formatPercent } from '../../utils/format';

export default function HoldingsRow({ holding, liveItem, totalValue, exchangeRate, index, onEdit, onDelete }) {
    const d = liveItem || {};
    const isKR = holding.market === 'KR';
    const currentPrice = d.currentPrice ?? 0;
    const returnPct = d.returnPct ?? 0;
    const valueKRW = d.valueKRW ?? 0;
    const weight = totalValue > 0 ? (valueKRW / totalValue) * 100 : 0;
    const retClass = returnPct >= 0 ? 'positive-text' : 'negative-text';
    const priceStr = isKR ? `₩${Math.round(currentPrice).toLocaleString()}` : `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const avgStr = isKR ? `₩${Math.round(holding.buyPrice).toLocaleString()}` : `$${holding.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const iconText = cleanSymbol(holding.symbol).slice(0, 2);

    return (
        <tr>
            <td>
                <div className="ticker-cell">
                    <div className="ticker-icon" style={{ background: holding.color || '#5a6d94' }}>{iconText}</div>
                    <div>
                        <div className="ticker-name">{holding.name} {getFlag(holding.market)}</div>
                        <div className="ticker-symbol">{cleanSymbol(holding.symbol)}</div>
                    </div>
                </div>
            </td>
            <td className="mono">{holding.qty.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
            <td className="mono">{avgStr}</td>
            <td className="mono">{priceStr}</td>
            <td className={`mono ${retClass}`}>{formatPercent(returnPct)}</td>
            <td className="mono">{formatKRW(valueKRW)}</td>
            <td>
                <div className="weight-bar"><div className="weight-bar-fill" style={{ width: `${Math.min(weight, 100)}%` }}></div></div>
                <span className="mono" style={{ fontSize: 12 }}>{weight.toFixed(1)}%</span>
            </td>
            <td>
                <div className="edit-actions">
                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(index); }}>✏️</button>
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(index); }}>🗑</button>
                </div>
            </td>
        </tr>
    );
}
