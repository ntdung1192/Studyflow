import { Router } from 'express';
import mongoose from 'mongoose';
import { Availability } from '../models/Availability.js';
import { Goal } from '../models/Goal.js';
import { Schedule } from '../models/Schedule.js';
import { Subject } from '../models/Subject.js';
import { Task } from '../models/Task.js';
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
const existsForUser = async (Model, id, ownerId, field) => {
  objectId(id, field);
  const doc = await Model.findOne({ _id: id, ownerId });
  if (!doc) fail(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu.');
  return doc;
};
const list = (Model, filter) =>
  asyncRoute(async (req, res) => {
    const { skip, limit } = pageOptions(req.query);
    res.json(data(await Model.find(filter(req)).sort({ createdAt: -1 }).skip(skip).limit(limit)));
  });

router.get(
  '/subjects',
  list(Subject, (req) => ({ ownerId: req.user._id }))
);
router.post(
  '/subjects',
  asyncRoute(async (req, res) => {
    const subject = await Subject.create({
      ownerId: req.user._id,
      name: requiredString(req.body.name, 'name', 120),
      code: optionalString(req.body.code, 'code', 40),
      description: optionalString(req.body.description, 'description', 1000),
    });
    res.status(201).json(data(subject));
  })
);
router.get(
  '/subjects/:id',
  asyncRoute(async (req, res) =>
    res.json(data(await existsForUser(Subject, req.params.id, req.user._id, 'subjectId')))
  )
);
router.patch(
  '/subjects/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Subject, req.params.id, req.user._id, 'subjectId');
    const allowed = ['name', 'code', 'description'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    if ('name' in req.body) doc.name = requiredString(req.body.name, 'name', 120);
    if ('code' in req.body) doc.code = optionalString(req.body.code, 'code', 40);
    if ('description' in req.body)
      doc.description = optionalString(req.body.description, 'description', 1000);
    await doc.save();
    res.json(data(doc));
  })
);
router.delete(
  '/subjects/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Subject, req.params.id, req.user._id, 'subjectId');
    if (
      (await Task.exists({ ownerId: req.user._id, subjectId: doc._id })) ||
      (await Schedule.exists({ ownerId: req.user._id, subjectId: doc._id }))
    )
      fail(409, 'SUBJECT_IN_USE', 'Môn học đang được công việc hoặc lịch sử dụng.');
    await doc.deleteOne();
    res.status(204).end();
  })
);

router.get(
  '/tasks',
  asyncRoute(async (req, res) => {
    const filter = { ownerId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.subjectId) filter.subjectId = objectId(req.query.subjectId, 'subjectId');
    if (req.query.dueBefore || req.query.dueAfter) filter.dueAt = {};
    if (req.query.dueBefore) filter.dueAt.$lte = validDate(req.query.dueBefore, 'dueBefore');
    if (req.query.dueAfter) filter.dueAt.$gte = validDate(req.query.dueAfter, 'dueAfter');
    const { skip, limit } = pageOptions(req.query);
    res.json(data(await Task.find(filter).sort({ dueAt: 1 }).skip(skip).limit(limit)));
  })
);
router.post(
  '/tasks',
  asyncRoute(async (req, res) => {
    const subjectId = req.body.subjectId ? objectId(req.body.subjectId, 'subjectId') : null;
    if (subjectId && !(await Subject.exists({ _id: subjectId, ownerId: req.user._id })))
      fail(404, 'NOT_FOUND', 'Không tìm thấy môn học.');
    const task = await Task.create({
      ownerId: req.user._id,
      subjectId,
      title: requiredString(req.body.title, 'title'),
      description: optionalString(req.body.description, 'description', 5000),
      dueAt: validDate(req.body.dueAt, 'dueAt'),
      estimatedMinutes: req.body.estimatedMinutes ?? 60,
    });
    res.status(201).json(data(task));
  })
);
router.get(
  '/tasks/:id',
  asyncRoute(async (req, res) =>
    res.json(data(await existsForUser(Task, req.params.id, req.user._id, 'taskId')))
  )
);
router.patch(
  '/tasks/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Task, req.params.id, req.user._id, 'taskId');
    const allowed = ['subjectId', 'title', 'description', 'dueAt', 'estimatedMinutes', 'status'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    if ('subjectId' in req.body) {
      const id = req.body.subjectId ? objectId(req.body.subjectId, 'subjectId') : null;
      if (id && !(await Subject.exists({ _id: id, ownerId: req.user._id })))
        fail(404, 'NOT_FOUND', 'Không tìm thấy môn học.');
      doc.subjectId = id;
    }
    if ('title' in req.body) doc.title = requiredString(req.body.title, 'title');
    if ('description' in req.body)
      doc.description = optionalString(req.body.description, 'description', 5000);
    if ('dueAt' in req.body) doc.dueAt = validDate(req.body.dueAt, 'dueAt');
    for (const key of ['estimatedMinutes', 'status']) if (key in req.body) doc[key] = req.body[key];
    await doc.save();
    res.json(data(doc));
  })
);
router.delete(
  '/tasks/:id',
  asyncRoute(async (req, res) => {
    await (await existsForUser(Task, req.params.id, req.user._id, 'taskId')).deleteOne();
    res.status(204).end();
  })
);

