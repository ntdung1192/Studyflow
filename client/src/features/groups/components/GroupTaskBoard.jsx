import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupsApi } from '../groupsApi';
import {
  TASK_STATUSES,
  canManageTask,
  canUpdateStatus,
  formatDateTime,
  getErrorMessage,
  isOverdue,
  statusLabel,
} from '../groupUtils';
import ConfirmModal from './ConfirmModal';
import TaskFormModal from './TaskFormModal';

export default function GroupTaskBoard({ groupId, members, currentUserId, isOwner }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [editor, setEditor] = useState(null); // null | { task?: object }
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'ACTIVE'),
    [members]
  );
  const nameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.name])),
    [members]
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    groupsApi
      .tasks(groupId, {
        status: statusFilter,
        assigneeId: onlyMine ? currentUserId : undefined,
      })
      .then((data) => {
        if (!active) return;
        setTasks(data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [groupId, statusFilter, onlyMine, currentUserId, refreshKey]);

  async function handleStatusChange(task, status) {
    setBusyId(task.id);
    setError('');
    try {
      const updated = await groupsApi.updateTask(groupId, task.id, { status });
      setTasks((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    setBusyId(deleting.id);
    try {
      await groupsApi.deleteTask(groupId, deleting.id);
      setTasks((list) => list.filter((item) => item.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setDeleting(null);
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="gp-panel">
      <div className="gp-panel-head">
        <h2>Nhiệm vụ nhóm</h2>
        <button type="button" className="gp-btn gp-btn-primary" onClick={() => setEditor({})}>
          ＋ Thêm nhiệm vụ
        </button>
      </div>

      <div className="gp-filters">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <label className="gp-check">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(event) => setOnlyMine(event.target.checked)}
          />
          Chỉ việc của tôi
        </label>
      </div>

      {error ? <p className="gp-error">{error}</p> : null}

      {isLoading ? (
        <p className="gp-empty">Đang tải nhiệm vụ...</p>
      ) : tasks.length === 0 ? (
        <p className="gp-empty">Chưa có nhiệm vụ nào phù hợp.</p>
      ) : (
        <ul className="gp-list">
          {tasks.map((task) => {
            const manage = canManageTask(task, currentUserId, isOwner);
            const mayChangeStatus = canUpdateStatus(task, currentUserId, isOwner);
            const overdue = isOverdue(task);
            return (
              <li className="gp-row gp-task" key={task.id}>
                <div className="gp-row-main">
                  <strong className={task.status === 'DONE' ? 'gp-done' : ''}>{task.title}</strong>
                  {task.description ? <span>{task.description}</span> : null}
                  <span className="gp-task-meta">
                    Giao cho <b>{nameById[task.assigneeId] ?? 'Thành viên cũ'}</b> · Hạn{' '}
                    <b className={overdue ? 'gp-overdue' : ''}>{formatDateTime(task.dueAt)}</b>
                    {overdue ? ' (quá hạn)' : ''}
                  </span>
                </div>
                {mayChangeStatus ? (
                  <select
                    className={`gp-status gp-status-${task.status.toLowerCase()}`}
                    value={task.status}
                    disabled={busyId === task.id}
                    onChange={(event) => handleStatusChange(task, event.target.value)}
                    aria-label={`Trạng thái của ${task.title}`}
                  >
                    {TASK_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`gp-status gp-status-${task.status.toLowerCase()}`}>
                    {statusLabel(task.status)}
                  </span>
                )}
                {manage ? (
                  <div className="gp-row-actions">
                    <button
                      type="button"
                      className="gp-btn gp-btn-small"
                      onClick={() => setEditor({ task })}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="gp-btn gp-btn-small gp-btn-danger"
                      onClick={() => setDeleting(task)}
                    >
                      Xóa
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {editor ? (
        <TaskFormModal
          groupId={groupId}
          task={editor.task}
          members={activeMembers}
          defaultAssigneeId={currentUserId}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            reload();
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmModal
          title="Xóa nhiệm vụ"
          message={`Xóa nhiệm vụ "${deleting.title}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa"
          danger
          busy={busyId === deleting.id}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </section>
  );
}
