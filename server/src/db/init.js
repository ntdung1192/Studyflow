import { connectDatabase, disconnectDatabase } from './connection.js';
import { Goal } from '../models/Goal.js';
import { GroupMember } from '../models/GroupMember.js';
import { GroupTask } from '../models/GroupTask.js';
import { Schedule } from '../models/Schedule.js';
import { StudyGroup } from '../models/StudyGroup.js';
import { Subject } from '../models/Subject.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

const models = [User, Subject, Task, Schedule, Goal, StudyGroup, GroupMember, GroupTask];

try {
  const connection = await connectDatabase();

  for (const model of models) {
    try {
      await model.createCollection();
    } catch (error) {
      if (error.codeName !== 'NamespaceExists') throw error;
    }

    await model.createIndexes();
    console.log(`Ready: ${model.collection.collectionName}`);
  }

  console.log(`Database initialized: ${connection.name}`);
} catch (error) {
  console.error(`Database initialization failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
