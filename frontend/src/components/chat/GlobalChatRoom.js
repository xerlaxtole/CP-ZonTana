import { useState, useEffect, useRef } from 'react';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/solid';
import { useChat } from '../../contexts/ChatContext';

import Message from './Message';
import ChatForm from './ChatForm';
import GroupMembersSidebar from './GroupMembersSidebar';
import { getGroupChatRoomById } from '../../services/ChatService';

// 1. REMOVED 'async' - React components must be synchronous.
export default function GlobalChatRoom() {
  const { currentUser, socket, allUsers, isUserOnline, isSocketConnected } = useChat();

  // 2. ADDED useState for chatRoom
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef();
  // 3. ADDED a ref to track if messages are loaded
  const messagesLoadedRef = useRef(false);

  const GLOBAL_ROOM = 'global';

  // 4. MOVED data fetching into a useEffect
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const roomData = await getGroupChatRoomById(GLOBAL_ROOM);
        setChatRoom(roomData);
      } catch (error) {
        console.error('Failed to fetch group info:', error);
      }
    };
    fetchGroupInfo();
  }, []); // Empty dependency array runs this once on mount

  // Helper function to get user avatar by username
  const getUserAvatar = (username) => {
    const user = allUsers?.find((u) => u.username === username);
    return user?.avatar || '';
  };

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    const handleConnect = () => {
      socket.emit('join-group', { groupName: GLOBAL_ROOM });

      // 5. CHECK if messages are already loaded before fetching
      if (!messagesLoadedRef.current) {
        socket.emit('loadGroupMessages', { groupName: GLOBAL_ROOM }, (response) => {
          if (response.success) {
            setMessages(response.messages);
            messagesLoadedRef.current = true; // Mark as loaded
          }
        });
      }
    };

    socket.on('connect', handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, isSocketConnected]); // This is correct

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      const { groupName, sender, message, imageUrl, _id, createdAt, isSystemMessage } = data;

      if (groupName !== GLOBAL_ROOM) return;

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
  }, [socket]);

  useEffect(() => {
    if (incomingMessages.length > 0) {
      setMessages((prev) => [...prev, ...incomingMessages]);
      setIncomingMessages([]);
    }
  }, [incomingMessages]);

  const handleFormSubmit = async (message, imageUrl) => {
    if (!socket || !currentUser) return;

    socket.emit(
      'sendGroupMessage',
      {
        groupName: GLOBAL_ROOM,
        sender: currentUser.username,
        message,
        imageUrl,
      },
      (response) => {
        if (response.success) {
          // ... (correct)
        } else {
          console.error('Failed to send group message:', response.error);
          alert('Failed to send message. Please try again.');
        }
      },
    );
  };

  // 6. ADDED a loading state to prevent crashes
  if (!chatRoom) {
    // You can return a loading spinner here
    return <div className="lg:col-span-2 lg:block p-6">Loading chat...</div>;
  }

  // 7. MOVED memberCount here, so it's calculated *after* chatRoom exists
  const memberCount = chatRoom?.members?.length || 0;

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
              // NOTE: Using index as a key is bad. Use message._id if it's available.
              <div key={message._id || index} ref={scrollRef}>
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
