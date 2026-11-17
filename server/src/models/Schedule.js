import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    startsAt: { type: Date, required: true },
    endsAt: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startsAt || value > this.startsAt;
        },
        message: 'endsAt must be later than startsAt.',
      },
    },
    location: { type: String, trim: true, maxlength: 200, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { timestamps: true, collection: 'schedules' },
);

scheduleSchema.index({ ownerId: 1, startsAt: 1 });
scheduleSchema.index({ ownerId: 1, taskId: 1 });

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
