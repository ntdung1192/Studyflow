import { Router } from 'express';
import { Availability } from '../models/Availability.js';
import { Schedule } from '../models/Schedule.js';
import { Task } from '../models/Task.js';
import { asyncRoute, fail, validDate } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
const dayMs = 24 * 60 * 60 * 1000;
function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
}
function localToUtc(dateKey, minute, timeZone) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  const target = Date.UTC(year, month - 1, day, hour, min);
  let guess = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const p = localParts(new Date(guess), timeZone);
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const delta = target - represented;
    if (!delta) break;
    guess += delta;
  }
  return new Date(guess);
}
const dateKey = (date) => date.toISOString().slice(0, 10);
const isoWeekday = (key) => {
  const day = new Date(`${key}T00:00:00.000Z`).getUTCDay();
  return day === 0 ? 7 : day;
};
router.post(
  '/planner/suggestions',
  asyncRoute(async (req, res) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(req.body.from ?? '') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(req.body.to ?? '')
    )
      fail(400, 'VALIDATION_ERROR', 'from và to phải là ngày địa phương dạng YYYY-MM-DD.');
    const start = validDate(`${req.body.from}T00:00:00.000Z`, 'from');
    const end = validDate(`${req.body.to}T00:00:00.000Z`, 'to');
    const days = Math.round((end - start) / dayMs) + 1;
    if (days < 1 || days > 14) fail(400, 'VALIDATION_ERROR', 'Khoảng ngày phải từ 1 đến 14 ngày.');
    const [tasks, availability, schedules] = await Promise.all([
      Task.find({
        ownerId: req.user._id,
        status: { $in: ['TODO', 'IN_PROGRESS'] },
        dueAt: { $lte: new Date(end.valueOf() + dayMs) },
      }).sort({ dueAt: 1, createdAt: 1 }),
      Availability.find({ ownerId: req.user._id }).sort({ dayOfWeek: 1, startMinute: 1 }),
      Schedule.find({
        ownerId: req.user._id,
        startsAt: { $lt: new Date(end.valueOf() + dayMs) },
        endsAt: { $gt: start },
      }).sort({ startsAt: 1 }),
    ]);
    const busy = schedules.map((item) => ({ start: item.startsAt, end: item.endsAt }));
    const suggestions = [];
    const unscheduledTasks = [];
    const now = new Date();
    const timeZone = req.user.timeZone || 'Asia/Ho_Chi_Minh';
    for (const task of tasks) {
      if (task.dueAt <= now) {
        unscheduledTasks.push({ taskId: String(task._id), reason: 'OVERDUE' });
        continue;
      }
      let match = null;
      for (let day = 0; day < days && !match; day += 1) {
        const key = dateKey(new Date(start.valueOf() + day * dayMs));
        const windows = availability.filter((slot) => slot.dayOfWeek === isoWeekday(key));
        for (const window of windows) {
          const winStart = localToUtc(key, window.startMinute, timeZone);
          const winEnd = localToUtc(key, window.endMinute, timeZone);
          let cursor = new Date(Math.max(winStart.valueOf(), now.valueOf()));
          for (const occupied of busy) {
            if (occupied.end <= cursor || occupied.start >= winEnd) continue;
            if (
              occupied.start.valueOf() - cursor.valueOf() >= task.estimatedMinutes * 60000 &&
              cursor.valueOf() + task.estimatedMinutes * 60000 <= task.dueAt.valueOf()
            ) {
              match = {
                start: cursor,
                end: new Date(cursor.valueOf() + task.estimatedMinutes * 60000),
              };
              break;
            }
            cursor = new Date(Math.max(cursor.valueOf(), occupied.end.valueOf()));
            if (cursor >= winEnd) break;
          }
          if (
            !match &&
            cursor.valueOf() + task.estimatedMinutes * 60000 <= winEnd.valueOf() &&
            cursor.valueOf() + task.estimatedMinutes * 60000 <= task.dueAt.valueOf()
          )
            match = {
              start: cursor,
              end: new Date(cursor.valueOf() + task.estimatedMinutes * 60000),
            };
          if (match) break;
        }
      }
      if (match) {
        busy.push(match);
        busy.sort((a, b) => a.start - b.start);
        suggestions.push({
          taskId: String(task._id),
          startsAt: match.start.toISOString(),
          endsAt: match.end.toISOString(),
        });
      } else unscheduledTasks.push({ taskId: String(task._id), reason: 'NO_SLOT_BEFORE_DUE_DATE' });
    }
    res.json({ data: { suggestions, unscheduledTasks } });
  })
);
export default router;
