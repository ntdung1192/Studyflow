import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: { type: Number, min: 1, max: 7, required: true, validate: Number.isInteger },
    startMinute: { type: Number, min: 0, max: 1439, required: true, validate: Number.isInteger },
    endMinute: { type: Number, min: 1, max: 1440, required: true, validate: Number.isInteger },
  },
  { timestamps: true, collection: 'availability' }
);

availabilitySchema.pre('validate', function validateWindow() {
  if (this.endMinute <= this.startMinute) {
    this.invalidate('endMinute', 'endMinute must be later than startMinute.');
  }
});

availabilitySchema.index({ ownerId: 1, dayOfWeek: 1, startMinute: 1 });

export const Availability =
  mongoose.models.Availability || mongoose.model('Availability', availabilitySchema);
