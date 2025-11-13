import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getRandomAvatar } from '../utils/avatars.js';

// Unified login/register endpoint
// If username exists -> login, else -> create new user and login
export const login = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Check if user exists
    let user = await User.findOne({ username: trimmedUsername });

    // If user doesn't exist, create new user
    if (!user) {
      const randomAvatar = getRandomAvatar();
      user = new User({
        username: trimmedUsername,
        avatar: randomAvatar,
      });
      await user.save();

      // Notify all connected clients about the new user
      if (global.io) {
        global.io.emit('new:user');
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Return user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Logout endpoint
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get current user endpoint
export const me = async (req, res) => {
  try {
    // User info is already attached to req.user by VerifyToken middleware
    const user = await User.findById(req.user.id).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
