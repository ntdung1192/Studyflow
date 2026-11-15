import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: null },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'studyGroups' },
);

studyGroupSchema.index({ ownerId: 1, createdAt: -1 });

export const StudyGroup = mongoose.models.StudyGroup || mongoose.model('StudyGroup', studyGroupSchema);
