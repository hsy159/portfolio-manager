export function isKRSymbol(symbol) {
    return symbol.includes('.KS') || symbol.includes('.KQ') || /^\d{6}$/.test(symbol);
}

export function cleanSymbol(symbol) {
    return symbol.replace('.KS', '').replace('.KQ', '');
}

export function getIconText(symbol) {
    return cleanSymbol(symbol).slice(0, 2);
}

export function getFlag(market) {
    return market === 'US' ? '🇺🇸' : '🇰🇷';
}

export function normalizeSymbol(ticker) {
    if (/^\d{6}$/.test(ticker)) return ticker + '.KS';
    return ticker;
}
