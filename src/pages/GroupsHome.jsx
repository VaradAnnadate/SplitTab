import { useState } from 'react';
import AddGroupModal from '../components/AddGroupModal';
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
            <p className="empty-state-text">No groups yet.<br />Create one below.</p>
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
            <button
              id="add-group-btn"
              className="add-list-card animate-in"
              onClick={() => setShowAddGroup(true)}
              style={{ animationDelay: `${groups.length * 0.025}s` }}
            >
              <span className="add-list-card-icon">+</span>
              <span>
                <span className="add-list-card-title">Create New Group</span>
                <span className="add-list-card-subtitle">Trips, events, roommates, and shared tabs</span>
              </span>
            </button>
          </div>
        )}
        {groups.length === 0 && (
          <button
            id="add-group-btn"
            className="add-list-card"
            onClick={() => setShowAddGroup(true)}
          >
            <span className="add-list-card-icon">+</span>
            <span>
              <span className="add-list-card-title">Create Your First Group</span>
              <span className="add-list-card-subtitle">Split a trip, event, or shared house</span>
            </span>
          </button>
        )}
      </div>

      {showAddGroup && (
        <AddGroupModal
          onAdd={async (group) => {
            const groupId = await addGroup(group);
            setShowAddGroup(false);
            if (groupId) onSelectGroup(groupId);
          }}
          onClose={() => setShowAddGroup(false)}
        />
      )}

      <footer className="groups-footer">
        <p>Made by <span className="groups-footer-name">Varad Annadate</span></p>
        <p className="groups-footer-version">v3.3.1</p>
      </footer>
    </div>
  );
}
