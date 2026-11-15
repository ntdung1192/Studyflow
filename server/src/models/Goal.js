import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: null },
    dueAt: { type: Date, default: null },
    progress: { type: Number, min: 0, max: 100, default: 0, required: true },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE', required: true },
  },
  { timestamps: true, collection: 'goals' },
);

goalSchema.index({ ownerId: 1, status: 1 });
goalSchema.pre('validate', function syncStatusFromProgress() {
  this.status = this.progress === 100 ? 'COMPLETED' : 'ACTIVE';
});

export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
