import ChatRoom from '../models/ChatRoom.js';

export const createChatRoom = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if chatroom already exists between these two users
    const existingChatRoom = await ChatRoom.findOne({
      members: { $all: [senderId, receiverId] },
    });

    // If chatroom exists, return it instead of creating a new one
    if (existingChatRoom) {
      return res.status(200).json(existingChatRoom);
    }

    // Create new chatroom if it doesn't exist
    const newChatRoom = new ChatRoom({
      members: [senderId, receiverId],
    });

    await newChatRoom.save();
    res.status(201).json(newChatRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getChatRoomOfUser = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getChatRoomOfUsers = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: {
        $all: [req.params.firstUserId, req.params.secondUserId],
      },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};
