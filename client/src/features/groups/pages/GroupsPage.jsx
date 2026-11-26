import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GroupFormModal from '../components/GroupFormModal';
import { groupsApi } from '../groupsApi';
import { formatDateTime, getErrorMessage } from '../groupUtils';
import '../groups.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    Promise.all([groupsApi.list(), groupsApi.myInvitations()])
      .then(([groupList, invitationList]) => {
        if (!active) return;
        setGroups(groupList);
        setInvitations(invitationList);
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
  }, [refreshKey]);

  async function respond(invitation, status) {
    setBusyId(invitation.id);
    setError('');
    try {
      await groupsApi.respondInvitation(invitation.id, status);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="workspace-page gp-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDYFLOW PRO</p>
          <h1>Nhóm học tập</h1>
          <p className="page-description">Phối hợp, giao việc và theo dõi tiến độ cùng bạn học.</p>
        </div>
        <button className="primary-action" type="button" onClick={() => setShowCreate(true)}>
          ＋ <span>Tạo nhóm</span>
        </button>
      </div>

      {error ? <p className="gp-error">{error}</p> : null}

      {invitations.length > 0 ? (
        <section className="gp-panel">
          <div className="gp-panel-head">
            <h2>Lời mời vào nhóm ({invitations.length})</h2>
          </div>
          <ul className="gp-list">
            {invitations.map((invitation) => (
              <li className="gp-row" key={invitation.id}>
                <div className="gp-row-main">
                  <strong>{invitation.group.name}</strong>
                  <span>
                    {invitation.invitedBy
                      ? `${invitation.invitedBy.name} (${invitation.invitedBy.email}) đã mời bạn`
                      : 'Bạn được mời vào nhóm'}
                    {' · '}
                    {formatDateTime(invitation.createdAt)}
                  </span>
                </div>
                <div className="gp-row-actions">
                  <button
                    type="button"
                    className="gp-btn gp-btn-small gp-btn-primary"
                    disabled={busyId === invitation.id}
                    onClick={() => respond(invitation, 'ACTIVE')}
                  >
                    Chấp nhận
                  </button>
                  <button
                    type="button"
                    className="gp-btn gp-btn-small gp-btn-danger"
                    disabled={busyId === invitation.id}
                    onClick={() => respond(invitation, 'DECLINED')}
                  >
                    Từ chối
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="gp-panel">
        <div className="gp-panel-head">
          <h2>Nhóm của bạn ({groups.length})</h2>
        </div>
        {isLoading ? (
          <p className="gp-empty">Đang tải danh sách nhóm...</p>
        ) : groups.length === 0 ? (
          <p className="gp-empty">
            Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới hoặc chờ lời mời từ bạn học.
          </p>
        ) : (
          <div className="gp-card-grid">
            {groups.map((group) => (
              <Link className="gp-card" to={`/groups/${group.id}`} key={group.id}>
                <div className="gp-card-top">
                  <strong>{group.name}</strong>
                  <span className={`gp-badge ${group.role === 'OWNER' ? 'gp-badge-owner' : ''}`}>
                    {group.role === 'OWNER' ? 'OWNER' : 'Thành viên'}
                  </span>
                </div>
                <p>{group.description || 'Chưa có mô tả.'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showCreate ? (
        <GroupFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(group) => {
            setShowCreate(false);
            navigate(`/groups/${group.id}`);
          }}
        />
      ) : null}
    </main>
  );
}
