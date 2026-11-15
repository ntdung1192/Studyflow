import mongoose from 'mongoose';

const groupTaskSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: null },
    dueAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
      required: true,
    },
  },
  { timestamps: true, collection: 'groupTasks' },
);

groupTaskSchema.index({ groupId: 1, dueAt: 1 });
groupTaskSchema.index({ assigneeId: 1, status: 1 });

export const GroupTask = mongoose.models.GroupTask || mongoose.model('GroupTask', groupTaskSchema);
