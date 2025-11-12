import mongoose from 'mongoose';

const GroupChatRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/shapes/svg?seed=group',
    },
    createdBy: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

const GroupChatRoom = mongoose.model('GroupChatRoom', GroupChatRoomSchema);

export default GroupChatRoom;
