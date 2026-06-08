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
  const { getProfile, addTransaction, deleteTransaction, clearTransactions, getBalance } = store;

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
            <p className="empty-state-text">No transactions yet.<br />Tap + to add one.</p>
          </div>
        ) : (
          <div className="tx-list">
            {sorted.map((tx, i) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                profileName={profile.name}
                onDelete={() => deleteTransaction(profileId, tx.id)}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        id="add-transaction-btn"
        className="fab"
        onClick={() => setShowAddTx(true)}
        aria-label="Add transaction"
      >
        +
      </button>

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
    </div>
  );
}
