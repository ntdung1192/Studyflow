import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canManageTask,
  canUpdateStatus,
  fromInputDateTime,
  getErrorMessage,
  getInitials,
  isOverdue,
  statusLabel,
  toInputDateTime,
} from './groupUtils.js';

test('statusLabel trả nhãn tiếng Việt', () => {
  assert.equal(statusLabel('TODO'), 'Cần làm');
  assert.equal(statusLabel('DONE'), 'Hoàn thành');
  assert.equal(statusLabel('KHAC'), 'KHAC');
});

test('toInputDateTime và fromInputDateTime đi vòng không đổi', () => {
  const iso = '2026-11-20T10:00:00.000Z';
  assert.equal(fromInputDateTime(toInputDateTime(iso)), iso);
  assert.equal(toInputDateTime(''), '');
  assert.equal(fromInputDateTime(''), null);
  assert.equal(fromInputDateTime('khong-hop-le'), null);
});

test('isOverdue chỉ đúng khi quá hạn và chưa DONE', () => {
  const now = new Date('2026-11-25T00:00:00Z').getTime();
  assert.equal(isOverdue({ status: 'TODO', dueAt: '2026-11-20T00:00:00Z' }, now), true);
  assert.equal(isOverdue({ status: 'DONE', dueAt: '2026-11-20T00:00:00Z' }, now), false);
  assert.equal(isOverdue({ status: 'TODO', dueAt: '2026-12-01T00:00:00Z' }, now), false);
});

test('quyền với nhiệm vụ nhóm khớp quy tắc backend', () => {
  const task = { createdBy: 'u1', assigneeId: 'u2' };
  assert.equal(canManageTask(task, 'u1', false), true); // người tạo
  assert.equal(canManageTask(task, 'u3', true), true); // OWNER
  assert.equal(canManageTask(task, 'u2', false), false); // người được giao
  assert.equal(canUpdateStatus(task, 'u2', false), true); // người được giao đổi trạng thái
  assert.equal(canUpdateStatus(task, 'u3', false), false); // thành viên khác
});

test('getInitials và getErrorMessage', () => {
  assert.equal(getInitials('Nguyễn Văn An'), 'NA');
  assert.equal(getInitials('An'), 'AN');
  assert.equal(getInitials(''), '?');
  assert.equal(
    getErrorMessage({ message: 'Lỗi.', details: [{ message: 'Email không hợp lệ.' }] }),
    'Lỗi. Email không hợp lệ.'
  );
  assert.equal(getErrorMessage({ message: 'Lỗi.', details: [] }), 'Lỗi.');
});
