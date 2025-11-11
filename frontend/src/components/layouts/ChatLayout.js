import { useEffect, useRef, useState } from "react";
import { ChatIcon, UserGroupIcon } from "@heroicons/react/outline";

import {
	getAllUsers,
	getChatRooms,
	initiateSocketConnection,
	getAllGroupChatRooms,
	getGroupChatRoomsOfUser,
	createGroupChatRoom,
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import GroupChatRoom from "../chat/GroupChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";
import GroupChatList from "../chat/GroupChatList";
import SearchUsers from "../chat/SearchUsers";
import CreateGroupModal from "../chat/CreateGroupModal";

export default function ChatLayout() {
	const [users, SetUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [chatRooms, setChatRooms] = useState([]);
	const [filteredRooms, setFilteredRooms] = useState([]);

	const [currentChat, setCurrentChat] = useState();
	const [onlineUsersId, setonlineUsersId] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");

	const [isContact, setIsContact] = useState(false);

	// Group chat state
	const [activeTab, setActiveTab] = useState("direct"); // "direct" or "groups"
	const [allGroups, setAllGroups] = useState([]);
	const [myGroups, setMyGroups] = useState([]);
	const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
	const [chatType, setChatType] = useState("direct"); // Track if current chat is "direct" or "group"

	const socket = useRef();

	const { currentUser } = useAuth();

  useEffect(() => {
    const getSocket = () => {
      const res = initiateSocketConnection();
      socket.current = res;
      socket.current.emit("addUser", currentUser.username);
      socket.current.on("getUsers", (users) => {
        const userId = users.map((u) => u[0]);
        setonlineUsersId(userId);
      });
    };

    getSocket();
  }, [currentUser.username]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getChatRooms(currentUser.username);
      setChatRooms(res);
    };

    fetchData();
  }, [currentUser.username]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await getAllUsers();
			SetUsers(res);
		};

		fetchData();
	}, []);

	// Fetch all groups and user's groups
	useEffect(() => {
		const fetchGroups = async () => {
			const allGroupsRes = await getAllGroupChatRooms();
			const myGroupsRes = await getGroupChatRoomsOfUser(currentUser.username);
			setAllGroups(allGroupsRes || []);
			setMyGroups(myGroupsRes || []);
		};

		if (activeTab === "groups") {
			fetchGroups();
		}
	}, [activeTab, currentUser.username]);

	const refreshGroups = async () => {
		const allGroupsRes = await getAllGroupChatRooms();
		const myGroupsRes = await getGroupChatRoomsOfUser(currentUser.username);
		setAllGroups(allGroupsRes || []);
		setMyGroups(myGroupsRes || []);
	};

  useEffect(() => {
    setFilteredUsers(users);
    setFilteredRooms(chatRooms);
  }, [users, chatRooms]);

  useEffect(() => {
    if (isContact) {
      setFilteredUsers([]);
    } else {
      setFilteredRooms([]);
    }
  }, [isContact]);

	const handleChatChange = (chat) => {
		setCurrentChat(chat);
		setChatType("direct");
	};

	const handleGroupChatChange = (chat) => {
		setCurrentChat(chat);
		setChatType("group");
	};

	const handleCreateGroup = async (groupData) => {
		await createGroupChatRoom(groupData);
		await refreshGroups();
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentChat(undefined); // Clear current chat when switching tabs
		setSearchQuery(""); // Clear search
	};

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);

    const searchedUsers = users.filter((user) => {
      return user.username
        .toLowerCase()
        .includes(newSearchQuery.toLowerCase());
    });

    const searchedUsersId = searchedUsers.map((u) => u.username);

    // If there are initial contacts
    if (chatRooms.length !== 0) {
      chatRooms.forEach((chatRoom) => {
        // Check if searched user is a contact or not.
        const isUserContact = chatRoom.members.some(
          (e) => e !== currentUser.username && searchedUsersId.includes(e)
        );
        setIsContact(isUserContact);

        isUserContact
          ? setFilteredRooms([chatRoom])
          : setFilteredUsers(searchedUsers);
      });
    } else {
      setFilteredUsers(searchedUsers);
    }
  };

	return (
		<div className="container mx-auto">
			<div className="min-w-full bg-white border-x border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded lg:grid lg:grid-cols-3">
				<div className="bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:col-span-1">
					{/* Tabs */}
					<div className="flex border-b border-gray-200 dark:border-gray-700">
						<button
							onClick={() => handleTabChange("direct")}
							className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
								activeTab === "direct"
									? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							}`}
						>
							<ChatIcon className="w-5 h-5" />
							Direct Messages
						</button>
						<button
							onClick={() => handleTabChange("groups")}
							className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
								activeTab === "groups"
									? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							}`}
						>
							<UserGroupIcon className="w-5 h-5" />
							Groups
						</button>
					</div>

					{activeTab === "direct" ? (
						<>
							<SearchUsers handleSearch={handleSearch} />
							<AllUsers
								users={searchQuery !== "" ? filteredUsers : users}
								chatRooms={searchQuery !== "" ? filteredRooms : chatRooms}
								setChatRooms={setChatRooms}
								onlineUsersId={onlineUsersId}
								currentUser={currentUser}
								changeChat={handleChatChange}
							/>
						</>
					) : (
						<GroupChatList
							allGroups={allGroups}
							myGroups={myGroups}
							currentUser={currentUser}
							changeChat={handleGroupChatChange}
							onCreateGroupClick={() => setIsCreateGroupModalOpen(true)}
							refreshGroups={refreshGroups}
						/>
					)}
				</div>

				{currentChat ? (
					chatType === "group" ? (
						<GroupChatRoom
							currentChat={currentChat}
							currentUser={currentUser}
							socket={socket}
						/>
					) : (
						<ChatRoom
							currentChat={currentChat}
							currentUser={currentUser}
							socket={socket}
						/>
					)
				) : (
					<Welcome />
				)}
			</div>

			<CreateGroupModal
				isOpen={isCreateGroupModalOpen}
				onClose={() => setIsCreateGroupModalOpen(false)}
				onCreateGroup={handleCreateGroup}
				currentUser={currentUser}
			/>
		</div>
	);
}
