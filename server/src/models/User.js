import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    timeZone: { type: String, required: true, default: 'Asia/Ho_Chi_Minh' },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, collection: 'users' },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
