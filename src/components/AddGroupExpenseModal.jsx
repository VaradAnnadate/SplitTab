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

export default function AddGroupExpenseModal({ group, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByMemberId, setPaidByMemberId] = useState(group.members[0]?.id || '');
  const [participantIds, setParticipantIds] = useState(group.members.map(member => member.id));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const parsedAmount = parseFloat(amount);
  const canSave = title.trim() && parsedAmount > 0 && paidByMemberId && participantIds.length > 0;
  const share = canSave ? parsedAmount / participantIds.length : 0;

  const toggleParticipant = (memberId) => {
    setParticipantIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onAdd({
      title,
      amount: parsedAmount,
      paidByMemberId,
      participantIds,
      date,
      note: note.trim(),
    });
  };

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Add Group Expense</h2>
        <p className="modal-subtitle">Split equally for now. Custom splits can come next.</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="group-expense-title">Title</label>
            <input
              id="group-expense-title"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Hotel, Dinner, Fuel"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-expense-amount">Amount (₹)</label>
            <input
              id="group-expense-amount"
              className="form-input amount-input"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paid-by">Paid by</label>
            <select
              id="paid-by"
              className="form-input"
              value={paidByMemberId}
              onChange={e => setPaidByMemberId(e.target.value)}
            >
              {group.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Split between</label>
            <div className="member-check-list">
              {group.members.map(member => (
                <label key={member.id} className="member-check">
                  <input
                    type="checkbox"
                    checked={participantIds.includes(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-expense-date">Date</label>
            <input
              id="group-expense-date"
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-expense-note">Note (optional)</label>
            <input
              id="group-expense-note"
              className="form-input"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Anything useful to remember"
              maxLength={70}
            />
          </div>

          <div className="tx-preview">
            {canSave
              ? `${participantIds.length} member${participantIds.length !== 1 ? 's' : ''} will each owe ${formatCurrency(share)}.`
              : 'Enter an amount and choose who shared this expense.'}
          </div>

          <button className="btn btn-primary btn-full" disabled={!canSave}>
            Save Expense
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
