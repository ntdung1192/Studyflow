import { Router } from 'express';
import { GroupMember } from '../models/GroupMember.js';
import { GroupTask } from '../models/GroupTask.js';
import { StudyGroup } from '../models/StudyGroup.js';
import { User } from '../models/User.js';
import {
  asyncRoute,
  fail,
  objectId,
  optionalString,
  pageOptions,
  requiredString,
  serialize,
  validDate,
} from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
const data = (value) => ({ data: serialize(value) });
async function membership(groupId, userId) {
  objectId(groupId, 'groupId');
  const group = await StudyGroup.findById(groupId);
  if (!group) fail(404, 'NOT_FOUND', 'Không tìm thấy nhóm.');
  const member = await GroupMember.findOne({ groupId, userId, status: 'ACTIVE' });
  if (!member) fail(404, 'NOT_FOUND', 'Không tìm thấy nhóm.');
  return { group, member, isOwner: String(group.ownerId) === String(userId) };
}
async function owner(groupId, userId) {
  const access = await membership(groupId, userId);
  if (!access.isOwner) fail(403, 'FORBIDDEN', 'Chỉ OWNER mới được thực hiện thao tác này.');
  return access;
}
function memberDto(member, ownerId) {
  return {
    id: String(member.userId._id ?? member.userId),
    name: member.userId.name,
    email: member.userId.email,
    status: member.status,
    role: String(member.userId._id ?? member.userId) === String(ownerId) ? 'OWNER' : 'MEMBER',
    joinedAt: member.joinedAt,
  };
}

