// EditProfileModal.jsx — Bottom sheet to edit name + emoji of existing profile
import { useState } from 'react';
import ModalPortal from './ModalPortal';
import './Modal.css';

const EMOJIS = ['👤','👩','👨','🧑','👩‍💼','👨‍💼','🧑‍💻','👩‍🎤','👨‍🎤','🧑‍🍳','🎅','🧑‍🎓','🦸','🧙','🥷','👻','🐱','🐶','🦊','🐼'];

export default function EditProfileModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [emoji, setEmoji] = useState(
    EMOJIS.includes(profile.emoji) ? profile.emoji : '👤'
  );
  const [customMode, setCustomMode] = useState(!EMOJIS.includes(profile.emoji));
  const [customEmoji, setCustomEmoji] = useState(
    EMOJIS.includes(profile.emoji) ? '' : profile.emoji
  );

  const activeEmoji = customMode ? (customEmoji || profile.emoji) : emoji;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, emoji: activeEmoji });
  };

  const handlePresetClick = (e) => {
    setCustomMode(false);
    setCustomEmoji('');
    setEmoji(e);
  };

  const handleCustomClick = () => {
    setCustomMode(true);
    setEmoji('');
  };

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <h2 className="modal-title">Edit Profile</h2>
        <p className="modal-subtitle">Update {profile.name}'s details</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-friend-name">Name</label>
            <input
              id="edit-friend-name"
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
                >
                  {e}
                </button>
              ))}
              <button
                type="button"
                className={`emoji-btn emoji-btn-custom ${customMode ? 'selected' : ''}`}
                onClick={handleCustomClick}
                title="Custom"
              >
                {customMode && customEmoji ? customEmoji : '✏️'}
              </button>
            </div>

            {customMode && (
              <div className="custom-emoji-row">
                <span className="custom-emoji-preview">{customEmoji || '?'}</span>
                <input
                  id="edit-custom-emoji-input"
                  className="form-input custom-emoji-input"
                  type="text"
                  placeholder="Type a Letter or any Emoji 👾"
                  value={customEmoji}
                  onChange={e => setCustomEmoji(e.target.value)}
                  maxLength={8}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!name.trim() || (customMode && !customEmoji)}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
