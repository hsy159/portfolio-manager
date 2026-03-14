import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import usePortfolioStore from '../stores/portfolioStore';
import { apiPost } from '../api/client';

export default function AnalysisPage() {
    const holdings = usePortfolioStore((s) => s.holdings);
    const summary = usePortfolioStore((s) => s.summary);
    const liveData = usePortfolioStore((s) => s.liveData);
    const [state, setState] = useState('idle'); // idle | loading | done | error
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');

    const analyze = async () => {
        setState('loading');
        try {
            const reqHoldings = holdings.map((h) => ({ ...h, ...(liveData[h.symbol] || {}) }));
            const data = await apiPost('/api/portfolio-analysis', { holdings: reqHoldings, summary });
            setAnalysis(data.analysis || data);
            setState('done');
        } catch (e) {
            setError(e.message);
            setState('error');
        }
    };

    return (
        <>
            <PageHeader greeting="포트폴리오 분석" title="AI 기반 심층 분석">
                <button className="btn btn-primary" onClick={analyze}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: 6 }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    포트폴리오 분석하기
                </button>
            </PageHeader>

            {state === 'idle' && (
                <div className="panel fade-in stagger-2" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                    <div className="panel-title" style={{ fontSize: 20, marginBottom: 8 }}>로컬 AI 모델을 통한 포트폴리오 분석</div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>위 버튼을 클릭하여 포트폴리오 분석을 시작하세요</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                        <strong>설정 방법:</strong><br />
                        1. 로컬 LLM 서버 실행 (예: Ollama, LM Studio 등)<br />
                        2. 또는 ANTHROPIC_API_KEY 환경변수 설정<br />
                        3. 필요시 LLM_BASE_URL 환경변수로 엔드포인트 지정
                    </div>
                </div>
            )}

            {state === 'loading' && (
                <div className="panel fade-in stagger-2" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <div className="panel-title" style={{ fontSize: 20, marginBottom: 8 }}>분석 중...</div>
                    <div style={{ color: 'var(--text-muted)' }}>AI 모델이 포트폴리오를 분석하고 있습니다</div>
                </div>
            )}

            {state === 'done' && analysis && (
                <div style={{ display: 'grid', gap: 20 }}>
                    <div className="panel fade-in stagger-2">
                        <div className="panel-title">종합 평가</div>
                        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>건강도 점수</div>
                                <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--accent)' }}>{analysis.overallHealth ?? '—'}</div>
                            </div>
                            <div style={{ flex: 3 }}>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>다각화 평가</div>
                                <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysis.diversification || '—'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="panel fade-in stagger-3">
                        <div className="panel-title">리스크 평가</div>
                        <div style={{ marginTop: 16, color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysis.riskAssessment || '—'}</div>
                    </div>
                    <div className="panel fade-in stagger-4">
                        <div className="panel-title">조정 제안</div>
                        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                            {(analysis.recommendations || []).map((rec, i) => (
                                <div key={i} className="rebalance-item">
                                    <div>
                                        <div className="rebalance-ticker">{rec.symbol}</div>
                                        <div className="rebalance-detail">{rec.reason}</div>
                                    </div>
                                    <div className={`rebalance-action action-${rec.action?.toLowerCase() || 'hold'}`}>
                                        {rec.action} {rec.targetAllocation && `→ ${rec.targetAllocation}%`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="panel fade-in stagger-4">
                        <div className="panel-title">장기 투자 조언</div>
                        <div style={{ marginTop: 16, color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysis.longTermAdvice || '—'}</div>
                    </div>
                    <div className="panel fade-in" style={{ marginTop: 20 }}>
                        <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>원본 분석 결과 보기</summary>
                            <pre style={{ marginTop: 16, padding: 16, background: 'var(--bg-primary)', borderRadius: 8, overflowX: 'auto', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                {analysis.rawResponse || JSON.stringify(analysis, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            )}

            {state === 'error' && (
                <div className="panel fade-in stagger-2" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <div className="panel-title" style={{ fontSize: 20, marginBottom: 8, color: 'var(--negative)' }}>분석 실패</div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</div>
                </div>
            )}
        </>
    );
}
