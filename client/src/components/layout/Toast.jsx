import useUiStore from '../../stores/uiStore';

export default function Toast() {
    const toast = useUiStore((s) => s.toast);
    return (
        <div className={`toast${toast.visible ? ' show' : ''}`}>
            <span>{toast.icon}</span>
            <span>{toast.message}</span>
        </div>
    );
}
