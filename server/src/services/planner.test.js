import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HttpError } from '../lib/http.js';
import { buildPlannerSuggestions, localToUtc, resolvePlannerRange } from './planner.js';

describe('planner service', () => {
  it('resolves local timezone boundaries accurately for Asia/Ho_Chi_Minh (UTC+7)', () => {
    const range = resolvePlannerRange('2026-11-16', '2026-11-16', 'Asia/Ho_Chi_Minh');
    assert.equal(range.days, 1);
    assert.equal(range.rangeStartUtc.toISOString(), '2026-11-15T17:00:00.000Z');
    assert.equal(range.rangeEndUtc.toISOString(), '2026-11-16T17:00:00.000Z');
  });

  it('rejects nonexistent calendar dates and ranges over 14 days', () => {
    assert.throws(() => resolvePlannerRange('2026-02-31', '2026-03-01'), HttpError);
    assert.throws(() => resolvePlannerRange('2026-11-01', '2026-11-15'), HttpError);
    assert.throws(() => resolvePlannerRange('2026-11-10', '2026-11-09'), HttpError);
  });

  it('avoids early-morning UTC+7 schedules (00:00-07:00 local) and respects deadlines', () => {
    const timeZone = 'Asia/Ho_Chi_Minh';
    const range = resolvePlannerRange('2026-11-16', '2026-11-16', timeZone); // Monday (dayOfWeek = 1)
    const now = localToUtc('2026-11-16', 300, timeZone); // 05:00 +07:00

    const result = buildPlannerSuggestions({
      startDate: range.startDate,
      days: range.days,
      timeZone,
      now,
      availability: [{ dayOfWeek: 1, startMinute: 360, endMinute: 540 }], // 06:00-09:00 +07:00
      schedules: [
        {
          startsAt: localToUtc('2026-11-16', 360, timeZone), // 06:00-07:00 +07:00
          endsAt: localToUtc('2026-11-16', 420, timeZone),
        },
      ],
      tasks: [
        {
          _id: 'overdue-task',
          dueAt: localToUtc('2026-11-16', 240, timeZone), // 04:00 +07:00 (already past)
          estimatedMinutes: 60,
        },
        {
          _id: 'morning-task',
          dueAt: localToUtc('2026-11-16', 600, timeZone), // 10:00 +07:00
          estimatedMinutes: 60,
        },
        {
          _id: 'too-long-task',
          dueAt: localToUtc('2026-11-16', 600, timeZone),
          estimatedMinutes: 120, // only 60m left (08:00-09:00) after morning-task
        },
      ],
    });

    assert.deepEqual(result.suggestions, [
      {
        taskId: 'morning-task',
        startsAt: localToUtc('2026-11-16', 420, timeZone).toISOString(), // 07:00 +07:00
        endsAt: localToUtc('2026-11-16', 480, timeZone).toISOString(), // 08:00 +07:00
      },
    ]);
    assert.deepEqual(result.unscheduledTasks, [
      { taskId: 'overdue-task', reason: 'OVERDUE' },
      { taskId: 'too-long-task', reason: 'NO_SLOT_BEFORE_DUE_DATE' },
    ]);
  });
});
