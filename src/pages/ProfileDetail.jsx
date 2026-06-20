// ProfileDetail.jsx — Transaction history + add transaction
import { useState } from 'react';
import TransactionItem from '../components/TransactionItem';
import AddTransactionModal from '../components/AddTransactionModal';
import './ProfileDetail.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export default function ProfileDetail({ profileId, store, onBack, onInvoice }) {
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const {
    getProfile,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    getBalance,
  } = store;

  const profile = getProfile(profileId);
  if (!profile) return null;

  const balance = getBalance(profileId);
  const sorted = [...profile.transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const balanceLabel =
    balance > 0
      ? `${profile.name} owes you ${formatCurrency(balance)}`
      : balance < 0
      ? `You owe ${profile.name} ${formatCurrency(balance)}`
      : 'All settled up 🎉';

  const balanceClass =
    balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'settled';

  const handleSettleUp = () => {
    if (balance === 0) return;
    const amount = Math.abs(balance);
    const direction = balance > 0 ? 'they_paid' : 'i_paid';
    const message = balance > 0
      ? `Record that ${profile.name} paid you ${formatCurrency(amount)}?`
      : `Record that you paid ${profile.name} ${formatCurrency(amount)}?`;

    if (window.confirm(message)) {
      addTransaction(profileId, {
        amount,
        direction,
        note: 'Settlement',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="page profile-page">
      {/* Header */}
      <div className="page-header profile-header">
        <button id="back-btn" className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="profile-hero">
          <div className="profile-avatar-lg">{profile.emoji}</div>
          <div>
            <p className="label">friend</p>
            <h1 className="heading-lg profile-name">{profile.name.toUpperCase()}</h1>
          </div>
        </div>

        {/* Balance */}
        <div className={`balance-card balance-card--${balanceClass}`}>
          <p className="balance-card-label">BALANCE</p>
          <p className="balance-card-amount">
            {balance === 0 ? '₹0' : formatCurrency(balance)}
          </p>
          <p className="balance-card-desc">{balanceLabel}</p>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button
            id="invoice-btn"
            className="btn btn-ghost btn-full"
            onClick={() => onInvoice(profileId)}
          >
            📄 Generate Invoice
          </button>
          <button
            id="settle-up-btn"
            className="btn btn-primary btn-full"
            onClick={handleSettleUp}
            disabled={balance === 0}
          >
            Settle Up
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="page-content">
        <div className="section-header">
          <p className="label">Transactions</p>
          <div className="section-header-right">
            <span className="tx-count">{profile.transactions.length}</span>
            {sorted.length > 0 && (
              <button
                id="clear-all-btn"
                className="clear-all-btn"
                onClick={() => {
                  if (window.confirm(`Clear all ${sorted.length} transaction${sorted.length !== 1 ? 's' : ''} with ${profile.name}? This cannot be undone.`)) {
                    clearTransactions(profileId);
                  }
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <p className="empty-state-text">No transactions yet.<br />Add one below.</p>
          </div>
        ) : (
          <div className="tx-list">
            {sorted.map((tx, i) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                profileName={profile.name}
                onEdit={() => setEditingTx(tx)}
                onDelete={() => deleteTransaction(profileId, tx.id)}
                style={{ animationDelay: `${i * 0.02}s` }}
              />
            ))}
            <button
              id="add-transaction-btn"
              className="add-list-card animate-in"
              onClick={() => setShowAddTx(true)}
              style={{ animationDelay: `${sorted.length * 0.02}s` }}
            >
              <span className="add-list-card-icon">+</span>
              <span>
                <span className="add-list-card-title">Add Transaction</span>
                <span className="add-list-card-subtitle">Record who paid and update the balance</span>
              </span>
            </button>
          </div>
        )}
        {sorted.length === 0 && (
          <button
            id="add-transaction-btn"
            className="add-list-card"
            onClick={() => setShowAddTx(true)}
          >
            <span className="add-list-card-icon">+</span>
            <span>
              <span className="add-list-card-title">Add First Transaction</span>
              <span className="add-list-card-subtitle">Record who paid and update the balance</span>
            </span>
          </button>
        )}
      </div>

      {showAddTx && (
        <AddTransactionModal
          profileName={profile.name}
          onAdd={(tx) => {
            addTransaction(profileId, tx);
            setShowAddTx(false);
          }}
          onClose={() => setShowAddTx(false)}
        />
      )}

      {editingTx && (
        <AddTransactionModal
          profileName={profile.name}
          initialTransaction={editingTx}
          onAdd={(tx) => {
            updateTransaction(profileId, editingTx.id, tx);
            setEditingTx(null);
          }}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
