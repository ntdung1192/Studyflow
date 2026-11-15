import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, trim: true, maxlength: 40, default: null },
    description: { type: String, trim: true, maxlength: 1000, default: null },
  },
  { timestamps: true, collection: 'subjects' },
);

subjectSchema.index({ ownerId: 1, name: 1 });

export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
