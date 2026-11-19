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
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const subject = await Subject.findOneAndUpdate(
    { ownerId: user._id, name: 'Cơ sở dữ liệu' },
    { $set: { code: 'CSDL', description: 'Dữ liệu mẫu cho frontend.' } },
    { upsert: true, new: true, runValidators: true }
  );

  const task = await Task.findOneAndUpdate(
    { ownerId: user._id, title: 'Ôn mô hình dữ liệu' },
    {
      $set: {
        subjectId: subject._id,
        description: 'Task mẫu được tạo bởi db:seed.',
        dueAt: new Date(Date.now() + 2 * 86400000),
        estimatedMinutes: 60,
        status: 'TODO',
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  const scheduleStart = new Date(Date.now() + 86400000);
  scheduleStart.setMinutes(0, 0, 0);
  await Schedule.findOneAndUpdate(
    { ownerId: user._id, title: 'Buổi học mẫu' },
    {
      $set: {
        subjectId: subject._id,
        taskId: task._id,
        startsAt: scheduleStart,
        endsAt: new Date(scheduleStart.getTime() + 60 * 60000),
        location: 'Thư viện',
        notes: 'Dữ liệu mẫu được tạo bởi db:seed.',
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Goal.findOneAndUpdate(
    { ownerId: user._id, title: 'Hoàn thành chương cơ sở dữ liệu' },
    {
      $set: {
        description: 'Mục tiêu demo.',
        dueAt: new Date(Date.now() + 7 * 86400000),
        progress: 35,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Availability.findOneAndUpdate(
    { ownerId: user._id, dayOfWeek: 1, startMinute: 540 },
    { $set: { endMinute: 720 } },
    { upsert: true, new: true, runValidators: true }
  );

  const group = await StudyGroup.findOneAndUpdate(
    { ownerId: user._id, name: 'Nhóm học mẫu' },
    { $set: { description: 'Nhóm demo cho frontend.' } },
    { upsert: true, new: true, runValidators: true }
  );
  await GroupMember.findOneAndUpdate(
    { groupId: group._id, userId: user._id },
    { $set: { status: 'ACTIVE', joinedAt: new Date() } },
    { upsert: true, new: true, runValidators: true }
  );
  await GroupTask.findOneAndUpdate(
    { groupId: group._id, title: 'Chuẩn bị ví dụ minh họa' },
    {
      $set: {
        createdBy: user._id,
        assigneeId: user._id,
        description: 'Nhiệm vụ nhóm mẫu.',
        dueAt: new Date(Date.now() + 3 * 86400000),
        status: 'IN_PROGRESS',
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Demo data ready for ${email}.`);
  console.log('Use this seed only in a local development database.');
} catch (error) {
  console.error(`Database seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
