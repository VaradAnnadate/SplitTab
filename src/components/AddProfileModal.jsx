// AddProfileModal.jsx — Bottom sheet to create a new friend profile
import { useState, useRef } from 'react';
import './Modal.css';

const EMOJIS = ['👤','👩','👨','🧑','👩‍💼','👨‍💼','🧑‍💻','👩‍🎤','👨‍🎤','🧑‍🍳','🎅','🧑‍🎓','🦸','🧙','🥷','👻','🐱','🐶','🦊','🐼'];

export default function AddProfileModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👤');
  const [customMode, setCustomMode] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const customInputRef = useRef(null);

  const activeEmoji = customMode ? (customEmoji || '👤') : emoji;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, activeEmoji);
  };

  const handleCustomClick = () => {
    setCustomMode(true);
    setEmoji('');
    setTimeout(() => customInputRef.current?.focus(), 50);
  };

  const handlePresetClick = (e) => {
    setCustomMode(false);
    setCustomEmoji('');
    setEmoji(e);
  };

  const handleCustomChange = (e) => {
    setCustomEmoji(e.target.value);
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
                  className={`emoji-btn ${!customMode && emoji === e ? 'selected' : ''}`}
                  onClick={() => handlePresetClick(e)}
                  id={`emoji-${e}`}
                >
                  {e}
                </button>
              ))}

              {/* Custom emoji button — always last */}
              <button
                type="button"
                id="emoji-custom-btn"
                className={`emoji-btn emoji-btn-custom ${customMode ? 'selected' : ''}`}
                onClick={handleCustomClick}
                title="Use custom emoji"
              >
                {customMode && customEmoji ? customEmoji : '✏️'}
              </button>
            </div>

            {/* Custom emoji input — appears when custom is selected */}
            {customMode && (
              <div className="custom-emoji-row">
                <span className="custom-emoji-preview">{customEmoji || '?'}</span>
                <input
                  ref={customInputRef}
                  id="custom-emoji-input"
                  className="form-input custom-emoji-input"
                  type="text"
                  placeholder="Type a Letter or any Emoji 👾"
                  value={customEmoji}
                  onChange={handleCustomChange}
                  maxLength={8}
                />
              </div>
            )}
          </div>

          <button
            id="create-profile-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!name.trim() || (customMode && !customEmoji)}
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
