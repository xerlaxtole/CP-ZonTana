import { useState, useEffect, useCallback } from 'react';
import { getChatRooms } from '../../services/ChatService';
import { useChat } from '../../contexts/ChatContext';
import Contact from './Contact';
import UserLayout from '../layouts/UserLayout';
import SearchUsers from './SearchUsers';

export default function AllUsers({ onChangeChat }) {
  const { currentUser, socket, allUsers, isUserOnline } = useChat();
  const [, setSelectedChat] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [myChatRooms, setMyChatRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshUsersAndChats = useCallback(async () => {
    if (!currentUser || !socket) return;

    // Fetch my chat rooms
    const chatRooms = await getChatRooms(currentUser.username);
    setMyChatRooms(chatRooms);

    // Get all usernames from chat room members
    const usersInChatRooms = new Set();
    chatRooms.forEach((chatRoom) => {
      if (chatRoom.members) {
        chatRoom.members.forEach((member) => {
          usersInChatRooms.add(member);
        });
      }
    });

    // Filter out current user and users already in chat rooms
    const filteredUsers = allUsers.filter(
      (user) => user.username !== currentUser.username && !usersInChatRooms.has(user.username),
    );

    // Apply search filter
    let usersToSort;
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      usersToSort = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(searchLower),
      );
    } else {
      usersToSort = filteredUsers;
    }

    // Sort: online users first, then alphabetically
    const sortedUsers = usersToSort.sort((a, b) => {
      const aOnline = isUserOnline(a.username);
      const bOnline = isUserOnline(b.username);

      // If online status differs, online comes first
      if (aOnline !== bOnline) return bOnline ? 1 : -1;

      // Same online status, sort alphabetically
      return a.username.localeCompare(b.username);
    });

    setOtherUsers(sortedUsers);
  }, [currentUser, socket, allUsers, searchTerm, isUserOnline]);

  // Initial fetch and refresh on dependencies change
  useEffect(() => {
    refreshUsersAndChats();
  }, [refreshUsersAndChats]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Listen for new chat room events
    socket.on(`new:${currentUser.username}:chat-room`, refreshUsersAndChats);

    return () => {
      socket.off(`new:${currentUser.username}:chat-room`);
    };
  }, [socket, currentUser, refreshUsersAndChats]);

  const handleNewChatRoom = async (otherUser) => {
    if (!socket || !currentUser) return;

    socket.emit(
      'createChatRoom',
      {
        senderId: currentUser.username,
        receiverId: otherUser.username,
      },
      (response) => {
        if (response.success) {
          const chatRoom = response.chatRoom;

          // Update local state
          setMyChatRooms((prev) => {
            // Check if chat room already exists in list
            const exists = prev.some((room) => room._id === chatRoom._id);
            if (exists) return prev;
            return [...prev, chatRoom];
          });

          // Notify other user
          socket.emit('notifyChatRoomCreated', {
            receiverId: otherUser.username,
          });

          // Select the new chat
          const chatRoomIndex = myChatRooms.findIndex((room) => room._id === chatRoom._id);
          const indexToSelect = chatRoomIndex !== -1 ? chatRoomIndex : myChatRooms.length;
          setSelectedChat(indexToSelect);
          onChangeChat(chatRoom);

          // Refresh users and chats to move user from "Other Users" to "Chats"
          refreshUsersAndChats();
        } else {
          console.error('Failed to create chat room:', response.error);
          alert('Failed to create chat room. Please try again.');
        }
      },
    );
  };

  const handleSelectChat = (index) => {
    setSelectedChat(index);
    const selectedChatRoom = myChatRooms[index] || null;
    onChangeChat(selectedChatRoom);
  };

  return (
    <>
      <SearchUsers handleSearch={(searchTerm) => setSearchTerm(searchTerm)} />
      <ul className="overflow-auto h-[45rem]">
        <h2 className="my-2 mb-2 ml-2 text-pink-600 dark:text-white">Chats</h2>
        <li>
          {myChatRooms.map((chatRoom, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer"
              onClick={() => handleSelectChat(index)}
            >
              <Contact chatRoom={chatRoom} />
            </div>
          ))}
        </li>
        <h2 className="my-2 mb-2 ml-2 text-pink-600 dark:text-white">Other Users</h2>
        <li>
          {otherUsers.map((otherUser, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer"
              onClick={() => handleNewChatRoom(otherUser)}
            >
              <UserLayout user={otherUser} />
            </div>
          ))}
        </li>
      </ul>
    </>
  );
}
