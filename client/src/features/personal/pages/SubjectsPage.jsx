import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import '../personal.css';

const emptyForm = { name: '', code: '', description: '' };

export default function SubjectsPage() {
  // 1. State
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = đang thêm mới
  const [isSaving, setIsSaving] = useState(false);
  const [reloadCount, setReloadCount] = useState(0); // tăng lên để tải lại danh sách

  // 2. Tải danh sách khi mở trang và mỗi khi reloadCount đổi
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await api.get('/subjects?limit=100');
        setSubjects(data);
        setError('');
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    }
    loadSubjects();
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

  function startEdit(subject) {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingId) {
        await api.patch(`/subjects/${editingId}`, form);
      } else {
        await api.post('/subjects', form);
      }
      resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
    setIsSaving(false);
  }

  async function handleDelete(subject) {
    if (!window.confirm(`Xóa môn học "${subject.name}"?`)) return;
    setError('');
    try {
      await api.delete(`/subjects/${subject.id}`);
      if (editingId === subject.id) resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message); // ví dụ: môn học đang được công việc sử dụng
    }
  }

  // 4. Giao diện
  const submitLabel = editingId ? 'Lưu thay đổi' : 'Thêm môn học';

  return (
    <main className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDYFLOW PRO</p>
          <h1>Môn học</h1>
          <p className="page-description">Thêm, sửa và xóa các môn học của bạn.</p>
        </div>
      </div>

      {error && <p className="crud-error">{error}</p>}

      <section className="crud-panel">
        <h2>{editingId ? 'Sửa môn học' : 'Thêm môn học'}</h2>
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-field">
            <label htmlFor="subject-name">Tên môn học</label>
            <input
              id="subject-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="crud-field">
            <label htmlFor="subject-code">Mã môn (không bắt buộc)</label>
            <input id="subject-code" name="code" value={form.code} onChange={handleChange} />
          </div>
          <div className="crud-field crud-field-wide">
            <label htmlFor="subject-description">Mô tả (không bắt buộc)</label>
            <input
              id="subject-description"
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
        <h2>Danh sách môn học</h2>
        {isLoading && <p className="crud-note">Đang tải...</p>}
        {!isLoading && subjects.length === 0 && <p className="crud-note">Chưa có môn học nào.</p>}
        <ul className="crud-list">
          {subjects.map((subject) => (
            <li key={subject.id} className="crud-item">
              <div className="crud-item-main">
                <p className="crud-item-title">{subject.name}</p>
                {subject.code && <p className="crud-item-text">Mã môn: {subject.code}</p>}
                {subject.description && <p className="crud-item-text">{subject.description}</p>}
              </div>
              <div className="crud-item-actions">
                <button
                  type="button"
                  className="crud-btn crud-btn-small"
                  onClick={() => startEdit(subject)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="crud-btn crud-btn-small crud-btn-danger"
                  onClick={() => handleDelete(subject)}
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
