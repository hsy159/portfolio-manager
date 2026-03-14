export default function PageHeader({ greeting, title, children }) {
    return (
        <div className="header fade-in">
            <div>
                {greeting && <div className="greeting">{greeting}</div>}
                <div className="page-title">{title}</div>
            </div>
            {children && <div className="header-actions">{children}</div>}
        </div>
    );
}
