import './TabBar.css';

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar" aria-label="Primary navigation">
      <button
        className={`tab-bar-btn ${active === 'friends' ? 'active' : ''}`}
        onClick={() => onChange('friends')}
      >
        <span>Friends</span>
      </button>
      <button
        className={`tab-bar-btn ${active === 'groups' ? 'active' : ''}`}
        onClick={() => onChange('groups')}
      >
        <span>Groups</span>
      </button>
    </nav>
  );
}
