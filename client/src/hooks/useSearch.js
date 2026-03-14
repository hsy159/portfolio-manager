import { useState, useRef, useCallback } from 'react';
import useUiStore from '../stores/uiStore';
import { apiGet } from '../api/client';

export default function useSearch(delay = 500) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [quotes, setQuotes] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const timerRef = useRef(null);

    const search = useCallback(
        (q) => {
            setQuery(q);

            if (timerRef.current) clearTimeout(timerRef.current);

            if (!q || q.length < 2) {
                setResults([]);
                setQuotes({});
                setIsSearching(false);
                return;
            }

            const apiStatus = useUiStore.getState().apiStatus;
            if (apiStatus !== 'connected') {
                setResults([]);
                setQuotes({});
                setIsSearching(false);
                return;
            }

            setIsSearching(true);

            timerRef.current = setTimeout(async () => {
                try {
                    const data = await apiGet(
                        '/api/search?q=' + encodeURIComponent(q)
                    );

                    if (!data.results || !data.results.length) {
                        setResults([]);
                        setQuotes({});
                        setIsSearching(false);
                        return;
                    }

                    const top10 = data.results.slice(0, 10);
                    setResults(top10);

                    // Fetch quotes for search results
                    const symbols = top10.map((r) => r.symbol);
                    try {
                        const qData = await apiGet(
                            '/api/quote?symbols=' +
                                encodeURIComponent(symbols.join(','))
                        );
                        const quoteMap = {};
                        if (qData.results) {
                            qData.results.forEach((r) => {
                                quoteMap[r.symbol] = r;
                            });
                        }
                        setQuotes(quoteMap);
                    } catch (e) {
                        // quote fetch is non-critical
                    }
                } catch (e) {
                    console.error('Search error:', e);
                    setResults([]);
                    setQuotes({});
                } finally {
                    setIsSearching(false);
                }
            }, delay);
        },
        [delay]
    );

    return { query, setQuery: search, results, quotes, isSearching };
}
