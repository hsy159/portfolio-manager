import { useState } from 'react';

export default function HoldingsRowEdit({ holding, index, onSave, onCancel }) {
    const [name, setName] = useState(holding.name);
    const [qty, setQty] = useState(holding.qty);
    const [buyPrice, setBuyPrice] = useState(holding.buyPrice);

    return (
        <tr>
            <td>
                <input className="edit-inline-input" style={{ width: 120, textAlign: 'left' }} value={name} onChange={(e) => setName(e.target.value)} />
            </td>
            <td><input className="edit-inline-input" type="number" value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} /></td>
            <td><input className="edit-inline-input" type="number" value={buyPrice} onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)} /></td>
            <td colSpan="4"></td>
            <td>
                <div className="edit-actions">
                    <button className="edit-save-btn" onClick={() => onSave(index, { name, qty, buyPrice })}>✓</button>
                    <button className="edit-cancel-btn" onClick={onCancel}>✕</button>
                </div>
            </td>
        </tr>
    );
}
