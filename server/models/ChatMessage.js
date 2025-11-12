import mongoose from 'mongoose';

const ChatMessageSchema = mongoose.Schema(
  {
    chatRoomId: String,
    sender: String,
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
