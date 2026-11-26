import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import GroupFormModal from '../components/GroupFormModal';
import GroupTaskBoard from '../components/GroupTaskBoard';
import MemberList from '../components/MemberList';
import { useAuth } from '../../auth/useAuth';
import { groupsApi } from '../groupsApi';
import { getErrorMessage } from '../groupUtils';
import '../groups.css';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [tab, setTab] = useState('tasks');
  const [showEdit, setShowEdit] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [isLeaving, setLeaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    Promise.all([groupsApi.get(groupId), groupsApi.members(groupId)])
      .then(([groupData, memberData]) => {
        if (!active) return;
        setGroup(groupData);
        setMembers(memberData);
        setLoadError(null);
      })
      .catch((err) => {
        if (active) setLoadError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [groupId, refreshKey]);

  async function handleLeave() {
    setLeaving(true);
    try {
      await groupsApi.leave(groupId);
      navigate('/groups', { replace: true });
    } catch (err) {
      setShowLeave(false);
      setActionError(getErrorMessage(err));
      setLeaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="workspace-page gp-page">
        <p className="gp-empty">Đang tải nhóm...</p>
      </main>
    );
  }

  if (loadError || !group) {
    return (
      <main className="workspace-page gp-page">
        <section className="gp-panel">
          <h2>Không mở được nhóm</h2>
          <p className="gp-empty">
            {loadError?.status === 404
              ? 'Nhóm không tồn tại hoặc bạn không còn là thành viên.'
              : getErrorMessage(loadError)}
          </p>
          <Link className="gp-btn" to="/groups">
            ← Về danh sách nhóm
          </Link>
        </section>
      </main>
    );
  }

  const isOwner = group.role === 'OWNER';

  return (
    <main className="workspace-page gp-page">
      <Link className="gp-back" to="/groups">
        ← Tất cả nhóm
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">NHÓM HỌC TẬP</p>
          <h1>
            {group.name}{' '}
            <span className={`gp-badge ${isOwner ? 'gp-badge-owner' : ''}`}>
              {isOwner ? 'OWNER' : 'Thành viên'}
            </span>
          </h1>
          <p className="page-description">{group.description || 'Chưa có mô tả.'}</p>
        </div>
        <div className="gp-header-actions">
          {isOwner ? (
            <button type="button" className="gp-btn" onClick={() => setShowEdit(true)}>
              Sửa nhóm
            </button>
          ) : null}
          {isOwner ? (
            <button
              type="button"
              className="gp-btn"
              disabled
              title="OWNER cần chuyển quyền cho thành viên khác trước khi rời nhóm"
            >
              Rời nhóm
            </button>
          ) : (
            <button
              type="button"
              className="gp-btn gp-btn-danger"
              onClick={() => setShowLeave(true)}
            >
              Rời nhóm
            </button>
          )}
        </div>
      </div>

      {isOwner ? (
        <p className="gp-hint">
          Bạn là OWNER: muốn rời nhóm, hãy vào tab Thành viên và chuyển quyền OWNER cho người khác.
        </p>
      ) : null}
      {actionError ? <p className="gp-error">{actionError}</p> : null}

      <div className="gp-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'tasks'}
          className={tab === 'tasks' ? 'active' : ''}
          onClick={() => setTab('tasks')}
        >
          Nhiệm vụ
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'members'}
          className={tab === 'members' ? 'active' : ''}
          onClick={() => setTab('members')}
        >
          Thành viên
        </button>
      </div>

      {tab === 'tasks' ? (
        <GroupTaskBoard
          groupId={groupId}
          members={members}
          currentUserId={user?.id}
          isOwner={isOwner}
        />
      ) : (
        <MemberList
          groupId={groupId}
          members={members}
          currentUserId={user?.id}
          isOwner={isOwner}
          onChanged={reload}
        />
      )}

      {showEdit ? (
        <GroupFormModal
          group={group}
          onClose={() => setShowEdit(false)}
          onSaved={(saved) => {
            setShowEdit(false);
            setGroup((current) => ({ ...current, ...saved }));
          }}
        />
      ) : null}

      {showLeave ? (
        <ConfirmModal
          title="Rời nhóm"
          message={`Bạn chắc chắn muốn rời nhóm "${group.name}"? Bạn sẽ không còn xem được nhiệm vụ của nhóm.`}
          confirmLabel="Rời nhóm"
          danger
          busy={isLeaving}
          onConfirm={handleLeave}
          onCancel={() => setShowLeave(false)}
        />
      ) : null}
    </main>
  );
}
