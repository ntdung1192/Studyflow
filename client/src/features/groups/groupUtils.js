export const TASK_STATUSES = [
  { value: 'TODO', label: 'Cần làm' },
  { value: 'IN_PROGRESS', label: 'Đang làm' },
  { value: 'DONE', label: 'Hoàn thành' },
];

export function statusLabel(status) {
  return TASK_STATUSES.find((item) => item.value === status)?.label ?? status;
}

const pad = (value) => String(value).padStart(2, '0');

/** ISO (UTC) -> giá trị cho <input type="datetime-local"> theo giờ địa phương. */
export function toInputDateTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/** Giá trị <input type="datetime-local"> -> ISO (UTC) để gửi API. */
export function fromInputDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return '—';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function isOverdue(task, now = Date.now()) {
  return task.status !== 'DONE' && new Date(task.dueAt).getTime() < now;
}

/** OWNER hoặc người tạo được sửa/xóa nhiệm vụ (khớp quy tắc backend). */
export function canManageTask(task, userId, isOwner) {
  return Boolean(isOwner) || String(task.createdBy) === String(userId);
}

/** Người quản lý hoặc người được giao được đổi trạng thái. */
export function canUpdateStatus(task, userId, isOwner) {
  return canManageTask(task, userId, isOwner) || String(task.assigneeId) === String(userId);
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getErrorMessage(error) {
  if (!error) return '';
  const details = Array.isArray(error.details)
    ? error.details.map((item) => item?.message).filter(Boolean)
    : [];
  const base = error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  return details.length ? `${base} ${details.join(' ')}` : base;
}
