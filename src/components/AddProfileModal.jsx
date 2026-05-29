// AddProfileModal.jsx — Bottom sheet to create a new friend profile
import { useState } from 'react';
import './Modal.css';

const EMOJIS = ['👤','👩','👨','🧑','👩‍💼','👨‍💼','🧑‍💻','👩‍🎤','👨‍🎤','🧑‍🍳','🎅','🧑‍🎓','🦸','🧙','🥷','👻','🐱','🐶','🦊','🐼'];

export default function AddProfileModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👤');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, emoji);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <h2 className="modal-title">Add Friend</h2>
        <p className="modal-subtitle">Who are you splitting with?</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="friend-name">Name</label>
            <input
              id="friend-name"
              className="form-input"
              type="text"
              placeholder="e.g. Rohit"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div className="emoji-grid">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                  id={`emoji-${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            id="create-profile-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!name.trim()}
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
