import mongoose from 'mongoose';

const GroupChatRoomSchema = mongoose.Schema(
  {
    // a main way to identify group chat rooms
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/shapes/svg?seed=group',
    },
    // usernames of the participants in the group chat room
    members: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

const GroupChatRoom = mongoose.model('GroupChatRoom', GroupChatRoomSchema);

export default GroupChatRoom;
