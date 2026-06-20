import { useState } from 'react';
import AddGroupModal from '../components/AddGroupModal';
import FloatingActionButton from '../components/FloatingActionButton';
import GroupCard from '../components/GroupCard';
import './GroupsHome.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function GroupsHome({ store, onSelectGroup }) {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const { groups, addGroup, deleteGroup, getGroupSettlements } = store;

  const totalSpend = groups.reduce(
    (sum, group) => sum + group.expenses.reduce((acc, expense) => acc + expense.amount, 0),
    0
  );
  const openPayments = groups.reduce(
    (sum, group) => sum + getGroupSettlements(group.id).length,
    0
  );

  return (
    <div className="page groups-page">
      <div className="page-header">
        <p className="label">Events & groups</p>
        <div className="header-title-row">
          <h1 className="heading-xl groups-title">GROUP<br />TABS</h1>
        </div>
        <p className="home-subtitle">
          {groups.length === 0
            ? 'Create a trip, event, or shared house'
            : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
        </p>

        {groups.length > 0 && (
          <div className="groups-summary">
            <div>
              <p className="summary-label">Group Spend</p>
              <p className="groups-summary-amount">{formatCurrency(totalSpend)}</p>
            </div>
            <div className="groups-summary-side">
              <span>{openPayments}</span>
              <p>open payment{openPayments !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      <div className="page-content">
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">No groups yet.<br />Tap + to create one.</p>
          </div>
        ) : (
          <div className="group-list">
            {groups.map((group, i) => (
              <GroupCard
                key={group.id}
                group={group}
                totalSpend={group.expenses.reduce((sum, expense) => sum + expense.amount, 0)}
                settlements={getGroupSettlements(group.id)}
                onClick={() => onSelectGroup(group.id)}
                onDelete={() => deleteGroup(group.id)}
                style={{ animationDelay: `${i * 0.025}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton
        id="add-group-btn"
        onClick={() => setShowAddGroup(true)}
        ariaLabel="Add group"
      />

      {showAddGroup && (
        <AddGroupModal
          onAdd={(group) => {
            const groupId = addGroup(group);
            setShowAddGroup(false);
            onSelectGroup(groupId);
          }}
          onClose={() => setShowAddGroup(false)}
        />
      )}
    </div>
  );
}
