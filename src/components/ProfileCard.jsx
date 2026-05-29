// ProfileCard.jsx — Card shown on Home for each friend
import { useState } from 'react';
import './ProfileCard.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function ProfileCard({ profile, balance, onClick, onDelete, style }) {
  const [showDelete, setShowDelete] = useState(false);

  const balanceClass =
    balance > 0 ? 'owed' : balance < 0 ? 'owe' : 'settled';

  const balanceText =
    balance > 0
      ? `Owes you ${formatCurrency(balance)}`
      : balance < 0
      ? `You owe ${formatCurrency(balance)}`
      : 'Settled';

  return (
    <div
      className="profile-card card animate-in"
      style={style}
    >
      <button
        id={`profile-${profile.id}`}
        className="profile-card-main"
        onClick={onClick}
      >
        <div className="profile-card-avatar">{profile.emoji}</div>
        <div className="profile-card-info">
          <h2 className="profile-card-name">{profile.name}</h2>
          <p className="profile-card-meta">
            {profile.transactions.length} transaction{profile.transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="profile-card-right">
          <span className={`balance-badge ${balanceClass}`}>{balanceText}</span>
          <span className="profile-card-arrow">›</span>
        </div>
      </button>

      {/* Long-press / delete */}
      <button
        id={`delete-profile-${profile.id}`}
        className="profile-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`Remove ${profile.name}? All transactions will be deleted.`)) {
            onDelete();
          }
        }}
        aria-label="Delete profile"
      >
        ···
      </button>
    </div>
  );
}