router.get(
  '/groups',
  asyncRoute(async (req, res) => {
    const memberships = await GroupMember.find({ userId: req.user._id, status: 'ACTIVE' })
      .populate('groupId')
      .sort({ createdAt: -1 });
    res.json({
      data: memberships
        .filter((m) => m.groupId)
        .map((m) => ({
          ...serialize(m.groupId),
          role: String(m.groupId.ownerId) === String(req.user._id) ? 'OWNER' : 'MEMBER',
        })),
    });
  })
);
router.post(
  '/groups',
  asyncRoute(async (req, res) => {
    const group = await StudyGroup.create({
      name: requiredString(req.body.name, 'name', 120),
      description: optionalString(req.body.description, 'description', 1000),
      ownerId: req.user._id,
    });
    try {
      await GroupMember.create({
        groupId: group._id,
        userId: req.user._id,
        status: 'ACTIVE',
        joinedAt: new Date(),
      });
    } catch (error) {
      await group.deleteOne();
      throw error;
    }
    res.status(201).json(data({ ...group.toObject(), role: 'OWNER' }));
  })
);
router.get(
  '/groups/:groupId',
  asyncRoute(async (req, res) => {
    const { group, isOwner } = await membership(req.params.groupId, req.user._id);
    res.json(data({ ...group.toObject(), role: isOwner ? 'OWNER' : 'MEMBER' }));
  })
);
router.patch(
  '/groups/:groupId',
  asyncRoute(async (req, res) => {
    const { group } = await owner(req.params.groupId, req.user._id);
    const allowed = ['name', 'description'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    if ('name' in req.body) group.name = requiredString(req.body.name, 'name', 120);
    if ('description' in req.body)
      group.description = optionalString(req.body.description, 'description', 1000);
    await group.save();
    res.json(data({ ...group.toObject(), role: 'OWNER' }));
  })
);
router.get(
  '/groups/:groupId/members',
  asyncRoute(async (req, res) => {
    const { group } = await membership(req.params.groupId, req.user._id);
    const members = await GroupMember.find({
      groupId: group._id,
      status: { $in: ['ACTIVE', 'PENDING'] },
    })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ data: members.filter((m) => m.userId).map((m) => memberDto(m, group.ownerId)) });
  })
);
router.post(
  '/groups/:groupId/invitations',
  asyncRoute(async (req, res) => {
    const { group } = await owner(req.params.groupId, req.user._id);
    const email = requiredString(req.body.email, 'email', 254).toLowerCase();
    const invitee = await User.findOne({ email });
    if (!invitee) fail(404, 'USER_NOT_FOUND', 'Không tìm thấy tài khoản với email này.');
    let member = await GroupMember.findOne({ groupId: group._id, userId: invitee._id });
    if (member && ['ACTIVE', 'PENDING'].includes(member.status))
      fail(409, 'INVITATION_EXISTS', 'Người dùng đã là thành viên hoặc đang có lời mời chờ xử lý.');
    if (member) {
      member.status = 'PENDING';
      member.invitedBy = req.user._id;
      member.joinedAt = null;
      await member.save();
    } else
      member = await GroupMember.create({
        groupId: group._id,
        userId: invitee._id,
        status: 'PENDING',
        invitedBy: req.user._id,
      });
    res
      .status(201)
      .json(
        data({ id: member._id, groupId: group._id, userId: invitee._id, status: member.status })
      );
  })
);
router.get(
  '/me/group-invitations',
  asyncRoute(async (req, res) => {
    const { skip, limit } = pageOptions(req.query);
    const rows = await GroupMember.find({ userId: req.user._id, status: 'PENDING' })
      .populate('groupId', 'name description ownerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      data: rows
        .filter((row) => row.groupId)
        .map((row) => ({
          id: String(row._id),
          group: serialize(row.groupId),
          invitedBy: String(row.invitedBy),
          createdAt: row.createdAt,
        })),
    });
  })
);
router.patch(
  '/group-invitations/:invitationId',
  asyncRoute(async (req, res) => {
    objectId(req.params.invitationId, 'invitationId');
    if (!['ACTIVE', 'DECLINED'].includes(req.body.status))
      fail(400, 'VALIDATION_ERROR', 'status phải là ACTIVE hoặc DECLINED.');
    const row = await GroupMember.findOne({
      _id: req.params.invitationId,
      userId: req.user._id,
      status: 'PENDING',
    });
    if (!row) fail(404, 'NOT_FOUND', 'Không tìm thấy lời mời.');
    row.status = req.body.status;
    row.joinedAt = req.body.status === 'ACTIVE' ? new Date() : null;
    await row.save();
    res.json(data({ status: row.status }));
  })
);
router.patch(
  '/groups/:groupId/owner',
  asyncRoute(async (req, res) => {
    const { group } = await owner(req.params.groupId, req.user._id);
    const newOwnerId = objectId(req.body.newOwnerId, 'newOwnerId');
    if (
      String(newOwnerId) === String(req.user._id) ||
      !(await GroupMember.exists({ groupId: group._id, userId: newOwnerId, status: 'ACTIVE' }))
    )
      fail(400, 'VALIDATION_ERROR', 'OWNER mới phải là thành viên ACTIVE khác.');
    group.ownerId = newOwnerId;
    await group.save();
    res.json(data({ groupId: group._id, ownerId: group.ownerId }));
  })
);
router.delete(
  '/groups/:groupId/members/:userId',
  asyncRoute(async (req, res) => {
    const { group } = await owner(req.params.groupId, req.user._id);
    const userId = objectId(req.params.userId, 'userId');
    if (String(userId) === String(group.ownerId))
      fail(409, 'OWNER_CANNOT_BE_REMOVED', 'OWNER phải chuyển quyền trước khi rời nhóm.');
    const member = await GroupMember.findOne({
      groupId: group._id,
      userId,
      status: { $in: ['ACTIVE', 'PENDING'] },
    });
    if (!member) fail(404, 'NOT_FOUND', 'Không tìm thấy thành viên.');
    member.status = 'REMOVED';
    await member.save();
    res.status(204).end();
  })
);
router.delete(
  '/groups/:groupId/membership',
  asyncRoute(async (req, res) => {
    const { group, member, isOwner } = await membership(req.params.groupId, req.user._id);
    if (isOwner)
      fail(
        409,
        'OWNER_MUST_TRANSFER',
        'OWNER cần chuyển quyền cho thành viên ACTIVE khác trước khi rời nhóm.'
      );
    member.status = 'LEFT';
    await member.save();
    res.status(204).end();
  })
);