router.get(
  '/schedules',
  asyncRoute(async (req, res) => {
    const filter = { ownerId: req.user._id };
    if (req.query.from || req.query.to) filter.startsAt = {};
    if (req.query.from) filter.startsAt.$gte = validDate(req.query.from, 'from');
    if (req.query.to) filter.startsAt.$lt = validDate(req.query.to, 'to');
    const { skip, limit } = pageOptions(req.query);
    res.json(data(await Schedule.find(filter).sort({ startsAt: 1 }).skip(skip).limit(limit)));
  })
);
const assertNoScheduleOverlap = async (ownerId, startsAt, endsAt, excludeId) => {
  const filter = { ownerId, startsAt: { $lt: endsAt }, endsAt: { $gt: startsAt } };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Schedule.exists(filter))
    fail(409, 'SCHEDULE_CONFLICT', 'Lịch bị trùng với một buổi học khác.');
};
router.post(
  '/schedules',
  asyncRoute(async (req, res) => {
    const startsAt = validDate(req.body.startsAt, 'startsAt');
    const endsAt = validDate(req.body.endsAt, 'endsAt');
    if (endsAt <= startsAt) fail(400, 'VALIDATION_ERROR', 'Giờ kết thúc phải sau giờ bắt đầu.');
    const subjectId = req.body.subjectId ? objectId(req.body.subjectId, 'subjectId') : null;
    const taskId = req.body.taskId ? objectId(req.body.taskId, 'taskId') : null;
    if (subjectId && !(await Subject.exists({ _id: subjectId, ownerId: req.user._id })))
      fail(404, 'NOT_FOUND', 'Không tìm thấy môn học.');
    if (taskId && !(await Task.exists({ _id: taskId, ownerId: req.user._id })))
      fail(404, 'NOT_FOUND', 'Không tìm thấy công việc.');
    await assertNoScheduleOverlap(req.user._id, startsAt, endsAt);
    const doc = await Schedule.create({
      ownerId: req.user._id,
      subjectId,
      taskId,
      title: requiredString(req.body.title, 'title'),
      startsAt,
      endsAt,
      location: optionalString(req.body.location, 'location', 200),
      notes: optionalString(req.body.notes, 'notes', 2000),
    });
    res.status(201).json(data(doc));
  })
);
router.get(
  '/schedules/:id',
  asyncRoute(async (req, res) =>
    res.json(data(await existsForUser(Schedule, req.params.id, req.user._id, 'scheduleId')))
  )
);
router.patch(
  '/schedules/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Schedule, req.params.id, req.user._id, 'scheduleId');
    const allowed = ['subjectId', 'taskId', 'title', 'startsAt', 'endsAt', 'location', 'notes'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    for (const key of ['subjectId', 'taskId'])
      if (key in req.body) {
        const Model = key === 'subjectId' ? Subject : Task;
        const id = req.body[key] ? objectId(req.body[key], key) : null;
        if (id && !(await Model.exists({ _id: id, ownerId: req.user._id })))
          fail(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu liên kết.');
        doc[key] = id;
      }
    if ('title' in req.body) doc.title = requiredString(req.body.title, 'title');
    for (const key of ['location', 'notes'])
      if (key in req.body)
        doc[key] = optionalString(req.body[key], key, key === 'notes' ? 2000 : 200);
    if ('startsAt' in req.body) doc.startsAt = validDate(req.body.startsAt, 'startsAt');
    if ('endsAt' in req.body) doc.endsAt = validDate(req.body.endsAt, 'endsAt');
    if (doc.endsAt <= doc.startsAt)
      fail(400, 'VALIDATION_ERROR', 'Giờ kết thúc phải sau giờ bắt đầu.');
    await assertNoScheduleOverlap(req.user._id, doc.startsAt, doc.endsAt, doc._id);
    await doc.save();
    res.json(data(doc));
  })
);
router.delete(
  '/schedules/:id',
  asyncRoute(async (req, res) => {
    await (await existsForUser(Schedule, req.params.id, req.user._id, 'scheduleId')).deleteOne();
    res.status(204).end();
  })
);

