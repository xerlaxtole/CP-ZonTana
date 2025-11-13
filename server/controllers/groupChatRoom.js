import GroupChatRoom from '../models/GroupChatRoom.js';
import User from '../models/User.js';

export const createGroupChatRoom = async (req, res) => {
  const { name, description, createdBy } = req.body;

  const newGroupChatRoom = new GroupChatRoom({
    name,
    description: description || '',
    members: [createdBy], // Creator is the first member
    avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
  });

  try {
    await newGroupChatRoom.save();
    res.status(201).json(newGroupChatRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getAllGroupChatRooms = async (req, res) => {
  try {
    const groupChatRooms = await GroupChatRoom.find().sort({
      createdAt: -1,
    });
    res.status(200).json(groupChatRooms);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getGroupChatRoomsOfUser = async (req, res) => {
  try {
    const groupChatRooms = await GroupChatRoom.find({
      members: { $in: [req.params.username] },
    }).sort({ updatedAt: -1 });
    res.status(200).json(groupChatRooms);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const joinGroupChatRoom = async (req, res) => {
  const { groupName } = req.params;
  const { userName } = req.body;

  try {
    const groupChatRoom = await GroupChatRoom.findOne({ name: groupName });
    if (!groupChatRoom) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const user = await User.findOne({
      username: userName,
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (groupChatRoom.members.includes(user.username) || user.groups.includes(groupChatRoom.name)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Add user to members
    groupChatRoom.members.push(user.username);
    await groupChatRoom.save();

    user.groups.push(groupChatRoom.name);
    await user.save();

    res.status(200).json(groupChatRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getGroupChatRoomById = async (req, res) => {
  try {
    const groupChatRoom = await GroupChatRoom.findOne({ name: req.params.groupName });
    if (!groupChatRoom) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(groupChatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};
