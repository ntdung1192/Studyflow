import mongoose from 'mongoose';

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'DECLINED', 'REMOVED', 'LEFT'],
      default: 'PENDING',
      required: true,
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    joinedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'groupMembers' },
);

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMemberSchema.index({ userId: 1, status: 1 });

export const GroupMember = mongoose.models.GroupMember || mongoose.model('GroupMember', groupMemberSchema);
