import Modal from './Modal';

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Xác nhận',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="gp-confirm-text">{message}</p>
      <div className="gp-modal-actions">
        <button type="button" className="gp-btn" onClick={onCancel} disabled={busy}>
          Hủy
        </button>
        <button
          type="button"
          className={`gp-btn ${danger ? 'gp-btn-danger' : 'gp-btn-primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Đang xử lý...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
