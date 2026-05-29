// AddTransactionModal.jsx — Bottom sheet to log a transaction
import { useState } from 'react';
import './Modal.css';

export default function AddTransactionModal({ profileName, onAdd, onClose }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState('i_paid'); // 'i_paid' | 'they_paid'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    onAdd({ amount: parsed, note: note.trim(), direction, date });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <h2 className="modal-title">Add Transaction</h2>
        <p className="modal-subtitle">With {profileName}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Direction Picker */}
          <div className="form-group">
            <label className="form-label">Who paid?</label>
            <div className="toggle-group">
              <button
                type="button"
                id="direction-i-paid"
                className={`toggle-option ${direction === 'i_paid' ? 'active-green' : ''}`}
                onClick={() => setDirection('i_paid')}
              >
                <div className="toggle-icon">💸</div>
                <div className="toggle-label">I paid for them</div>
              </button>
              <button
                type="button"
                id="direction-they-paid"
                className={`toggle-option ${direction === 'they_paid' ? 'active-red' : ''}`}
                onClick={() => setDirection('they_paid')}
              >
                <div className="toggle-icon">🙏</div>
                <div className="toggle-label">They paid for me</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-amount">Amount (₹)</label>
            <input
              id="tx-amount"
              className="form-input amount-input"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              autoFocus
            />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-note">Note (optional)</label>
            <input
              id="tx-note"
              className="form-input"
              type="text"
              placeholder="e.g. Dinner, Movie tickets..."
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">Date</label>
            <input
              id="tx-date"
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <button
            id="save-transaction-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
