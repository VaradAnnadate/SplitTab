// AddTransactionModal.jsx — Bottom sheet to log or edit a transaction
import { useState } from 'react';
import ModalPortal from './ModalPortal';
import './Modal.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export default function AddTransactionModal({
  profileName,
  onAdd,
  onClose,
  initialTransaction = null,
}) {
  const isEditing = !!initialTransaction;
  const [amount, setAmount] = useState(initialTransaction?.amount?.toString() || '');
  const [note, setNote] = useState(initialTransaction?.note || '');
  const [direction, setDirection] = useState(initialTransaction?.direction || 'i_paid'); // 'i_paid' | 'they_paid'
  const [date, setDate] = useState(initialTransaction?.date || new Date().toISOString().split('T')[0]);

  const parsedAmount = parseFloat(amount);
  const hasValidAmount = parsedAmount > 0;
  const previewText = !hasValidAmount
    ? 'Enter an amount to preview the balance effect.'
    : direction === 'i_paid'
    ? `${profileName} will owe you ${formatCurrency(parsedAmount)} more.`
    : `Your balance with ${profileName} will reduce by ${formatCurrency(parsedAmount)}.`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidAmount) return;
    onAdd({ amount: parsedAmount, note: note.trim(), direction, date });
  };

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <h2 className="modal-title">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
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

          {/* Note / Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-note">Title</label>
            <input
              id="tx-note"
              className="form-input"
              type="text"
              placeholder="e.g. Dinner, Movie tickets..."
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={60}
              autoFocus
            />
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

          <div className={`tx-preview ${direction === 'i_paid' ? 'tx-preview--positive' : 'tx-preview--negative'}`}>
            {previewText}
          </div>

          <button
            id="save-transaction-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!hasValidAmount}
          >
            {isEditing ? 'Save Changes' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
