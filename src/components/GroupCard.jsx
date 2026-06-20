import { useState, useRef, useEffect } from 'react';
import './GroupCard.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function GroupCard({ group, settlements, totalSpend, onClick, onDelete, onEdit, style }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside tap
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
    if (window.confirm(`Delete "${group.name}"? All group expenses will be deleted.`)) {
      onDelete();
    }
  };

  return (
    <div
      className="group-card card animate-in"
      style={{ ...style, zIndex: menuOpen ? 10 : 1 }}
    >
      <button className="group-card-main" onClick={onClick}>
        <div className="group-card-avatar">{group.emoji}</div>
        <div className="group-card-info">
          <h2 className="group-card-name">{group.name}</h2>
          <p className="group-card-meta">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} · {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="group-card-right">
          <span className="group-total">{formatCurrency(totalSpend)}</span>
          <span className={`group-status ${settlements.length === 0 ? 'settled' : 'open'}`}>
            {settlements.length === 0 ? 'Settled' : `${settlements.length} payment${settlements.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </button>

      {/* 3-dot menu */}
      <div className="group-card-menu-wrap" ref={menuRef}>
        <button
          className="group-card-dots"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
          aria-label="Options"
        >
          ···
        </button>

        {menuOpen && (
          <div className="group-card-menu" role="menu">
            <button
              className="profile-menu-item"
              onClick={handleEdit}
              role="menuitem"
            >
              ✏️ Edit
            </button>
            <div className="profile-menu-divider" />
            <button
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
