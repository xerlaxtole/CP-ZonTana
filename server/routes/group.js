import express from "express";

import {
	createGroupChatRoom,
	getAllGroupChatRooms,
	getGroupChatRoomsOfUser,
	joinGroupChatRoom,
	getGroupChatRoomById,
} from "../controllers/groupChatRoom.js";

import {
	createGroupMessage,
	getGroupMessages,
} from "../controllers/groupChatMessage.js";

const router = express.Router();

// Group chat room routes
router.post("/", createGroupChatRoom);
router.get("/all", getAllGroupChatRooms);
router.get("/user/:userId", getGroupChatRoomsOfUser);
router.post("/:groupId/join", joinGroupChatRoom);
router.get("/:groupId", getGroupChatRoomById);

// Group message routes
router.post("/message", createGroupMessage);
router.get("/:groupChatRoomId/messages", getGroupMessages);

export default router;
