import { useState } from 'react';
import { groupsApi } from '../groupsApi';
import { getErrorMessage } from '../groupUtils';
import Modal from './Modal';

/** Tạo nhóm mới (không truyền `group`) hoặc sửa nhóm (truyền `group`). */
export default function GroupFormModal({ group, onClose, onSaved }) {
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên nhóm.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = { name: name.trim(), description: description.trim() };
      const saved = group ? await groupsApi.update(group.id, body) : await groupsApi.create(body);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={group ? 'Sửa nhóm' : 'Tạo nhóm mới'} onClose={onClose}>
      <form className="gp-form" onSubmit={handleSubmit}>
        <label className="gp-field">
          <span>Tên nhóm *</span>
          <input
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ: Nhóm ôn thi Giải tích"
            autoFocus
          />
        </label>
        <label className="gp-field">
          <span>Mô tả</span>
          <textarea
            rows={3}
            value={description}
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Mục tiêu của nhóm (không bắt buộc)"
          />
        </label>
        {error ? <p className="gp-error">{error}</p> : null}
        <div className="gp-modal-actions">
          <button type="button" className="gp-btn" onClick={onClose} disabled={isSaving}>
            Hủy
          </button>
          <button type="submit" className="gp-btn gp-btn-primary" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : group ? 'Lưu thay đổi' : 'Tạo nhóm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
