import { useState } from 'react';
import AddGroupExpenseModal from '../components/AddGroupExpenseModal';
import './GroupDetail.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export default function GroupDetail({ groupId, store, onBack }) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const {
    getGroup,
    addGroupExpense,
    deleteGroupExpense,
    getGroupBalances,
    getGroupSettlements,
  } = store;

  const group = getGroup(groupId);
  if (!group) return null;

  const balances = getGroupBalances(groupId);
  const settlements = getGroupSettlements(groupId);
  const totalSpend = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const memberById = Object.fromEntries(group.members.map(member => [member.id, member]));
  const sortedExpenses = [...group.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page group-detail-page">
      <div className="page-header group-detail-header">
        <button id="group-back-btn" className="back-btn" onClick={onBack}>
          ← Groups
        </button>

        <div className="group-hero">
          <div className="group-avatar-lg">{group.emoji}</div>
          <div>
            <p className="label">group</p>
            <h1 className="heading-lg group-name">{group.name.toUpperCase()}</h1>
          </div>
        </div>

        <div className="group-total-card">
          <p className="balance-card-label">TOTAL SPEND</p>
          <p className="group-total-amount">{formatCurrency(totalSpend)}</p>
          <p className="balance-card-desc">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} · {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="group-section">
          <div className="section-header">
            <p className="label">Balances</p>
            <span className="tx-count">{settlements.length}</span>
          </div>

          <div className="member-balance-list">
            {group.members.map(member => {
              const balance = balances[member.id] || 0;
              const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'settled';
              return (
                <div key={member.id} className="member-balance-row card">
                  <div>
                    <p className="member-name">{member.name}</p>
                    <p className="member-status">
                      {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'}
                    </p>
                  </div>
                  <strong className={`member-amount member-amount--${balanceClass}`}>
                    {balance > 0 ? '+' : balance < 0 ? '−' : ''}{formatCurrency(balance)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="group-section">
          <div className="section-header">
            <p className="label">Settle up</p>
          </div>
          {settlements.length === 0 ? (
            <div className="settled-box">Everyone is even.</div>
          ) : (
            <div className="settlement-list">
              {settlements.map((settlement, index) => (
                <div key={`${settlement.fromMemberId}-${settlement.toMemberId}-${index}`} className="settlement-row card">
                  <span>{settlement.fromName}</span>
                  <span className="settlement-arrow">pays</span>
                  <span>{settlement.toName}</span>
                  <strong>{formatCurrency(settlement.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="group-section">
          <div className="section-header">
            <p className="label">Expenses</p>
            <span className="tx-count">{group.expenses.length}</span>
          </div>

          {sortedExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧾</div>
              <p className="empty-state-text">No group expenses yet.<br />Add one below.</p>
            </div>
          ) : (
            <div className="group-expense-list">
              {sortedExpenses.map((expense) => (
                <div key={expense.id} className="group-expense-row card">
                  <div className="group-expense-main">
                    <p className="group-expense-title">{expense.title}</p>
                    <p className="group-expense-meta">
                      Paid by {memberById[expense.paidByMemberId]?.name || 'Someone'} · {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="group-expense-right">
                    <strong>{formatCurrency(expense.amount)}</strong>
                    <button
                      className="tx-action-btn tx-delete-btn"
                      onClick={() => {
                        if (window.confirm('Delete this group expense?')) {
                          deleteGroupExpense(groupId, expense.id);
                        }
                      }}
                      aria-label="Delete group expense"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                id="add-group-expense-btn"
                className="add-list-card"
                onClick={() => setShowAddExpense(true)}
              >
                <span className="add-list-card-icon">+</span>
                <span>
                  <span className="add-list-card-title">Add Group Expense</span>
                  <span className="add-list-card-subtitle">Split a bill across selected members</span>
                </span>
              </button>
            </div>
          )}
          {sortedExpenses.length === 0 && (
            <button
              id="add-group-expense-btn"
              className="add-list-card"
              onClick={() => setShowAddExpense(true)}
            >
              <span className="add-list-card-icon">+</span>
              <span>
                <span className="add-list-card-title">Add First Expense</span>
                <span className="add-list-card-subtitle">Split a bill across selected members</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {showAddExpense && (
        <AddGroupExpenseModal
          group={group}
          onAdd={(expense) => {
            addGroupExpense(groupId, expense);
            setShowAddExpense(false);
          }}
          onClose={() => setShowAddExpense(false)}
        />
      )}
    </div>
  );
}
