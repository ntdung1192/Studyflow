import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: null },
    dueAt: { type: Date, required: true },
    estimatedMinutes: {
      type: Number,
      min: 15,
      max: 480,
      default: 60,
      required: true,
      validate: Number.isInteger,
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
      required: true,
    },
  },
  { timestamps: true, collection: 'tasks' },
);

taskSchema.index({ ownerId: 1, dueAt: 1 });
taskSchema.index({ ownerId: 1, status: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
