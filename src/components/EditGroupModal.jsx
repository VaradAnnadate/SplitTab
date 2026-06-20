import { useState } from 'react';
import ModalPortal from './ModalPortal';
import './Modal.css';

const GROUP_EMOJIS = ['👥', '🏖️', '🏠', '🎉', '🚗', '🍽️', '🎬', '🏕️', '💼', '🎁', '✈️', '🏟️'];

export default function EditGroupModal({ group, onSave, onClose }) {
  const [name, setName] = useState(group.name);
  const [emoji, setEmoji] = useState(
    GROUP_EMOJIS.includes(group.emoji) ? group.emoji : '👥'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, emoji });
  };

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="modal-handle" />

          <h2 className="modal-title">Edit Group</h2>
          <p className="modal-subtitle">Update "{group.name}"</p>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-group-name">Group Name</label>
              <input
                id="edit-group-name"
                className="form-input"
                type="text"
                placeholder="e.g. Goa Trip"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                maxLength={36}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Group Type</label>
              <div className="emoji-grid">
                {GROUP_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={!name.trim()}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
