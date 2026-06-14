import { useState } from 'react';
import './Modal.css';

const GROUP_EMOJIS = ['👥', '🏖️', '🏠', '🎉', '🚗', '🍽️', '🎬', '🏕️', '💼', '🎁', '✈️', '🏟️'];

export default function AddGroupModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [membersText, setMembersText] = useState('');

  const members = membersText
    .split('\n')
    .map(value => value.trim())
    .filter(Boolean)
    .map(name => ({ name, emoji: '👤' }));

  const canSave = name.trim() && members.length >= 2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onAdd({ name: name.trim(), emoji, members });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-members">Members</label>
            <textarea
              id="group-members"
              className="form-input textarea-input"
              value={membersText}
              onChange={e => setMembersText(e.target.value)}
              placeholder={'Varad\nRohit\nArjun\nAryan'}
              rows={5}
            />
          </div>

          <button className="btn btn-primary btn-full" disabled={!canSave}>
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
}
