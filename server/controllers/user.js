import User from '../models/User.js';
import { isValidAvatar } from '../utils/avatars.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    // Validate avatar URL is in our allowed collection
    if (!avatar || !isValidAvatar(avatar)) {
      return res.status(400).json({ message: 'Invalid avatar selection' });
    }

    // Update user's avatar
    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true }).select(
      'username avatar',
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
