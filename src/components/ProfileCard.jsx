// ProfileCard.jsx — Card shown on Home for each friend
import { useState, useRef, useEffect } from 'react';
import './ProfileCard.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function ProfileCard({ profile, balance, onClick, onDelete, onEdit, style }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const balanceClass = balance > 0 ? 'owed' : balance < 0 ? 'owe' : 'settled';
  const balanceText =
    balance > 0
      ? `Owes you ${formatCurrency(balance)}`
      : balance < 0
      ? `You owe ${formatCurrency(balance)}`
      : 'Settled';

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuOpen]);

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Remove ${profile.name}? All transactions will be deleted.`)) {
      onDelete();
    }
  };

  return (
    <div
      className="profile-card card animate-in"
      style={{ ...style, zIndex: menuOpen ? 10 : 1 }}
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

      {/* 3-dot menu trigger */}
      <div className="profile-card-menu-wrap" ref={menuRef}>
        <button
          id={`menu-${profile.id}`}
          className="profile-card-dots"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
          aria-label="Options"
        >
          ···
        </button>

        {menuOpen && (
          <div className="profile-card-menu" role="menu">
            <button
              id={`edit-${profile.id}`}
              className="profile-menu-item"
              onClick={handleEdit}
              role="menuitem"
            >
              ✏️ Edit
            </button>
            <div className="profile-menu-divider" />
            <button
              id={`delete-${profile.id}`}
              className="profile-menu-item profile-menu-item--danger"
              onClick={handleDelete}
              role="menuitem"
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