router.get(
  '/groups/:groupId/tasks',
  asyncRoute(async (req, res) => {
    const { group } = await membership(req.params.groupId, req.user._id);
    const { skip, limit } = pageOptions(req.query);
    const filter = { groupId: group._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assigneeId) filter.assigneeId = objectId(req.query.assigneeId, 'assigneeId');
    res.json(data(await GroupTask.find(filter).sort({ dueAt: 1 }).skip(skip).limit(limit)));
  })
);
router.post(
  '/groups/:groupId/tasks',
  asyncRoute(async (req, res) => {
    const { group } = await membership(req.params.groupId, req.user._id);
    const assigneeId = objectId(req.body.assigneeId, 'assigneeId');
    if (!(await GroupMember.exists({ groupId: group._id, userId: assigneeId, status: 'ACTIVE' })))
      fail(400, 'VALIDATION_ERROR', 'Người được giao phải là thành viên ACTIVE.');
    const task = await GroupTask.create({
      groupId: group._id,
      createdBy: req.user._id,
      assigneeId,
      title: requiredString(req.body.title, 'title'),
      description: optionalString(req.body.description, 'description', 5000),
      dueAt: validDate(req.body.dueAt, 'dueAt'),
    });
    res.status(201).json(data(task));
  })
);
router.get(
  '/groups/:groupId/tasks/:taskId',
  asyncRoute(async (req, res) => {
    const { group } = await membership(req.params.groupId, req.user._id);
    objectId(req.params.taskId, 'taskId');
    const task = await GroupTask.findOne({ _id: req.params.taskId, groupId: group._id });
    if (!task) fail(404, 'NOT_FOUND', 'Không tìm thấy nhiệm vụ.');
    res.json(data(task));
  })
);
router.patch(
  '/groups/:groupId/tasks/:taskId',
  asyncRoute(async (req, res) => {
    const { group, isOwner } = await membership(req.params.groupId, req.user._id);
    objectId(req.params.taskId, 'taskId');
    const task = await GroupTask.findOne({ _id: req.params.taskId, groupId: group._id });
    if (!task) fail(404, 'NOT_FOUND', 'Không tìm thấy nhiệm vụ.');
    const mayManage = isOwner || String(task.createdBy) === String(req.user._id);
    const allowed = mayManage
      ? ['title', 'description', 'dueAt', 'assigneeId', 'status']
      : ['status'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(403, 'FORBIDDEN', 'Bạn không được sửa các trường đã gửi.');
    if ('title' in req.body) task.title = requiredString(req.body.title, 'title');
    if ('description' in req.body)
      task.description = optionalString(req.body.description, 'description', 5000);
    if ('dueAt' in req.body) task.dueAt = validDate(req.body.dueAt, 'dueAt');
    if ('assigneeId' in req.body) {
      const id = objectId(req.body.assigneeId, 'assigneeId');
      if (!(await GroupMember.exists({ groupId: group._id, userId: id, status: 'ACTIVE' })))
        fail(400, 'VALIDATION_ERROR', 'Người được giao phải là thành viên ACTIVE.');
      task.assigneeId = id;
    }
    if ('status' in req.body) {
      if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(req.body.status))
        fail(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ.');
      if (!mayManage && String(task.assigneeId) !== String(req.user._id))
        fail(403, 'FORBIDDEN', 'Chỉ người được giao mới được cập nhật trạng thái.');
      task.status = req.body.status;
    }
    await task.save();
    res.json(data(task));
  })
);
router.delete(
  '/groups/:groupId/tasks/:taskId',
  asyncRoute(async (req, res) => {
    const { group, isOwner } = await membership(req.params.groupId, req.user._id);
    objectId(req.params.taskId, 'taskId');
    const task = await GroupTask.findOne({ _id: req.params.taskId, groupId: group._id });
    if (!task) fail(404, 'NOT_FOUND', 'Không tìm thấy nhiệm vụ.');
    if (!isOwner && String(task.createdBy) !== String(req.user._id))
      fail(403, 'FORBIDDEN', 'Bạn không được xóa nhiệm vụ này.');
    await task.deleteOne();
    res.status(204).end();
  })
);

export default router;
