export function formatKRW(value) {
    if (value >= 1e8) return '₩' + (value / 1e8).toFixed(1) + '억';
    if (value >= 1e4) return '₩' + (value / 1e4).toFixed(0) + '만';
    return '₩' + Math.round(value).toLocaleString();
}

export function formatUSD(value) {
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
}

export function formatVolume(vol) {
    if (!vol) return '—';
    if (vol > 1e8) return (vol / 1e8).toFixed(1) + '억';
    if (vol > 1e4) return (vol / 1e4).toFixed(0) + '만';
    return vol.toLocaleString();
}

export function formatMarketCap(mc) {
    if (!mc) return '—';
    if (mc > 1e12) return '$' + (mc / 1e12).toFixed(1) + 'T';
    if (mc > 1e9) return '$' + (mc / 1e9).toFixed(0) + 'B';
    if (mc > 1e6) return '$' + (mc / 1e6).toFixed(0) + 'M';
    return '—';
}

export function formatPrice(price, market) {
    if (market === 'KR') return '₩' + Math.round(price).toLocaleString();
    return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
