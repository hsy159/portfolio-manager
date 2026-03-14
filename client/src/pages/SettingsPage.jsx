import PageHeader from '../components/shared/PageHeader';
import useUiStore from '../stores/uiStore';

export default function SettingsPage() {
    const targetReturn = useUiStore((s) => s.targetReturn);
    const setTargetReturn = useUiStore((s) => s.setTargetReturn);
    const refreshInterval = useUiStore((s) => s.refreshInterval);
    const setRefreshInterval = useUiStore((s) => s.setRefreshInterval);

    return (
        <>
            <PageHeader greeting="앱 설정" title="환경 설정" />
            <div className="panel fade-in stagger-2" style={{ maxWidth: 600 }}>
                <div className="form-group">
                    <label className="form-label">목표 연간 수익률</label>
                    <input type="number" className="form-input" value={targetReturn} min="0" max="100"
                        onChange={(e) => setTargetReturn(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label className="form-label">자동 새로고침 간격</label>
                    <select className="form-input" value={refreshInterval} onChange={(e) => setRefreshInterval(parseInt(e.target.value))}>
                        <option value="0">비활성</option>
                        <option value="30">30초</option>
                        <option value="60">1분</option>
                        <option value="300">5분</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">포트폴리오 초기화</label>
                    <button className="btn-danger" onClick={() => {
                        if (confirm('정말 초기화하시겠습니까?')) {
                            localStorage.removeItem('holdings');
                            localStorage.removeItem('watchlist');
                            location.reload();
                        }
                    }}>기본 데이터로 복원</button>
                </div>
            </div>
        </>
    );
}
