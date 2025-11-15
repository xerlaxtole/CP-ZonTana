import { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import UserLayout from '../layouts/UserLayout';
import SearchUsers from './SearchUsers';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export default function GlobalChatList() {
  const { currentUser, socket, allUsers, isUserOnline } = useChat();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(true);
  const [isOfflineUsersOpen, setIsOfflineUsersOpen] = useState(false);

  const refreshUsersAndChats = useCallback(async () => {
    if (!currentUser || !socket) return;

    // Filter out current user in chat rooms
    const filteredUsers = allUsers.filter((user) => user.username !== currentUser.username);

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

    const onlineU = usersToSort.filter((user) => isUserOnline(user.username) === true);

    setOnlineUsers(onlineU);

    const offlineU = usersToSort.filter((user) => isUserOnline(user.username) === false);

    setOfflineUsers(offlineU);
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

  return (
    <>
      <SearchUsers handleSearch={(searchTerm) => setSearchTerm(searchTerm)} />
      <ul className="overflow-auto h-[45rem]">
        {isOnlineUsersOpen ? (
          <>
            <h2
              className="my-2 mb-2 ml-2 text-pink-600 dark:text-white flex items-center space-x-1"
              onClick={() => setIsOnlineUsersOpen(false)}
            >
              <span>Online Users ({onlineUsers.length})</span>
              <ChevronUpIcon className="h-5 w-5 ml-1" />
            </h2>
            <li>
              {onlineUsers.map((onlineUser, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer"
                >
                  <UserLayout user={onlineUser} />
                </div>
              ))}
            </li>
          </>
        ) : (
          <h2
            className="my-2 mb-2 ml-2 text-pink-600 dark:text-white flex items-center space-x-1"
            onClick={() => setIsOnlineUsersOpen(true)}
          >
            <span>Online Users ({onlineUsers.length})</span>{' '}
            <ChevronDownIcon className="h-5 w-5 ml-1" />
          </h2>
        )}

        {isOfflineUsersOpen ? (
          <>
            <h2
              className="my-2 mb-2 ml-2 text-pink-600 dark:text-white flex items-center space-x-1"
              onClick={() => setIsOfflineUsersOpen(false)}
            >
              <span>Offline Users ({offlineUsers.length})</span>
              <ChevronUpIcon className="h-5 w-5 ml-1" />
            </h2>
            <li>
              {offlineUsers.map((offlineUser, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer"
                >
                  <UserLayout user={offlineUser} />
                </div>
              ))}
            </li>
          </>
        ) : (
          <h2
            className="my-2 mb-2 ml-2 text-pink-600 dark:text-white flex items-center space-x-1"
            onClick={() => setIsOfflineUsersOpen(true)}
          >
            <span>Offline Users ({offlineUsers.length})</span>
            <ChevronDownIcon className="h-5 w-5 ml-1" />
          </h2>
        )}
      </ul>
    </>
  );
}
