import { useEffect } from 'react';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="gp-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="gp-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="gp-modal-head">
          <h2>{title}</h2>
          <button type="button" className="gp-icon-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
