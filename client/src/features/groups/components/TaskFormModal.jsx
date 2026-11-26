import { useState } from 'react';
import { groupsApi } from '../groupsApi';
import { fromInputDateTime, getErrorMessage, toInputDateTime } from '../groupUtils';
import Modal from './Modal';

/** Thêm nhiệm vụ (không truyền `task`) hoặc sửa nhiệm vụ (truyền `task`). */
export default function TaskFormModal({
  groupId,
  task,
  members,
  defaultAssigneeId,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? defaultAssigneeId ?? '');
  const [dueAt, setDueAt] = useState(toInputDateTime(task?.dueAt));
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const dueIso = fromInputDateTime(dueAt);
    if (!title.trim()) return setError('Vui lòng nhập tên nhiệm vụ.');
    if (!assigneeId) return setError('Vui lòng chọn người được giao.');
    if (!dueIso) return setError('Vui lòng chọn hạn hoàn thành.');

    setSaving(true);
    setError('');
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        assigneeId,
        dueAt: dueIso,
      };
      const saved = task
        ? await groupsApi.updateTask(groupId, task.id, body)
        : await groupsApi.createTask(groupId, body);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={task ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ nhóm'} onClose={onClose}>
      <form className="gp-form" onSubmit={handleSubmit}>
        <label className="gp-field">
          <span>Tên nhiệm vụ *</span>
          <input
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </label>
        <label className="gp-field">
          <span>Mô tả</span>
          <textarea
            rows={3}
            value={description}
            maxLength={5000}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="gp-field-row">
          <label className="gp-field">
            <span>Người được giao *</span>
            <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
              <option value="">— Chọn thành viên —</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="gp-field">
            <span>Hạn hoàn thành *</span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>
        </div>
        {error ? <p className="gp-error">{error}</p> : null}
        <div className="gp-modal-actions">
          <button type="button" className="gp-btn" onClick={onClose} disabled={isSaving}>
            Hủy
          </button>
          <button type="submit" className="gp-btn gp-btn-primary" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : task ? 'Lưu thay đổi' : 'Thêm nhiệm vụ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
