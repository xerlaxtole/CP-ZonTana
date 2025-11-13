import express from 'express';

import {
  createGroupChatRoom,
  getAllGroupChatRooms,
  getGroupChatRoomsOfUser,
  joinGroupChatRoom,
  getGroupChatRoomById,
} from '../controllers/groupChatRoom.js';

import { createGroupMessage, getGroupMessages } from '../controllers/groupChatMessage.js';

const router = express.Router();

// Group chat room routes
router.post('/', createGroupChatRoom);
router.get('/all', getAllGroupChatRooms);
router.get('/user/:username', getGroupChatRoomsOfUser);
router.post('/:groupName/join', joinGroupChatRoom);
router.get('/:groupName', getGroupChatRoomById);

// Group message routes
router.post('/message', createGroupMessage);
router.get('/:groupName/messages', getGroupMessages);

export default router;
