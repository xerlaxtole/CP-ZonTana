import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
	getAllUsers,
	getChatRooms,
	getAllGroupChatRooms,
	getGroupChatRoomsOfUser,
	getUser,
} from "../services/ChatService";
import { socket } from "../socket";

const ChatContext = createContext();

export const useChat = () => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error("useChat must be used within a ChatProvider");
	}
	return context;
};

export const ChatProvider = ({ children }) => {
	const { currentUser } = useAuth();

	// Socket connection state
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [socketError, setSocketError] = useState(null);

	// Online status (mirrors server's global.onlineUsers)
	const [onlineUsersIds, setOnlineUsersIds] = useState([]);

	// Users & Direct Chats
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [chatRooms, setChatRooms] = useState([]);
	const [filteredRooms, setFilteredRooms] = useState([]);

	// Current chat state
	const [currentChat, setCurrentChat] = useState(null);
	const [chatType, setChatType] = useState("direct");

	// Groups
	const [allGroups, setAllGroups] = useState([]);
	const [myGroups, setMyGroups] = useState([]);

	// UI State
	const [activeTab, setActiveTab] = useState("direct");
	const [searchQuery, setSearchQuery] = useState("");
	const [isContact, setIsContact] = useState(false);
	const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

	// Initialize socket connection
	useEffect(() => {
		// Only initialize socket if user is authenticated
		if (!currentUser || !currentUser._id) {
			setIsSocketConnected(false);
			setSocketError("User not authenticated");
			return;
		}

		socket.connect();

		// Connection successful
		socket.on("connect", () => {
			console.log("ChatContext: Socket connected");
			setIsSocketConnected(true);
			setSocketError(null);

			// Add user to online users (mirrors server's addUser event)
			socket.emit("addUser", currentUser._id);
		});

		// Connection error
		socket.on("connect_error", (error) => {
			console.error(
				"ChatContext: Socket connection error:",
				error.message
			);
			setIsSocketConnected(false);
			setSocketError(error.message);

			// Log additional details for debugging
			if (error.message.includes("token")) {
				console.error(
					"ChatContext: Authentication failed - Check if JWT token is valid"
				);
			}
			if (error.message.includes("CORS")) {
				console.error(
					"ChatContext: CORS error - Check server CORS configuration"
				);
			}
		});

		// Disconnection
		socket.on("disconnect", (reason) => {
			console.log("ChatContext: Socket disconnected:", reason);
			setIsSocketConnected(false);

			if (reason === "io server disconnect") {
				// Server disconnected the socket, try to reconnect manually
				console.log(
					"ChatContext: Server disconnected - attempting to reconnect"
				);
				socket.connect();
			}
		});

		// Listen for online users update (mirrors server's global.onlineUsers)
		socket.on("getUsers", async (newlyOnlineUsers) => {
			// console.log("ChatContext: Online users updated:", newlyOnlineUsers);
			setOnlineUsersIds(newlyOnlineUsers);
		});

		// Listen for incoming direct messages
		socket.on("getMessage", (data) => {
			// Message will be handled by ChatRoom component
			// This is just to update the chat rooms list if needed
		});

		// Listen for incoming group messages
		socket.on("getGroupMessage", (data) => {
			// Message will be handled by GroupChatRoom component
		});

		socket.on("refreshChatRooms", async (userId) => {
			console.log(
				"Receive refreshChatRooms event from: ",
				userId,
				" to ",
				currentUser._id
			);
			if (userId === currentUser._id) return;
			await fetchChatRooms();
		});

		return () => {
			socket.off("connect");
			socket.off("connect_error");
			socket.off("disconnect");
			socket.off("getUsers");
			socket.off("getMessage");
			socket.off("getGroupMessage");
			socket.off("refreshChatRooms");

			socket.disconnect();
			console.log("ChatContext: Socket disconnected on cleanup");
		};
	}, [currentUser]);

	// Fetch users on mount
	useEffect(() => {
		if (currentUser) {
			fetchUsers();
			fetchChatRooms();
			fetchGroups();
		}
	}, [currentUser, onlineUsersIds]);

	// Filter users based on search query
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredUsers(users);
		} else {
			const filtered = users.filter((user) =>
				user.username.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredUsers(filtered);
		}
	}, [searchQuery, users]);

	// Filter chat rooms based on search query
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredRooms(chatRooms);
		} else {
			const filtered = chatRooms.filter((room) => {
				const otherMemberId = room.members.find(
					(mId) => mId !== currentUser._id
				);
				const otherMember = users.find((u) => u._id === otherMemberId);
				return otherMember?.username
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
			});
			setFilteredRooms(filtered);
		}
	}, [searchQuery, chatRooms, currentUser]);

	// Fetch all users
	const fetchUsers = async () => {
		try {
			const data = await getAllUsers();
			setUsers(data);
			setFilteredUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	// Fetch chat rooms
	const fetchChatRooms = async () => {
		try {
			const data = await getChatRooms(currentUser._id);
			setChatRooms(data);
			setFilteredRooms(data);
		} catch (error) {
			console.error("Error fetching chat rooms:", error);
		}
	};

	// Fetch groups
	const fetchGroups = async () => {
		try {
			const [allGroupsRes, myGroupsRes] = await Promise.all([
				getAllGroupChatRooms(),
				getGroupChatRoomsOfUser(currentUser._id),
			]);
			setAllGroups(allGroupsRes);
			setMyGroups(myGroupsRes);
		} catch (error) {
			console.error("Error fetching groups:", error);
		}
	};

	// Send direct message (mirrors server's sendMessage event)
	const sendMessage = (receiverId, messageData) => {
		if (socket) {
			socket.emit("sendMessage", {
				senderId: currentUser._id,
				receiverId,
				...messageData,
			});
		}
	};

	// Send group message (mirrors server's sendGroupMessage event)
	const sendGroupMessage = (groupId, members, messageData) => {
		if (socket) {
			socket.emit("sendGroupMessage", {
				senderId: currentUser._id,
				groupId,
				members,
				...messageData,
			});
		}
	};

	// Handle chat selection
	const handleChatSelect = (chat, type) => {
		setCurrentChat(chat);
		setChatType(type);
	};

	// Refresh groups (after creating/joining)
	const refreshGroups = async () => {
		await fetchGroups();
	};

	// Refresh chat rooms (after sending first message)
	const refreshChatRooms = async () => {
		await fetchChatRooms();
		socket.emit("refreshChatRooms", currentUser._id);
		console.log("Emitted refreshChatRooms event from: ", currentUser._id);
	};

	// Check if user is online
	const isUserOnline = (userId) => {
		return onlineUsersIds.includes(userId);
	};

	const value = {
		// Socket
		socket,
		isSocketConnected,
		socketError,

		// Online status
		onlineUsersId: onlineUsersIds,
		isUserOnline,

		// Users & Direct Chats
		users,
		filteredUsers,
		chatRooms,
		filteredRooms,

		// Current chat
		currentChat,
		chatType,
		setCurrentChat: handleChatSelect,

		// Groups
		allGroups,
		myGroups,
		refreshGroups,

		// UI State
		activeTab,
		setActiveTab,
		searchQuery,
		setSearchQuery,
		isContact,
		setIsContact,
		isCreateGroupModalOpen,
		setIsCreateGroupModalOpen,

		// Actions
		sendMessage,
		sendGroupMessage,
		fetchUsers,
		fetchChatRooms,
		refreshChatRooms,
		fetchGroups,
	};

	return (
		<ChatContext.Provider value={value}>{children}</ChatContext.Provider>
	);
};
