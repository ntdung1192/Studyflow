import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import '../personal.css';

const emptyForm = { title: '', description: '', dueAt: '', progress: '0' };

export default function GoalsPage() {
  // 1. State
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = đang thêm mới
  const [isSaving, setIsSaving] = useState(false);
  const [reloadCount, setReloadCount] = useState(0); // tăng lên để tải lại danh sách

  // 2. Tải danh sách khi mở trang và mỗi khi reloadCount đổi
  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await api.get('/goals?limit=100');
        setGoals(data);
        setError('');
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    }
    loadGoals();
  }, [reloadCount]);

  // 3. Xử lý form và các nút
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(goal) {
    setEditingId(goal.id);
    setForm({
      title: goal.title,
      description: goal.description || '',
      dueAt: goal.dueAt ? goal.dueAt.slice(0, 10) : '', // "2026-12-20T00:00:00.000Z" -> "2026-12-20"
      progress: String(goal.progress),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const body = { title: form.title, description: form.description, dueAt: form.dueAt };
      if (editingId) {
        body.progress = Number(form.progress); // server cần số nguyên 0-100, không nhận chuỗi
        await api.patch(`/goals/${editingId}`, body);
      } else {
        await api.post('/goals', body); // tạo mới: tiến độ luôn bắt đầu từ 0
      }
      resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
    setIsSaving(false);
  }

  async function handleDelete(goal) {
    if (!window.confirm(`Xóa mục tiêu "${goal.title}"?`)) return;
    setError('');
    try {
      await api.delete(`/goals/${goal.id}`);
      if (editingId === goal.id) resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  // 4. Giao diện
  const submitLabel = editingId ? 'Lưu thay đổi' : 'Thêm mục tiêu';

  return (
    <main className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDYFLOW PRO</p>
          <h1>Mục tiêu</h1>
          <p className="page-description">Đặt mục tiêu học tập và cập nhật tiến độ.</p>
        </div>
      </div>

      {error && <p className="crud-error">{error}</p>}

      <section className="crud-panel">
        <h2>{editingId ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}</h2>
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-field crud-field-wide">
            <label htmlFor="goal-title">Tên mục tiêu</label>
            <input
              id="goal-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="crud-field">
            <label htmlFor="goal-due">Hạn hoàn thành (không bắt buộc)</label>
            <input
              id="goal-due"
              name="dueAt"
              type="date"
              value={form.dueAt}
              onChange={handleChange}
            />
          </div>
          {editingId && (
            <div className="crud-field">
              <label htmlFor="goal-progress">Tiến độ (%)</label>
              <input
                id="goal-progress"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="crud-field crud-field-wide">
            <label htmlFor="goal-description">Mô tả (không bắt buộc)</label>
            <input
              id="goal-description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="crud-actions">
            <button type="submit" className="crud-btn crud-btn-primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : submitLabel}
            </button>
            {editingId && (
              <button type="button" className="crud-btn" onClick={resetForm}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="crud-panel">
        <h2>Danh sách mục tiêu</h2>
        {isLoading && <p className="crud-note">Đang tải...</p>}
        {!isLoading && goals.length === 0 && <p className="crud-note">Chưa có mục tiêu nào.</p>}
        <ul className="crud-list">
          {goals.map((goal) => (
            <li key={goal.id} className="crud-item">
              <div className="crud-item-main">
                <p className="crud-item-title">
                  {goal.title}
                  {goal.status === 'COMPLETED' && <span className="crud-badge">Hoàn thành</span>}
                </p>
                {goal.description && <p className="crud-item-text">{goal.description}</p>}
                {goal.dueAt && (
                  <p className="crud-item-meta">
                    <span>Hạn: {new Date(goal.dueAt).toLocaleDateString('vi-VN')}</span>
                  </p>
                )}
                <div className="crud-progress-row">
                  <progress value={goal.progress} max="100" />
                  <span>{goal.progress}%</span>
                </div>
              </div>
              <div className="crud-item-actions">
                <button
                  type="button"
                  className="crud-btn crud-btn-small"
                  onClick={() => startEdit(goal)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="crud-btn crud-btn-small crud-btn-danger"
                  onClick={() => handleDelete(goal)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
