import { NavLink } from 'react-router-dom';
import useUiStore from '../../stores/uiStore';
import useWatchlistStore from '../../stores/watchlistStore';
import useTheme from '../../hooks/useTheme';

const navItems = [
    { to: '/dashboard', label: '대시보드', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { to: '/search', label: '종목 검색', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { to: '/watchlist', label: '관심종목', badge: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
    { to: '/rebalance', label: '리밸런싱', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-8"/></svg> },
    { to: '/analysis', label: '분석', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 3"/></svg> },
];

const settingsItem = { to: '/settings', label: '설정', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4m-9-9h4m14 0h4"/></svg> };

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const apiStatus = useUiStore((s) => s.apiStatus);
    const statusText = useUiStore((s) => s.statusText);
    const watchlist = useWatchlistStore((s) => s.watchlist);

    return (
        <nav className="sidebar">
            <div className="logo">
                <div className="logo-icon">✈</div>
                <div>
                    <div className="logo-text">Portfolio Pilot</div>
                    <div className="logo-sub">Smart Investing</div>
                </div>
            </div>

            <div className="nav-section">Menu</div>
            {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    {item.icon}
                    {item.label}
                    {item.badge && <span className="nav-badge">{watchlist.length}</span>}
                </NavLink>
            ))}

            <div className="nav-section">설정</div>
            <NavLink to={settingsItem.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                {settingsItem.icon}
                {settingsItem.label}
            </NavLink>

            <div className="sidebar-footer">
                <div className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    )}
                    <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
                </div>
                <div className="api-status" style={{ padding: '10px 14px' }}>
                    <div className={`status-dot ${apiStatus}`}></div>
                    <span>{statusText}</span>
                </div>
            </div>
        </nav>
    );
}
