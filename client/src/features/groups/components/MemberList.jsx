import { useState } from 'react';
import { groupsApi } from '../groupsApi';
import { formatDateTime, getErrorMessage, getInitials } from '../groupUtils';
import ConfirmModal from './ConfirmModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MemberList({ groupId, members, currentUserId, isOwner, onChanged }) {
  const [email, setEmail] = useState('');
  const [isInviting, setInviting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'transfer' | 'remove', member }
  const [isBusy, setBusy] = useState(false);

  const active = members.filter((member) => member.status === 'ACTIVE');
  const pending = members.filter((member) => member.status === 'PENDING');

  async function handleInvite(event) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    setNotice('');
    setError('');
    if (!EMAIL_REGEX.test(value)) {
      setError('Email không hợp lệ.');
      return;
    }
    setInviting(true);
    try {
      await groupsApi.invite(groupId, value);
      setNotice(`Đã gửi lời mời tới ${value}.`);
      setEmail('');
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setInviting(false);
    }
  }

  async function handleConfirm() {
    if (!confirm) return;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      if (confirm.type === 'transfer') {
        await groupsApi.transferOwner(groupId, confirm.member.id);
      } else {
        await groupsApi.removeMember(groupId, confirm.member.id);
      }
      setConfirm(null);
      onChanged();
    } catch (err) {
      setConfirm(null);
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    confirm &&
    {
      transfer: {
        title: 'Chuyển quyền OWNER',
        message: `Bạn sẽ chuyển quyền OWNER cho ${confirm.member.name}. Sau đó bạn chỉ còn là thành viên thường. Tiếp tục?`,
        confirmLabel: 'Chuyển quyền',
        danger: false,
      },
      remove: {
        title: confirm.member.status === 'PENDING' ? 'Hủy lời mời' : 'Xóa thành viên',
        message:
          confirm.member.status === 'PENDING'
            ? `Hủy lời mời đã gửi tới ${confirm.member.name}?`
            : `Xóa ${confirm.member.name} khỏi nhóm?`,
        confirmLabel: confirm.member.status === 'PENDING' ? 'Hủy lời mời' : 'Xóa',
        danger: true,
      },
    }[confirm.type];

  return (
    <section className="gp-panel">
      <div className="gp-panel-head">
        <h2>Thành viên ({active.length})</h2>
      </div>

      {isOwner ? (
        <form className="gp-invite" onSubmit={handleInvite}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email của người cần mời (đã có tài khoản StudyFlow)"
            aria-label="Email người được mời"
          />
          <button type="submit" className="gp-btn gp-btn-primary" disabled={isInviting}>
            {isInviting ? 'Đang gửi...' : 'Mời'}
          </button>
        </form>
      ) : null}
      {notice ? <p className="gp-notice">{notice}</p> : null}
      {error ? <p className="gp-error">{error}</p> : null}

      <ul className="gp-list">
        {active.map((member) => {
          const isMe = member.id === currentUserId;
          return (
            <li className="gp-row" key={member.id}>
              <span className="gp-avatar">{getInitials(member.name)}</span>
              <div className="gp-row-main">
                <strong>
                  {member.name} {isMe ? <em className="gp-me">(Bạn)</em> : null}
                </strong>
                <span>
                  {member.email}
                  {member.joinedAt ? ` · Tham gia ${formatDateTime(member.joinedAt)}` : ''}
                </span>
              </div>
              <span className={`gp-badge ${member.role === 'OWNER' ? 'gp-badge-owner' : ''}`}>
                {member.role === 'OWNER' ? 'OWNER' : 'Thành viên'}
              </span>
              {isOwner && member.role !== 'OWNER' ? (
                <div className="gp-row-actions">
                  <button
                    type="button"
                    className="gp-btn gp-btn-small"
                    onClick={() => setConfirm({ type: 'transfer', member })}
                  >
                    Chuyển OWNER
                  </button>
                  <button
                    type="button"
                    className="gp-btn gp-btn-small gp-btn-danger"
                    onClick={() => setConfirm({ type: 'remove', member })}
                  >
                    Xóa
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {pending.length > 0 ? (
        <>
          <h3 className="gp-subheading">Đang chờ chấp nhận ({pending.length})</h3>
          <ul className="gp-list">
            {pending.map((member) => (
              <li className="gp-row" key={member.id}>
                <span className="gp-avatar gp-avatar-muted">{getInitials(member.name)}</span>
                <div className="gp-row-main">
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
                <span className="gp-badge gp-badge-pending">Đã mời</span>
                {isOwner ? (
                  <div className="gp-row-actions">
                    <button
                      type="button"
                      className="gp-btn gp-btn-small gp-btn-danger"
                      onClick={() => setConfirm({ type: 'remove', member })}
                    >
                      Hủy lời mời
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {confirm ? (
        <ConfirmModal
          {...confirmCopy}
          busy={isBusy}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </section>
  );
}
