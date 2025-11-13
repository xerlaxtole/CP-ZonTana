import mongoose from 'mongoose';

const ChatMessageSchema = mongoose.Schema(
  {
    // value is ChatRoom._id (mongo ObjectId as string)
    chatRoomId: String,
    // sender is username
    sender: String,
    // message content
    message: String,
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
