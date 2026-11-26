import { Router } from 'express';
import { Availability } from '../models/Availability.js';
import { Schedule } from '../models/Schedule.js';
import { Task } from '../models/Task.js';
import { asyncRoute } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { buildPlannerSuggestions, resolvePlannerRange } from '../services/planner.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/planner/suggestions',
  asyncRoute(async (req, res) => {
    const timeZone = req.user.timeZone || 'Asia/Ho_Chi_Minh';
    const { startDate, days, rangeStartUtc, rangeEndUtc } = resolvePlannerRange(
      req.body.from,
      req.body.to,
      timeZone
    );

    const [tasks, availability, schedules] = await Promise.all([
      Task.find({
        ownerId: req.user._id,
        status: { $in: ['TODO', 'IN_PROGRESS'] },
        dueAt: { $lte: rangeEndUtc },
      }).sort({ dueAt: 1, createdAt: 1 }),
      Availability.find({ ownerId: req.user._id }).sort({ dayOfWeek: 1, startMinute: 1 }),
      Schedule.find({
        ownerId: req.user._id,
        startsAt: { $lt: rangeEndUtc },
        endsAt: { $gt: rangeStartUtc },
      }).sort({ startsAt: 1 }),
    ]);

    const result = buildPlannerSuggestions({
      startDate,
      days,
      tasks,
      availability,
      schedules,
      timeZone,
    });

    res.json({ data: result });
  })
);

export default router;
