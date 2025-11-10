import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Load environment variables FIRST before any other imports
// Specify the path to .env file relative to this file's location
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import authRoutes from "./routes/auth.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";

const app = express();

// Trust Railway's proxy for proper WebSocket handling
app.set('trust proxy', 1);

app.use(
	cors({
		origin: [
			"https://cp-zontana-production.up.railway.app",
			"http://localhost:3000",
		],
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Auth routes (no token verification needed)
app.use("/api/auth", authRoutes);

// Protected routes (token verification required)
app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
	cors: {
		origin: [
			"https://cp-zontana-production.up.railway.app",
			"http://localhost:3000",
		],
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

io.on("connection", (socket) => {
	global.chatSocket = socket;

	socket.on("addUser", (userId) => {
		onlineUsers.set(userId, socket.id);
		socket.emit("getUsers", Array.from(onlineUsers));
	});

	socket.on(
		"sendMessage",
		({ senderId, receiverId, message, chatRoomId }) => {
			const sendUserSocket = onlineUsers.get(receiverId);
			if (sendUserSocket) {
				socket.to(sendUserSocket).emit("getMessage", {
					senderId,
					message,
					chatRoomId,
				});
			}
		}
	);

	socket.on("disconnect", () => {
		onlineUsers.delete(getKey(onlineUsers, socket.id));
		socket.emit("getUsers", Array.from(onlineUsers));
	});
});
