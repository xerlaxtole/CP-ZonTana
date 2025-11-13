import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Load environment variables FIRST before any other imports
// Specify the path to .env file relative to this file's location
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import './config/mongo.js';

import { VerifyToken, VerifySocketToken } from './middlewares/VerifyToken.js';
import authRoutes from './routes/auth.js';
import chatRoomRoutes from './routes/chatRoom.js';
import chatMessageRoutes from './routes/chatMessage.js';
import userRoutes from './routes/user.js';
import groupRoutes from './routes/group.js';
import GroupChatRoom from './models/GroupChatRoom.js';
import GroupChatMessage from './models/GroupChatMessage.js';
import ChatMessage from './models/ChatMessage.js';
import ChatRoom from './models/ChatRoom.js';

const app = express();

// Trust Railway's proxy for proper WebSocket handling
app.set('trust proxy', 1);

app.use(
  cors({
    origin: ['https://cp-zontana-production.up.railway.app', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Auth routes (no token verification needed)
app.use('/api/auth', authRoutes);

// Protected routes (token verification required)
app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use('/api/room', chatRoomRoutes);
app.use('/api/message', chatMessageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/group', groupRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: ['https://cp-zontana-production.up.railway.app', 'http://localhost:3000'],
    credentials: true,
  },
  // Configure transports for Railway's proxy environment
  transports: ['websocket', 'polling'],
  // Connection stability settings
  pingTimeout: 60000,
  pingInterval: 25000,
  // Backward compatibility
  allowEIO3: true,
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();
global.io = io;

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // USER ONLINE STATUS
  socket.on('addUser', (username) => {
    onlineUsers.set(username, socket.id);
    console.log('User connected:', username);
    io.emit('update:online-usernames', Array.from(onlineUsers.keys()));
  });

  // ROOM MANAGEMENT - Direct Messages
  socket.on('join-room', async ({ roomId }, callback) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    if (callback) {
      callback({ success: true, roomId });
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // ROOM MANAGEMENT - Group Messages
  socket.on('join-group', async ({ groupName }) => {
    socket.join(`grp:${groupName}`);
    console.log(`Socket ${socket.id} joined group ${groupName}`);
  });

  socket.on('leave-group', ({ groupName }) => {
    socket.leave(`grp:${groupName}`);
    console.log(`Socket ${socket.id} left group ${groupName}`);
  });

  // CREATE CHAT ROOM
  socket.on('createChatRoom', async ({ senderId, receiverId }, callback) => {
    try {
      // Check if chatroom already exists
      const existingChatRoom = await ChatRoom.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (existingChatRoom) {
        return callback({ success: true, chatRoom: existingChatRoom });
      }

      // Create new chatroom
      const newChatRoom = new ChatRoom({
        members: [senderId, receiverId],
      });
      await newChatRoom.save();

      callback({ success: true, chatRoom: newChatRoom });
    } catch (error) {
      console.error('Error creating chat room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // NOTIFY CHAT ROOM CREATED
  socket.on('notifyChatRoomCreated', ({ receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit(`new:${receiverId}:chat-room`);
    }
  });

  // SEND DIRECT MESSAGE
  socket.on('sendDirectMessage', async ({ chatRoomId, sender, message, imageUrl }, callback) => {
    try {
      // Save message to database
      const newMessage = new ChatMessage({
        chatRoomId,
        sender,
        message,
        imageUrl,
      });
      await newMessage.save();

      // Broadcast to room (including sender)
      io.to(chatRoomId).emit('receiveDirectMessage', {
        _id: newMessage._id,
        chatRoomId: newMessage.chatRoomId,
        sender: newMessage.sender,
        message: newMessage.message,
        imageUrl: newMessage.imageUrl,
        createdAt: newMessage.createdAt,
      });

      // Acknowledge to sender
      callback({ success: true, message: newMessage });
    } catch (error) {
      console.error('Error sending direct message:', error);
      callback({ success: false, error: error.message });
    }
  });

  // LOAD DIRECT MESSAGES
  socket.on('loadMessages', async ({ chatRoomId }, callback) => {
    try {
      const messages = await ChatMessage.find({ chatRoomId }).sort({ createdAt: 1 });
      callback({ success: true, messages });
    } catch (error) {
      console.error('Error loading messages:', error);
      callback({ success: false, error: error.message });
    }
  });

  // CREATE GROUP
  socket.on('createGroup', async ({ name, description, createdBy }, callback) => {
    try {
      const newGroupChatRoom = new GroupChatRoom({
        name,
        description: description || '',
        members: [createdBy],
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      });
      await newGroupChatRoom.save();

      // Broadcast to all users except the creator (new group available)
      socket.broadcast.emit('newGroupCreated', newGroupChatRoom);

      callback({ success: true, group: newGroupChatRoom });
    } catch (error) {
      console.error('Error creating group:', error);
      callback({ success: false, error: error.message });
    }
  });

  // JOIN GROUP
  socket.on('joinGroup', async ({ groupName, username }, callback) => {
    try {
      const groupChatRoom = await GroupChatRoom.findOne({ name: groupName });
      if (!groupChatRoom) {
        return callback({ success: false, error: 'Group not found' });
      }

      // Check if already a member
      if (groupChatRoom.members.includes(username)) {
        return callback({ success: false, error: 'Already a member' });
      }

      // Add user to members
      groupChatRoom.members.push(username);
      await groupChatRoom.save();

      // Create system message for user joining
      const systemMessage = new GroupChatMessage({
        groupName,
        sender: 'System',
        message: `${username} joined ${groupName}`,
        isSystemMessage: true,
      });
      await systemMessage.save();

      // Broadcast system message to all group members
      io.to(`grp:${groupName}`).emit('receiveGroupMessage', {
        _id: systemMessage._id,
        groupName: systemMessage.groupName,
        sender: systemMessage.sender,
        message: systemMessage.message,
        imageUrl: systemMessage.imageUrl,
        isSystemMessage: systemMessage.isSystemMessage,
        createdAt: systemMessage.createdAt,
      });

      // Notify all group members about new member
      io.to(`grp:${groupName}`).emit('userJoinedGroup', {
        groupName,
        username,
        memberCount: groupChatRoom.members.length,
      });

      // Broadcast to all users for group list updates
      io.emit('groupMemberCountUpdated', {
        groupName,
        memberCount: groupChatRoom.members.length,
        members: groupChatRoom.members,
      });

      callback({ success: true, group: groupChatRoom });
    } catch (error) {
      console.error('Error joining group:', error);
      callback({ success: false, error: error.message });
    }
  });

  // SEND GROUP MESSAGE
  socket.on('sendGroupMessage', async ({ groupName, sender, message, imageUrl }, callback) => {
    try {
      // Verify sender is a member
      const room = await GroupChatRoom.findOne({ name: groupName });
      if (!room) {
        return callback({ success: false, error: 'Group not found' });
      }

      if (!room.members.includes(sender)) {
        return callback({ success: false, error: 'Not a member of this group' });
      }

      // Save message to database
      const newMessage = new GroupChatMessage({
        groupName,
        sender,
        message,
        imageUrl,
      });
      await newMessage.save();

      // Broadcast to group room (including sender)
      io.to(`grp:${groupName}`).emit('receiveGroupMessage', {
        _id: newMessage._id,
        groupName: newMessage.groupName,
        sender: newMessage.sender,
        message: newMessage.message,
        imageUrl: newMessage.imageUrl,
        createdAt: newMessage.createdAt,
      });

      // Acknowledge to sender
      callback({ success: true, message: newMessage });
    } catch (error) {
      console.error('Error sending group message:', error);
      callback({ success: false, error: error.message });
    }
  });

  // LOAD GROUP MESSAGES
  socket.on('loadGroupMessages', async ({ groupName }, callback) => {
    try {
      const messages = await GroupChatMessage.find({ groupName }).sort({ createdAt: 1 });
      callback({ success: true, messages });
    } catch (error) {
      console.error('Error loading group messages:', error);
      callback({ success: false, error: error.message });
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const username = getKey(onlineUsers, socket.id);
    console.log('User disconnected:', username);
    onlineUsers.delete(username);
    io.emit('update:online-usernames', Array.from(onlineUsers.keys()));
  });

  // LEGACY: Keep for backward compatibility (can be removed later)
  socket.on('refreshChatRooms', async (userId) => {
    for (let [uid, sockid] of onlineUsers.entries()) {
      if (uid === userId) continue;
      if (sockid) {
        socket.to(sockid).emit('refreshChatRooms', userId);
      }
    }
  });
});
