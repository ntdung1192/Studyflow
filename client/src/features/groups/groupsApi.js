import { api } from '../../services/api';

function withQuery(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export const groupsApi = {
  // Nhóm
  list: () => api.get('/groups?limit=100'),
  get: (groupId) => api.get(`/groups/${groupId}`),
  create: (body) => api.post('/groups', body),
  update: (groupId, body) => api.patch(`/groups/${groupId}`, body),

  // Thành viên
  members: (groupId) => api.get(`/groups/${groupId}/members?limit=100`),
  invite: (groupId, email) => api.post(`/groups/${groupId}/invitations`, { email }),
  transferOwner: (groupId, newOwnerId) => api.patch(`/groups/${groupId}/owner`, { newOwnerId }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  leave: (groupId) => api.delete(`/groups/${groupId}/membership`),

  // Lời mời của tôi
  myInvitations: () => api.get('/me/group-invitations?limit=100'),
  respondInvitation: (invitationId, status) =>
    api.patch(`/group-invitations/${invitationId}`, { status }),

  // Nhiệm vụ nhóm
  tasks: (groupId, filters = {}) =>
    api.get(withQuery(`/groups/${groupId}/tasks`, { limit: 100, ...filters })),
  createTask: (groupId, body) => api.post(`/groups/${groupId}/tasks`, body),
  updateTask: (groupId, taskId, body) => api.patch(`/groups/${groupId}/tasks/${taskId}`, body),
  deleteTask: (groupId, taskId) => api.delete(`/groups/${groupId}/tasks/${taskId}`),
};
