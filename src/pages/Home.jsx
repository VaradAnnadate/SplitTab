// Home.jsx — Profile list page
import { useState } from 'react';
import AddProfileModal from '../components/AddProfileModal';
import ProfileCard from '../components/ProfileCard';
import './Home.css';

export default function Home({ store, onSelectProfile }) {
  const [showAddProfile, setShowAddProfile] = useState(false);
  const { profiles, addProfile, deleteProfile, getBalance } = store;

  const handleAddProfile = (name, emoji) => {
    addProfile(name, emoji);
    setShowAddProfile(false);
  };

  return (
    <div className="page home-page">
      <div className="page-header">
        <p className="label">Your splits</p>
        <h1 className="heading-xl home-title">SPLIT<br />TAB</h1>
        <p className="home-subtitle">
          {profiles.length === 0
            ? 'Add a friend to get started'
            : `${profiles.length} friend${profiles.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="page-content">
        {profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤝</div>
            <p className="empty-state-text">No friends yet.<br />Tap + to add one.</p>
          </div>
        ) : (
          <div className="profile-list">
            {profiles.map((profile, i) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                balance={getBalance(profile.id)}
                onClick={() => onSelectProfile(profile.id)}
                onDelete={() => deleteProfile(profile.id)}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        id="add-profile-btn"
        className="fab"
        onClick={() => setShowAddProfile(true)}
        aria-label="Add friend"
      >
        +
      </button>

      {showAddProfile && (
        <AddProfileModal
          onAdd={handleAddProfile}
          onClose={() => setShowAddProfile(false)}
        />
      )}
    </div>
  );
}
