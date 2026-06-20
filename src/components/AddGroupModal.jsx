import { useState } from 'react';
import ModalPortal from './ModalPortal';
import './Modal.css';

const GROUP_EMOJIS = ['👥', '🏖️', '🏠', '🎉', '🚗', '🍽️', '🎬', '🏕️', '💼', '🎁', '✈️', '🏟️'];

export default function AddGroupModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [membersText, setMembersText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const members = membersText
    .split('\n')
    .map(v => v.trim())
    .filter(Boolean)
    .map(n => ({ name: n, emoji: '👤' }));

  // Allow at least 1 member (groups can have 1+ people)
  const canSave = name.trim() && members.length >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || loading) return;
    setError('');
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), emoji, members });
    } catch (err) {
      console.error('Create group error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Create Group</h2>
        <p className="modal-subtitle">Trips, events, roommates, parties, anything shared.</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="group-name">Group name</label>
            <input
              id="group-name"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Goa Trip"
              maxLength={36}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Group type</label>
            <div className="emoji-grid">
              {GROUP_EMOJIS.map(value => (
                <button
                  key={value}
                  type="button"
                  className={`emoji-btn ${emoji === value ? 'selected' : ''}`}
                  onClick={() => setEmoji(value)}
                  disabled={loading}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-members">
              Members <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>— one name per line</span>
            </label>
            <textarea
              id="group-members"
              className="form-input textarea-input"
              value={membersText}
              onChange={e => setMembersText(e.target.value)}
              placeholder={'Varad\nRohit\nArjun\nAryan'}
              rows={5}
              disabled={loading}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: '0.82rem', fontWeight: 600, marginBottom: 12 }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!canSave || loading}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
