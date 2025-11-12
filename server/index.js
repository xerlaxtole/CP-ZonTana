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

const app = express();

// Trust Railway's proxy for proper WebSocket handling
app.set('trust proxy', 1);

app.use(
  cors({
    origin: ['https://cp-zontana-production.up.railway.app', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on('connection', (socket) => {
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('User connected:', userId);
    io.emit('getUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ senderId, receiverId, message, chatRoomId }) => {
    const sendUserSocket = onlineUsers.get(receiverId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('getMessage', {
        senderId,
        message,
        chatRoomId,
      });
    }
  });

  socket.on('sendGroupMessage', async ({ senderId, message, groupChatRoomId }) => {
    try {
      const room = await GroupChatRoom.findById(groupChatRoomId);

      if (!room) {
        return;
      }

      // Verify sender is a member
      if (!room.members.includes(senderId)) {
        return;
      }

      // Persist the message to database
      const newMessage = new GroupChatMessage({
        groupChatRoomId,
        sender: senderId,
        message,
      });
      await newMessage.save();

      // Emit to all members (including sender)
      for (const memberId of room.members) {
        const sendUserSocket = onlineUsers.get(memberId);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit('getGroupMessage', {
            senderId,
            message,
            groupChatRoomId,
          });
        }
      }
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  });

  socket.on('disconnect', () => {
    const id = getKey(onlineUsers, socket.id);
    console.log('User disconnected:', id);
    onlineUsers.delete(id);
    io.emit('getUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('refreshChatRooms', async (userId) => {
    for (let [uid, sockid] of onlineUsers.entries()) {
      if (uid === userId) continue;
      if (sockid) {
        socket.to(sockid).emit('refreshChatRooms', userId);
      }
    }
  });
});
