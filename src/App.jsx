// App.jsx — router + OAuth callback handler + sync prompt
import { useState, useEffect } from 'react';
import { useStore } from './useStore';
import Home from './pages/Home';
import ProfileDetail from './pages/ProfileDetail';
import InvoiceView from './pages/InvoiceView';
import GroupsHome from './pages/GroupsHome';
import GroupDetail from './pages/GroupDetail';
import TabBar from './components/TabBar';

export default function App() {
  const store = useStore();
  const [view, setView] = useState({ section: 'friends', name: 'home' });
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const navigate = (section, name, params = {}) => setView({ section, name, ...params });
  const goHome = () => setView({ section: 'friends', name: 'home' });
  const goGroupsHome = () => setView({ section: 'groups', name: 'home' });

  const { session, localProfileCount, importLocalToCloud, authLoading, dataLoading } = store;

  // After Google OAuth redirect, the session will become active.
  // If the user has local data, show the sync prompt.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (session && localProfileCount > 0) {
        setShowSyncPrompt(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [session, localProfileCount]);

  const handleSync = async () => {
    setSyncing(true);
    await importLocalToCloud();
    setSyncing(false);
    setShowSyncPrompt(false);
  };

  // ── Views ──────────────────────────────────────────────────────────────────────
  if (view.section === 'friends' && view.name === 'profile') {
    return (
      <ProfileDetail
        profileId={view.profileId}
        store={store}
        onBack={goHome}
        onInvoice={(profileId) => navigate('friends', 'invoice', { profileId })}
      />
    );
  }

  if (view.section === 'friends' && view.name === 'invoice') {
    return (
      <InvoiceView
        profileId={view.profileId}
        store={store}
        onBack={() => navigate('friends', 'profile', { profileId: view.profileId })}
      />
    );
  }

  if (view.section === 'groups' && view.name === 'detail') {
    return (
      <GroupDetail
        groupId={view.groupId}
        store={store}
        onBack={goGroupsHome}
      />
    );
  }

  return (
    <>
      {view.section === 'groups' ? (
        <GroupsHome
          store={store}
          onSelectGroup={(groupId) => navigate('groups', 'detail', { groupId })}
        />
      ) : (
        <Home
          store={store}
          onSelectProfile={(profileId) => navigate('friends', 'profile', { profileId })}
        />
      )}

      <TabBar
        active={view.section}
        onChange={(section) => navigate(section, 'home')}
      />

      {/* ── Sync prompt after first sign-in ── */}
      {showSyncPrompt && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <div className="modal-handle" />
            <h2 className="modal-title">Sync local data?</h2>
            <p className="modal-subtitle">
              You have {localProfileCount} friend{localProfileCount !== 1 ? 's' : ''} stored on
              this device. Upload them to your account?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                id="sync-yes-btn"
                className="btn btn-primary btn-full"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : '☁️ Yes, sync to cloud'}
              </button>
              <button
                id="sync-no-btn"
                className="btn btn-ghost btn-full"
                onClick={() => setShowSyncPrompt(false)}
                disabled={syncing}
              >
                No, start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global loading overlay (only during data fetch) ── */}
      {(authLoading || dataLoading) && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(245,245,243,0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
        }}>
          <p className="heading-md" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {authLoading ? 'Loading' : 'Syncing'}
          </p>
          <p className="label">please wait…</p>
        </div>
      )}
    </>
  );
}
