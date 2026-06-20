// src/pages/Home.jsx
import { useState, useRef, useEffect } from 'react';
import AddProfileModal from '../components/AddProfileModal';
import EditProfileModal from '../components/EditProfileModal';
import ProfileCard from '../components/ProfileCard';
import './Home.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function Home({ store, onSelectProfile }) {
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null); // profile object to edit
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    profiles,
    addProfile,
    deleteProfile,
    updateProfile,
    getBalance,
    user,
    isCloud,
    isConfigured,
    loginWithGoogle,
    logout,
  } = store;

  // Close menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showUserMenu]);

  const handleAddProfile = (name, emoji) => {
    addProfile(name, emoji);
    setShowAddProfile(false);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const summary = profiles.reduce(
    (acc, profile) => {
      const balance = getBalance(profile.id);
      if (balance > 0) acc.owed += balance;
      if (balance < 0) acc.owe += Math.abs(balance);
      acc.net += balance;
      return acc;
    },
    { owed: 0, owe: 0, net: 0 }
  );

  // Auth slot — rendered inline with the heading
  const authSlot = isConfigured ? (
    isCloud ? (
      <div className="auth-user-wrap" ref={menuRef}>
        <button
          id="avatar-btn"
          className="avatar-btn"
          onClick={() => setShowUserMenu(v => !v)}
          aria-label="Account menu"
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              className="auth-avatar"
              src={user.user_metadata.avatar_url}
              alt="You"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="auth-avatar auth-avatar-fallback">
              {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
        </button>

        {showUserMenu && (
          <div className="user-menu" role="menu">
            <div className="user-menu-info">
              <p className="user-menu-name">
                {user?.user_metadata?.full_name || 'Signed in'}
              </p>
              <p className="user-menu-email">{user?.email}</p>
            </div>
            <div className="user-menu-divider" />
            <button
              id="sign-out-btn"
              className="user-menu-signout"
              onClick={handleLogout}
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    ) : (
      <button
        id="google-signin-btn"
        className="signin-btn"
        onClick={loginWithGoogle}
      >
        {/* Real coloured Google G */}
        <svg className="google-g" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Sign In
      </button>
    )
  ) : null;

  return (
    <div className="page home-page">

      {/* ── Page header — auth slot sits inline with heading ── */}
      <div className="page-header">
        <p className="label">Your splits</p>
        <div className="header-title-row">
          <h1 className="heading-xl home-title">SPLIT<br />TAB</h1>
          {authSlot}
        </div>
        <p className="home-subtitle">
          {profiles.length === 0
            ? 'Add a friend to get started'
            : `${profiles.length} friend${profiles.length !== 1 ? 's' : ''}`}
        </p>
        {profiles.length > 0 && (
          <div className="home-summary">
            <div className="summary-main">
              <p className="summary-label">Net Balance</p>
              <p className={`summary-amount ${summary.net >= 0 ? 'summary-positive' : 'summary-negative'}`}>
                {summary.net >= 0 ? '+' : '−'}{formatCurrency(summary.net)}
              </p>
            </div>
            <div className="summary-grid">
              <div className="summary-pill">
                <span>You are owed</span>
                <strong>{formatCurrency(summary.owed)}</strong>
              </div>
              <div className="summary-pill">
                <span>You owe</span>
                <strong>{formatCurrency(summary.owe)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Profile list ─────────────────────────────── */}
      <div className="page-content">
        {profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤝</div>
            <p className="empty-state-text">No friends yet.<br />Add one below.</p>
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
                onEdit={() => setEditingProfile(profile)}
                style={{ animationDelay: `${i * 0.025}s` }}
              />
            ))}
            <button
              id="add-profile-btn"
              className="add-list-card animate-in"
              onClick={() => setShowAddProfile(true)}
              style={{ animationDelay: `${profiles.length * 0.025}s` }}
            >
              <span className="add-list-card-icon">+</span>
              <span>
                <span className="add-list-card-title">Add New Friend</span>
                <span className="add-list-card-subtitle">Create another split profile</span>
              </span>
            </button>
          </div>
        )}
        {profiles.length === 0 && (
          <button
            id="add-profile-btn"
            className="add-list-card"
            onClick={() => setShowAddProfile(true)}
          >
            <span className="add-list-card-icon">+</span>
            <span>
              <span className="add-list-card-title">Add Your First Friend</span>
              <span className="add-list-card-subtitle">Start tracking one-to-one expenses</span>
            </span>
          </button>
        )}
      </div>

      {showAddProfile && (
        <AddProfileModal
          onAdd={handleAddProfile}
          onClose={() => setShowAddProfile(false)}
        />
      )}

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onSave={async ({ name, emoji }) => {
            await updateProfile(editingProfile.id, { name, emoji });
            setEditingProfile(null);
          }}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* ── Footer ───────────────────────────────── */}
      <footer className="home-footer">
        <p>Made by <span className="home-footer-name">Varad Annadate</span></p>
        <p className="home-footer-version">v3.3.1</p>
      </footer>

    </div>
  );
}
