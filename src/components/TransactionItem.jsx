// TransactionItem.jsx — Single transaction row
import './TransactionItem.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export default function TransactionItem({ tx, profileName, onEdit, onDelete, style }) {
  const isPaid = tx.direction === 'i_paid';

  return (
    <div className="tx-item card animate-in" style={style}>
      <div className="tx-item-left">
        <div className={`tx-direction-dot ${isPaid ? 'dot-green' : 'dot-red'}`} />
        <div className="tx-item-info">
          <p className="tx-item-note">
            {tx.note || (isPaid ? `I paid for ${profileName}` : `${profileName} paid for me`)}
          </p>
          <p className="tx-item-meta">
            <span className={`tx-badge ${isPaid ? 'badge-green' : 'badge-red'}`}>
              {isPaid ? '↑ I paid' : '↓ They paid'}
            </span>
            <span className="tx-date">{formatDate(tx.date)}</span>
          </p>
        </div>
      </div>
      <div className="tx-item-right">
        <span className={`tx-amount ${isPaid ? 'amount-green' : 'amount-red'}`}>
          {isPaid ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
        <button
          id={`edit-tx-${tx.id}`}
          className="tx-action-btn"
          onClick={onEdit}
          aria-label="Edit transaction"
        >
          ✎
        </button>
        <button
          id={`delete-tx-${tx.id}`}
          className="tx-action-btn tx-delete-btn"
          onClick={() => {
            if (window.confirm('Delete this transaction?')) onDelete();
          }}
          aria-label="Delete transaction"
        >
          ×
        </button>
      </div>
    </div>
  );
}
