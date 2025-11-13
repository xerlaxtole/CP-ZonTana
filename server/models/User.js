import mongoose from 'mongoose';

const UserSchema = mongoose.Schema(
  {
    // a main way to identify users
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    // list of group names the user is part of
    groups: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

export default User;