router.get(
  '/goals',
  list(Goal, (req) => ({ ownerId: req.user._id }))
);
router.post(
  '/goals',
  asyncRoute(async (req, res) => {
    const doc = await Goal.create({
      ownerId: req.user._id,
      title: requiredString(req.body.title, 'title'),
      description: optionalString(req.body.description, 'description'),
      dueAt: req.body.dueAt ? validDate(req.body.dueAt, 'dueAt') : null,
    });
    res
      .status(201)
      .json(data({ ...doc.toObject(), status: doc.progress === 100 ? 'COMPLETED' : 'ACTIVE' }));
  })
);
router.get(
  '/goals/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Goal, req.params.id, req.user._id, 'goalId');
    res.json(data({ ...doc.toObject(), status: doc.progress === 100 ? 'COMPLETED' : 'ACTIVE' }));
  })
);
router.patch(
  '/goals/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Goal, req.params.id, req.user._id, 'goalId');
    const allowed = ['title', 'description', 'dueAt', 'progress'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    if ('title' in req.body) doc.title = requiredString(req.body.title, 'title');
    if ('description' in req.body)
      doc.description = optionalString(req.body.description, 'description');
    if ('dueAt' in req.body) doc.dueAt = req.body.dueAt ? validDate(req.body.dueAt, 'dueAt') : null;
    if ('progress' in req.body) doc.progress = req.body.progress;
    await doc.save();
    res.json(data({ ...doc.toObject(), status: doc.progress === 100 ? 'COMPLETED' : 'ACTIVE' }));
  })
);
router.delete(
  '/goals/:id',
  asyncRoute(async (req, res) => {
    await (await existsForUser(Goal, req.params.id, req.user._id, 'goalId')).deleteOne();
    res.status(204).end();
  })
);

router.get(
  '/availability',
  list(Availability, (req) => ({ ownerId: req.user._id }))
);
const availabilityOverlap = async (ownerId, dayOfWeek, startMinute, endMinute, excludeId) => {
  const filter = {
    ownerId,
    dayOfWeek,
    startMinute: { $lt: endMinute },
    endMinute: { $gt: startMinute },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Availability.exists(filter))
    fail(409, 'AVAILABILITY_CONFLICT', 'Khung giờ bị trùng với một khung khác trong cùng ngày.');
};
router.post(
  '/availability',
  asyncRoute(async (req, res) => {
    const { dayOfWeek, startMinute, endMinute } = req.body;
    if (
      ![dayOfWeek, startMinute, endMinute].every(Number.isInteger) ||
      dayOfWeek < 1 ||
      dayOfWeek > 7 ||
      startMinute < 0 ||
      startMinute > 1439 ||
      endMinute < 1 ||
      endMinute > 1440 ||
      endMinute <= startMinute
    )
      fail(400, 'VALIDATION_ERROR', 'Ngày hoặc khung giờ không hợp lệ.');
    await availabilityOverlap(req.user._id, dayOfWeek, startMinute, endMinute);
    res
      .status(201)
      .json(
        data(
          await Availability.create({ ownerId: req.user._id, dayOfWeek, startMinute, endMinute })
        )
      );
  })
);
router.patch(
  '/availability/:id',
  asyncRoute(async (req, res) => {
    const doc = await existsForUser(Availability, req.params.id, req.user._id, 'availabilityId');
    const allowed = ['dayOfWeek', 'startMinute', 'endMinute'];
    if (
      !Object.keys(req.body).length ||
      Object.keys(req.body).some((key) => !allowed.includes(key))
    )
      fail(400, 'VALIDATION_ERROR', 'Trường cập nhật không hợp lệ.');
    for (const key of allowed) if (key in req.body) doc[key] = req.body[key];
    if (
      ![doc.dayOfWeek, doc.startMinute, doc.endMinute].every(Number.isInteger) ||
      doc.dayOfWeek < 1 ||
      doc.dayOfWeek > 7 ||
      doc.startMinute < 0 ||
      doc.startMinute > 1439 ||
      doc.endMinute < 1 ||
      doc.endMinute > 1440 ||
      doc.endMinute <= doc.startMinute
    )
      fail(400, 'VALIDATION_ERROR', 'Ngày hoặc khung giờ không hợp lệ.');
    await availabilityOverlap(req.user._id, doc.dayOfWeek, doc.startMinute, doc.endMinute, doc._id);
    await doc.save();
    res.json(data(doc));
  })
);
router.delete(
  '/availability/:id',
  asyncRoute(async (req, res) => {
    await (
      await existsForUser(Availability, req.params.id, req.user._id, 'availabilityId')
    ).deleteOne();
    res.status(204).end();
  })
);

export default router;
