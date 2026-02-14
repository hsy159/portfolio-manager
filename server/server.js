import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({origin: '*'}));
app.use(express.json());

// Simple cache
const cache = new Map();

async function cached(key, ttlMs, fn) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < ttlMs) return entry.data;
    const data = await fn();
    cache.set(key, {data, ts: Date.now()});
    return data;
}

// Normalize Korean stock symbols
const norm = s => /^\d{6}$/.test(s) ? s + '.KS' : s;

// ===== QUOTE =====
app.get('/api/quote', async (req, res) => {
    const symbols = (req.query.symbols || '').split(',').map(s => norm(s.trim())).filter(Boolean);
    console.log(`[quote] Request - symbols: ${symbols.join(',')}`);

    try {
        if (!symbols.length) {
            console.log('[quote] Failed - no symbols provided');
            return res.status(400).json({error: 'symbols required'});
        }

        const results = await cached('q:' + symbols.sort().join(','), 30000, async () => {
            const out = [];
            for (const sym of symbols) {
                try {
                    const q = await yahooFinance.quote(sym);
                    console.log(`[quote] Success - ${sym}: ${q.regularMarketPrice} ${q.currency}`);
                    out.push({
                        symbol: q.symbol, name: q.shortName || q.longName || q.symbol,
                        price: q.regularMarketPrice, previousClose: q.regularMarketPreviousClose,
                        change: q.regularMarketChange, changePercent: q.regularMarketChangePercent,
                        volume: q.regularMarketVolume, marketCap: q.marketCap,
                        currency: q.currency, exchange: q.exchange, marketState: q.marketState,
                    });
                } catch (e) {
                    console.log(`[quote] Failed - ${sym}: ${e.message}`);
                    out.push({symbol: sym, error: e.message});
                }
            }
            return out;
        });
        console.log(`[quote] Response sent - ${results.length} results`);
        res.json({results, fetchedAt: new Date().toISOString()});
    } catch (err) {
        console.error('[quote] Error:', err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== HISTORY =====
app.get('/api/history', async (req, res) => {
    const {symbol, range = '1mo', interval = '1d'} = req.query;
    console.log(`[history] Request - symbol: ${symbol}, range: ${range}, interval: ${interval}`);

    try {
        if (!symbol) {
            console.log('[history] Failed - no symbol provided');
            return res.status(400).json({error: 'symbol required'});
        }
        const sym = norm(symbol);
        const days = {'1d': 1, '5d': 5, '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730}[range] || 30;
        const period1 = range === 'ytd' ? new Date(new Date().getFullYear(), 0, 1) : new Date(Date.now() - days * 86400000);

        const data = await cached(`h:${sym}:${range}:${interval}`, 300000, () =>
            yahooFinance.chart(sym, {period1, interval})
        );
        const prices = (data.quotes || []).map(q => ({
            date: q.date?.toISOString?.()?.split('T')[0],
            open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume,
        })).filter(p => p.close != null);

        console.log(`[history] Success - ${sym}: ${prices.length} data points`);
        res.json({symbol: sym, range, interval, prices, fetchedAt: new Date().toISOString()});
    } catch (err) {
        console.error('[history] Error:', symbol, err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== EXCHANGE RATE =====
app.get('/api/exchange', async (req, res) => {
    const from = req.query.from || 'USD', to = req.query.to || 'KRW';
    const sym = `${from}${to}=X`;
    console.log(`[exchange] Request - ${from} to ${to}`);

    try {
        const q = await cached('fx:' + sym, 60000, () => yahooFinance.quote(sym));
        console.log(`[exchange] Success - ${from}${to}: ${q.regularMarketPrice}`);
        res.json({
            rates: [{
                pair: `${from}${to}`,
                rate: q.regularMarketPrice,
                change: q.regularMarketChange,
                changePercent: q.regularMarketChangePercent
            }], fetchedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error('[exchange] Error:', sym, err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== SEARCH =====
app.get('/api/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({error: 'q required'});
        const data = await cached('s:' + q, 600000, () => yahooFinance.search(q));
        const results = (data.quotes || []).map(r => ({
            symbol: r.symbol,
            name: r.shortname || r.longname || r.symbol,
            type: r.quoteType,
            exchange: r.exchange
        }));
        res.json({query: q, results, fetchedAt: new Date().toISOString()});
    } catch (err) {
        console.error('[search]', err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== PORTFOLIO QUOTE =====
app.post('/api/portfolio-quote', async (req, res) => {
    const {holdings} = req.body;
    const symbols = holdings?.map(h => h.symbol) || [];
    console.log(`[portfolio-quote] Request - ${holdings?.length || 0} holdings: ${symbols.join(',')}`);

    try {
        if (!holdings?.length) {
            console.log('[portfolio-quote] Failed - no holdings provided');
            return res.status(400).json({error: 'holdings required'});
        }

        const normalizedSymbols = holdings.map(h => norm(h.symbol));

        // Fetch FX + all quotes
        let usdkrw = 1400;
        try {
            const fx = await yahooFinance.quote('USDKRW=X');
            usdkrw = fx.regularMarketPrice;
            console.log(`[portfolio-quote] FX rate - USDKRW: ${usdkrw}`);
        } catch (e) {
            console.log(`[portfolio-quote] FX Failed - using default rate: ${usdkrw}`);
        }

        const quoteMap = {};
        for (const sym of normalizedSymbols) {
            try {
                quoteMap[sym] = await yahooFinance.quote(sym);
                console.log(`[portfolio-quote] Quote Success - ${sym}: ${quoteMap[sym].regularMarketPrice}`);
            } catch (e) {
                console.log(`[portfolio-quote] Quote Failed - ${sym}: ${e.message}`);
            }
        }

        const results = holdings.map((h, i) => {
            const sym = normalizedSymbols[i];
            const q = quoteMap[sym];
            if (!q) return {...h, symbol: sym, error: 'Not found'};

            const price = q.regularMarketPrice;
            const isKR = q.currency === 'KRW';
            const valueKRW = isKR ? price * h.qty : price * h.qty * usdkrw;
            const costKRW = isKR ? h.buyPrice * h.qty : h.buyPrice * h.qty * usdkrw;

            return {
                symbol: sym, name: q.shortName || q.longName, currency: q.currency,
                currentPrice: price, previousClose: q.regularMarketPreviousClose,
                change: q.regularMarketChange, changePercent: q.regularMarketChangePercent,
                qty: h.qty, buyPrice: h.buyPrice,
                returnPct: Math.round(((price - h.buyPrice) / h.buyPrice) * 10000) / 100,
                valueKRW: Math.round(valueKRW), costKRW: Math.round(costKRW),
                profitKRW: Math.round(valueKRW - costKRW), marketState: q.marketState,
            };
        });

        const tv = results.reduce((s, r) => s + (r.valueKRW || 0), 0);
        const tc = results.reduce((s, r) => s + (r.costKRW || 0), 0);

        console.log(`[portfolio-quote] Success - Total value: ${tv} KRW, Profit: ${tv - tc} KRW`);
        res.json({
            holdings: results,
            summary: {
                totalValueKRW: tv,
                totalCostKRW: tc,
                totalProfitKRW: tv - tc,
                totalReturnPct: Math.round(((tv - tc) / tc) * 10000) / 100,
                holdingsCount: results.length
            },
            exchangeRate: {USDKRW: usdkrw},
            fetchedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[portfolio-quote] Error:', err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== WATCHLIST API =====
const WATCHLIST_FILE = path.join(__dirname, 'watchlist.json');

// GET - 관심종목 목록 조회
app.get('/api/watchlist', async (req, res) => {
    console.log('[watchlist] GET request');
    try {
        const data = await fs.readFile(WATCHLIST_FILE, 'utf-8');
        const watchlist = JSON.parse(data);
        console.log(`[watchlist] Success - ${watchlist.length} items`);
        res.json({watchlist, fetchedAt: new Date().toISOString()});
    } catch (err) {
        console.error('[watchlist] Error:', err.message);
        res.status(500).json({error: err.message});
    }
});

// POST - 관심종목 추가
app.post('/api/watchlist', async (req, res) => {
    const {symbol, name, market, sector, color} = req.body;
    console.log(`[watchlist] POST request - ${symbol}`);

    try {
        if (!symbol || !name) {
            return res.status(400).json({error: 'symbol and name required'});
        }

        const data = await fs.readFile(WATCHLIST_FILE, 'utf-8');
        const watchlist = JSON.parse(data);

        // 중복 체크
        if (watchlist.find(w => w.symbol === symbol)) {
            console.log(`[watchlist] Failed - ${symbol} already exists`);
            return res.status(409).json({error: 'Already in watchlist'});
        }

        const newItem = {
            symbol,
            name,
            market: market || 'US',
            sector: sector || 'Technology',
            color: color || '#95a5c4'
        };

        watchlist.push(newItem);
        await fs.writeFile(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));

        console.log(`[watchlist] Success - Added ${symbol}`);
        res.json({message: 'Added to watchlist', item: newItem, watchlist});
    } catch (err) {
        console.error('[watchlist] Error:', err.message);
        res.status(500).json({error: err.message});
    }
});

// DELETE - 관심종목 삭제
app.delete('/api/watchlist/:symbol', async (req, res) => {
    const {symbol} = req.params;
    console.log(`[watchlist] DELETE request - ${symbol}`);

    try {
        const data = await fs.readFile(WATCHLIST_FILE, 'utf-8');
        let watchlist = JSON.parse(data);

        const originalLength = watchlist.length;
        watchlist = watchlist.filter(w => w.symbol !== symbol);

        if (watchlist.length === originalLength) {
            console.log(`[watchlist] Failed - ${symbol} not found`);
            return res.status(404).json({error: 'Not found in watchlist'});
        }

        await fs.writeFile(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));

        console.log(`[watchlist] Success - Removed ${symbol}`);
        res.json({message: 'Removed from watchlist', watchlist});
    } catch (err) {
        console.error('[watchlist] Error:', err.message);
        res.status(500).json({error: err.message});
    }
});

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
    res.json({status: 'ok', uptime: process.uptime(), cacheSize: cache.size});
});

app.listen(PORT, () => console.log(`\n  Portfolio Pilot Proxy → http://localhost:${PORT}\n`));
