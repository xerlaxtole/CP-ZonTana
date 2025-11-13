import GroupChatMessage from '../models/GroupChatMessage.js';
import GroupChatRoom from '../models/GroupChatRoom.js';

export const createGroupMessage = async (req, res) => {
  const { groupName, sender, message } = req.body;

  try {
    // Verify that the sender is a member of the group
    const groupChatRoom = await GroupChatRoom.findOne({ name: groupName });

    if (!groupChatRoom) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!groupChatRoom.members.includes(sender)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const newMessage = new GroupChatMessage(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getGroupMessages = async (req, res) => {
  const { groupName } = req.params;

  try {
    // Verify that the requester is a member of the group
    const groupChatRoom = await GroupChatRoom.findOne({ name: groupName });

    if (!groupChatRoom) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Get the user from the verified token
    const userId = req.user.username;

    if (!groupChatRoom.members.includes(userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const messages = await GroupChatMessage.find({
      groupName,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};
