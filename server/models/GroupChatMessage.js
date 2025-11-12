import mongoose from 'mongoose';

const GroupChatMessageSchema = mongoose.Schema(
  {
    groupChatRoomId: String,
    sender: String,
    message: String,
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const GroupChatMessage = mongoose.model('GroupChatMessage', GroupChatMessageSchema);

export default GroupChatMessage;
