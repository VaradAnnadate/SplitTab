// App.jsx — simple view-based router (no react-router needed)
import { useState } from 'react';
import { useStore } from './useStore';
import Home from './pages/Home';
import ProfileDetail from './pages/ProfileDetail';
import InvoiceView from './pages/InvoiceView';

export default function App() {
  const store = useStore();
  const [view, setView] = useState({ name: 'home' });

  const navigate = (name, params = {}) => setView({ name, ...params });
  const goHome = () => setView({ name: 'home' });

  if (view.name === 'profile') {
    return (
      <ProfileDetail
        profileId={view.profileId}
        store={store}
        onBack={goHome}
        onInvoice={(profileId) => navigate('invoice', { profileId })}
      />
    );
  }

  if (view.name === 'invoice') {
    return (
      <InvoiceView
        profileId={view.profileId}
        store={store}
        onBack={() => navigate('profile', { profileId: view.profileId })}
      />
    );
  }

  return (
    <Home
      store={store}
      onSelectProfile={(profileId) => navigate('profile', { profileId })}
    />
  );
}
