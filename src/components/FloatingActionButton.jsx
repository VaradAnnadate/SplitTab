import { createPortal } from 'react-dom';

export default function FloatingActionButton({ id, label = '+', ariaLabel, onClick }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <button
      id={id}
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {label}
    </button>,
    document.body
  );
}
