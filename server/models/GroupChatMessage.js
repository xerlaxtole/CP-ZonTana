import mongoose from 'mongoose';

const GroupChatMessageSchema = mongoose.Schema(
  {
    groupName: String,
    // username of the sender
    sender: String,
    message: String,
    imageUrl: {
      type: String,
      default: null,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const GroupChatMessage = mongoose.model('GroupChatMessage', GroupChatMessageSchema);

export default GroupChatMessage;
