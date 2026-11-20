import { fail } from '../lib/http.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

export function parseLocalDateKey(value, field) {
  if (typeof value !== 'string' || !DATE_KEY_REGEX.test(value)) {
    fail(400, 'VALIDATION_ERROR', 'from và to phải là ngày địa phương dạng YYYY-MM-DD.', [
      { field, message: 'Ngày phải có dạng YYYY-MM-DD.' },
    ]);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    fail(400, 'VALIDATION_ERROR', 'Ngày không hợp lệ.', [
      { field, message: 'Ngày không tồn tại trong lịch.' },
    ]);
  }
  return date;
}

export function localToUtc(dateKey, minute, timeZone) {
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

export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function isoWeekday(key) {
  const day = new Date(`${key}T00:00:00.000Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export function resolvePlannerRange(from, to, timeZone = 'Asia/Ho_Chi_Minh') {
  const startDate = parseLocalDateKey(from, 'from');
  const endDate = parseLocalDateKey(to, 'to');
  const days = Math.round((endDate - startDate) / DAY_MS) + 1;
  if (days < 1 || days > 14) {
    fail(400, 'VALIDATION_ERROR', 'Khoảng ngày phải từ 1 đến 14 ngày.');
  }
  return {
    startDate,
    days,
    rangeStartUtc: localToUtc(from, 0, timeZone),
    rangeEndUtc: localToUtc(to, 1440, timeZone),
  };
}

export function buildPlannerSuggestions({
  startDate,
  days,
  tasks,
  availability,
  schedules,
  timeZone = 'Asia/Ho_Chi_Minh',
  now = new Date(),
}) {
  const busy = schedules
    .map((item) => ({ start: new Date(item.startsAt), end: new Date(item.endsAt) }))
    .sort((a, b) => a.start - b.start);
  const suggestions = [];
  const unscheduledTasks = [];

  for (const task of tasks) {
    const taskId = String(task._id ?? task.id);
    const dueAt = new Date(task.dueAt);
    const durationMs = task.estimatedMinutes * 60000;

    if (dueAt <= now) {
      unscheduledTasks.push({ taskId, reason: 'OVERDUE' });
      continue;
    }

    let match = null;
    for (let day = 0; day < days && !match; day += 1) {
      const key = toDateKey(new Date(startDate.valueOf() + day * DAY_MS));
      const windows = availability.filter((slot) => slot.dayOfWeek === isoWeekday(key));
      for (const window of windows) {
        const winStart = localToUtc(key, window.startMinute, timeZone);
        const winEnd = localToUtc(key, window.endMinute, timeZone);
        let cursor = new Date(Math.max(winStart.valueOf(), now.valueOf()));

        for (const occupied of busy) {
          if (occupied.end <= cursor || occupied.start >= winEnd) continue;
          if (
            occupied.start.valueOf() - cursor.valueOf() >= durationMs &&
            cursor.valueOf() + durationMs <= dueAt.valueOf()
          ) {
            match = {
              start: cursor,
              end: new Date(cursor.valueOf() + durationMs),
            };
            break;
          }
          cursor = new Date(Math.max(cursor.valueOf(), occupied.end.valueOf()));
          if (cursor >= winEnd) break;
        }

        if (
          !match &&
          cursor.valueOf() + durationMs <= winEnd.valueOf() &&
          cursor.valueOf() + durationMs <= dueAt.valueOf()
        ) {
          match = {
            start: cursor,
            end: new Date(cursor.valueOf() + durationMs),
          };
        }

        if (match) break;
      }
    }

    if (match) {
      busy.push(match);
      busy.sort((a, b) => a.start - b.start);
      suggestions.push({
        taskId,
        startsAt: match.start.toISOString(),
        endsAt: match.end.toISOString(),
      });
    } else {
      unscheduledTasks.push({ taskId, reason: 'NO_SLOT_BEFORE_DUE_DATE' });
    }
  }

  return { suggestions, unscheduledTasks };
}
