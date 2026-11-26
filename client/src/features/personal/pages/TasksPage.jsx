import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import '../personal.css';

const emptyForm = { title: '', description: '', subjectId: '', dueAt: '' };

export default function TasksPage() {
  // 1. State
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]); // dùng cho ô chọn môn học
  const [filterStatus, setFilterStatus] = useState(''); // '' = tất cả
  const [filterDue, setFilterDue] = useState(''); // '' = không lọc theo hạn
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = đang thêm mới
  const [isSaving, setIsSaving] = useState(false);
  const [reloadCount, setReloadCount] = useState(0); // tăng lên để tải lại danh sách

  // 2. Tải dữ liệu
  // Tải môn học một lần khi mở trang
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await api.get('/subjects?limit=100');
        setSubjects(data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadSubjects();
  }, []);

  // Tải công việc khi mở trang, khi đổi bộ lọc và khi reloadCount đổi
  useEffect(() => {
    async function loadTasks() {
      let url = '/tasks?limit=100';
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterDue) url += `&dueBefore=${filterDue}`;
      try {
        const data = await api.get(url);
        setTasks(data);
        setError('');
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    }
    loadTasks();
  }, [filterStatus, filterDue, reloadCount]);

  // 3. Xử lý form và các nút
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      subjectId: task.subjectId || '',
      dueAt: task.dueAt.slice(0, 10), // "2026-11-20T00:00:00.000Z" -> "2026-11-20"
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingId) {
        await api.patch(`/tasks/${editingId}`, form);
      } else {
        await api.post('/tasks', form);
      }
      resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
    setIsSaving(false);
  }

  async function changeStatus(task, newStatus) {
    setError('');
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Xóa công việc "${task.title}"?`)) return;
    setError('');
    try {
      await api.delete(`/tasks/${task.id}`);
      if (editingId === task.id) resetForm();
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  function getSubjectName(id) {
    const subject = subjects.find((item) => item.id === id);
    return subject ? subject.name : '';
  }

  // 4. Giao diện
  const submitLabel = editingId ? 'Lưu thay đổi' : 'Thêm công việc';

  return (
    <main className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDYFLOW PRO</p>
          <h1>Công việc</h1>
          <p className="page-description">Theo dõi bài tập, thời hạn và trạng thái hoàn thành.</p>
        </div>
      </div>

      {error && <p className="crud-error">{error}</p>}

      <section className="crud-panel">
        <h2>{editingId ? 'Sửa công việc' : 'Thêm công việc'}</h2>
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-field crud-field-wide">
            <label htmlFor="task-title">Tiêu đề</label>
            <input
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="crud-field">
            <label htmlFor="task-subject">Môn học (không bắt buộc)</label>
            <select
              id="task-subject"
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
            >
              <option value="">Không gắn môn học</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="crud-field">
            <label htmlFor="task-due">Hạn hoàn thành</label>
            <input
              id="task-due"
              name="dueAt"
              type="date"
              value={form.dueAt}
              onChange={handleChange}
              required
            />
          </div>
          <div className="crud-field crud-field-wide">
            <label htmlFor="task-description">Mô tả (không bắt buộc)</label>
            <input
              id="task-description"
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
        <h2>Danh sách công việc</h2>
        <div className="crud-filters">
          <div className="crud-field">
            <label htmlFor="filter-status">Lọc theo trạng thái</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="TODO">Chưa bắt đầu</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="DONE">Hoàn thành</option>
            </select>
          </div>
          <div className="crud-field">
            <label htmlFor="filter-due">Hạn đến ngày</label>
            <input
              id="filter-due"
              type="date"
              value={filterDue}
              onChange={(event) => setFilterDue(event.target.value)}
            />
          </div>
        </div>

        {isLoading && <p className="crud-note">Đang tải...</p>}
        {!isLoading && tasks.length === 0 && <p className="crud-note">Không có công việc nào.</p>}
        <ul className="crud-list">
          {tasks.map((task) => (
            <li key={task.id} className="crud-item">
              <div className="crud-item-main">
                <p className="crud-item-title">{task.title}</p>
                {task.description && <p className="crud-item-text">{task.description}</p>}
                <p className="crud-item-meta">
                  {task.subjectId && <span>Môn: {getSubjectName(task.subjectId)}</span>}
                  <span>Hạn: {new Date(task.dueAt).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
              <div className="crud-item-actions">
                <select
                  className="crud-status"
                  value={task.status}
                  onChange={(event) => changeStatus(task, event.target.value)}
                >
                  <option value="TODO">Chưa bắt đầu</option>
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="DONE">Hoàn thành</option>
                </select>
                <button
                  type="button"
                  className="crud-btn crud-btn-small"
                  onClick={() => startEdit(task)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="crud-btn crud-btn-small crud-btn-danger"
                  onClick={() => handleDelete(task)}
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
