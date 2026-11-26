import { Router } from 'express';
import { GroupMember } from '../models/GroupMember.js';
import { GroupTask } from '../models/GroupTask.js';
import { Goal } from '../models/Goal.js';
import { Schedule } from '../models/Schedule.js';
import { Subject } from '../models/Subject.js';
import { Task } from '../models/Task.js';
import { asyncRoute, serialize } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get(
  '/dashboard/summary',
  asyncRoute(async (req, res) => {
    const now = new Date();
    const nextWeek = new Date(now.valueOf() + 7 * 86400000);
    const [subjectCount, openTaskCount, upcomingTasks, upcomingSchedules, goals, groups] =
      await Promise.all([
        Subject.countDocuments({ ownerId: req.user._id }),
        Task.countDocuments({ ownerId: req.user._id, status: { $ne: 'DONE' } }),
        Task.find({
          ownerId: req.user._id,
          status: { $ne: 'DONE' },
          dueAt: { $gte: now, $lte: nextWeek },
        })
          .sort({ dueAt: 1 })
          .limit(10),
        Schedule.find({ ownerId: req.user._id, startsAt: { $gte: now, $lte: nextWeek } })
          .sort({ startsAt: 1 })
          .limit(10),
        Goal.find({ ownerId: req.user._id }).sort({ dueAt: 1 }).limit(10),
        GroupMember.find({ userId: req.user._id, status: 'ACTIVE' }).distinct('groupId'),
      ]);
    const groupTaskCount = groups.length
      ? await GroupTask.countDocuments({ groupId: { $in: groups } })
      : 0;
    res.json({
      data: {
        subjectCount,
        openTaskCount,
        upcomingTasks: serialize(upcomingTasks),
        upcomingSchedules: serialize(upcomingSchedules),
        goals: goals.map((goal) => ({
          ...serialize(goal),
          status: goal.progress === 100 ? 'COMPLETED' : 'ACTIVE',
        })),
        groupTaskCount,
      },
    });
  })
);
export default router;
