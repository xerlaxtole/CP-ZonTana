import { useState, useEffect, useRef } from 'react';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/solid';

import { useChat } from '../../contexts/ChatContext';

import Message from './Message';
import ChatForm from './ChatForm';
import GroupMembersSidebar from './GroupMembersSidebar';

export default function GroupChatRoom({ chatRoom }) {
  const { currentUser, socket, allUsers, isUserOnline, isSocketConnected } = useChat();
  const [messages, setMessages] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [memberCount, setMemberCount] = useState(chatRoom?.members?.length || 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef();

  // Helper function to get user avatar by username
  const getUserAvatar = (username) => {
    const user = allUsers?.find((u) => u.username === username);
    return user?.avatar || '';
  };

  // Join/leave socket group and load messages when chatRoom changes
  useEffect(() => {
    if (!socket || !chatRoom || !isSocketConnected) return;

    // Clear previous messages when switching groups
    setMessages([]);
    setIncomingMessages([]);

    // Join the group
    socket.emit('join-group', { groupName: chatRoom.name });

    // Load messages via socket
    socket.emit('loadGroupMessages', { groupName: chatRoom.name }, (response) => {
      if (response.success) {
        setMessages(response.messages);
      } else {
        console.error('Failed to load group messages:', response.error);
      }
    });

    // Leave group on cleanup
    return () => {
      socket.emit('leave-group', { groupName: chatRoom.name });
    };
  }, [socket, chatRoom, isSocketConnected]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!socket || !chatRoom) return;

    const handleReceiveMessage = (data) => {
      const { groupName, sender, message, imageUrl, _id, createdAt, isSystemMessage } = data;

      // Only add if it's for this group
      if (groupName !== chatRoom.name) return;

      const incomingMessage = {
        _id,
        sender,
        message,
        imageUrl,
        createdAt,
        isSystemMessage,
      };
      setIncomingMessages((prev) => [...prev, incomingMessage]);
    };

    socket.on('receiveGroupMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveGroupMessage', handleReceiveMessage);
    };
  }, [socket, chatRoom]);

  useEffect(() => {
    if (incomingMessages.length > 0) {
      setMessages((prev) => [...prev, ...incomingMessages]);
      setIncomingMessages([]);
    }
  }, [incomingMessages]);

  // Listen for user joined events to update member count
  useEffect(() => {
    if (!socket || !chatRoom) return;

    const handleUserJoined = (data) => {
      if (data.groupName === chatRoom.name) {
        setMemberCount(data.memberCount);
      }
    };

    socket.on('userJoinedGroup', handleUserJoined);

    return () => {
      socket.off('userJoinedGroup', handleUserJoined);
    };
  }, [socket, chatRoom]);

  const handleFormSubmit = async (message, imageUrl) => {
    if (!socket || !currentUser || !chatRoom) return;

    socket.emit(
      'sendGroupMessage',
      {
        groupName: chatRoom.name,
        sender: currentUser.username,
        message,
        imageUrl,
      },
      (response) => {
        if (response.success) {
          // Message saved and will be received via 'receiveGroupMessage' listener
          // No need to update state here as the socket listener will handle it
        } else {
          console.error('Failed to send group message:', response.error);
          alert('Failed to send message. Please try again.');
        }
      },
    );
  };

  // Prevent errors on refresh when chatRoom is not yet loaded
  if (!chatRoom) return null;

  return (
    <div className="lg:col-span-2 lg:block bg-white dark:bg-gray-700 dark:border-gray-ng-pink-500 ">
      <div className="w-full">
        {/* Group Header */}
        <div className="p-3 bg-pink-50 border-b border-pink-200 dark:bg-pink-900 dark:border-pink-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img className="w-12 h-12 rounded-full" src={chatRoom.avatar} alt={chatRoom.name} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chatRoom.name}
                </h3>
                <UserGroupIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {memberCount} member
                {memberCount !== 1 ? 's' : ''} •{' '}
                {chatRoom.members?.filter((member) => isUserOnline(member)).length || 0} online
                {chatRoom.description && ` • ${chatRoom.description}`}
              </p>
            </div>
            {/* Members sidebar button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 transition"
              title="View members"
            >
              <UsersIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Members</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="relative w-full p-6 overflow-y-auto h-[43rem] bg-white  border-pink-200 dark:bg-gray-700 dark:border-pink-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message
                  message={message}
                  isGroupChat={true}
                  senderAvatar={getUserAvatar(message.sender)}
                />
              </div>
            ))}
          </ul>
        </div>

        {/* Message Input */}
        <div className="mb-4">
        <ChatForm handleFormSubmit={handleFormSubmit} />
        </div>
      </div>

      {/* Members Sidebar */}
      <GroupMembersSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        members={chatRoom.members}
        allUsers={allUsers}
        isUserOnline={isUserOnline}
      />
    </div>
  );
}
