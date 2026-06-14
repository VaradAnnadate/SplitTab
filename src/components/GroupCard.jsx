import './GroupCard.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function GroupCard({ group, settlements, totalSpend, onClick, onDelete, style }) {
  return (
    <div className="group-card card animate-in" style={style}>
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
      <button
        className="group-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`Delete ${group.name}? All group expenses will be deleted.`)) {
            onDelete();
          }
        }}
        aria-label="Delete group"
      >
        ×
      </button>
    </div>
  );
}
