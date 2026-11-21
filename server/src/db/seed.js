import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from './connection.js';
import { Availability } from '../models/Availability.js';
import { Goal } from '../models/Goal.js';
import { GroupMember } from '../models/GroupMember.js';
import { GroupTask } from '../models/GroupTask.js';
import { Schedule } from '../models/Schedule.js';
import { StudyGroup } from '../models/StudyGroup.js';
import { Subject } from '../models/Subject.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

const email = (process.env.DEMO_EMAIL || 'demo@studyflow.local').trim().toLowerCase();
const password = process.env.DEMO_PASSWORD || 'StudyflowDemo123!';

if (password.length < 8) throw new Error('DEMO_PASSWORD must contain at least 8 characters.');

try {
  await connectDatabase();

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'StudyFlow Demo',
        email,
        timeZone: 'Asia/Ho_Chi_Minh',
        passwordHash: await bcrypt.hash(password, 12),
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  const subject = await Subject.findOneAndUpdate(
    { ownerId: user._id, name: 'CÆ¡ sá»Ÿ dá»¯ liá»‡u' },
    { $set: { code: 'CSDL', description: 'Dá»¯ liá»‡u máº«u cho frontend.' } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  const task = await Task.findOneAndUpdate(
    { ownerId: user._id, title: 'Ã”n mÃ´ hÃ¬nh dá»¯ liá»‡u' },
    {
      $set: {
        subjectId: subject._id,
        description: 'Task máº«u Ä‘Æ°á»£c táº¡o bá»Ÿi db:seed.',
        dueAt: new Date(Date.now() + 2 * 86400000),
        estimatedMinutes: 60,
        status: 'TODO',
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  const scheduleStart = new Date(Date.now() + 86400000);
  scheduleStart.setMinutes(0, 0, 0);
  await Schedule.findOneAndUpdate(
    { ownerId: user._id, title: 'Buá»•i há»c máº«u' },
    {
      $set: {
        subjectId: subject._id,
        taskId: task._id,
        startsAt: scheduleStart,
        endsAt: new Date(scheduleStart.getTime() + 60 * 60000),
        location: 'ThÆ° viá»‡n',
        notes: 'Dá»¯ liá»‡u máº«u Ä‘Æ°á»£c táº¡o bá»Ÿi db:seed.',
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  await Goal.findOneAndUpdate(
    { ownerId: user._id, title: 'HoÃ n thÃ nh chÆ°Æ¡ng cÆ¡ sá»Ÿ dá»¯ liá»‡u' },
    {
      $set: {
        description: 'Má»¥c tiÃªu demo.',
        dueAt: new Date(Date.now() + 7 * 86400000),
        progress: 35,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  await Availability.findOneAndUpdate(
    { ownerId: user._id, dayOfWeek: 1, startMinute: 540 },
    { $set: { endMinute: 720 } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  const group = await StudyGroup.findOneAndUpdate(
    { ownerId: user._id, name: 'NhÃ³m há»c máº«u' },
    { $set: { description: 'NhÃ³m demo cho frontend.' } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );
  await GroupMember.findOneAndUpdate(
    { groupId: group._id, userId: user._id },
    { $set: { status: 'ACTIVE', joinedAt: new Date() } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );
  await GroupTask.findOneAndUpdate(
    { groupId: group._id, title: 'Chuáº©n bá»‹ vÃ­ dá»¥ minh há»a' },
    {
      $set: {
        createdBy: user._id,
        assigneeId: user._id,
        description: 'Nhiá»‡m vá»¥ nhÃ³m máº«u.',
        dueAt: new Date(Date.now() + 3 * 86400000),
        status: 'IN_PROGRESS',
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  console.log(`Demo data ready for ${email}.`);
  console.log('Use this seed only in a local development database.');
} catch (error) {
  console.error(`Database seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
