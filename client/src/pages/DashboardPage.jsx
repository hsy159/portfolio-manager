import PageHeader from '../components/shared/PageHeader';
import SummaryGrid from '../components/dashboard/SummaryGrid';
import HoldingsTable from '../components/dashboard/HoldingsTable';
import DonutChart from '../components/dashboard/DonutChart';
import GaugeBar from '../components/dashboard/GaugeBar';
import usePortfolio from '../hooks/usePortfolio';
import useUiStore from '../stores/uiStore';

function getGreeting() {
    const h = new Date().getHours();
    const t = h < 6 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    return `${t}, 서연`;
}

export default function DashboardPage() {
    const { refreshData } = usePortfolio();
    const openModal = useUiStore((s) => s.openModal);

    return (
        <>
            <PageHeader greeting={getGreeting()} title="포트폴리오 대시보드">
                <button className="btn btn-ghost" onClick={refreshData}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    새로고침
                </button>
                <button className="btn btn-primary" onClick={() => openModal('holding')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    종목 추가
                </button>
            </PageHeader>
            <SummaryGrid />
            <div className="content-grid fade-in stagger-4">
                <HoldingsTable />
                <div>
                    <DonutChart />
                    <GaugeBar />
                </div>
            </div>
        </>
    );
}
