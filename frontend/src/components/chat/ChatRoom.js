import { useState, useEffect, useRef } from 'react';
import { getMessagesOfChatRoom, sendMessage, getUser } from '../../services/ChatService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import ChatForm from './ChatForm';

export default function ChatRoom() {
  const { currentUser } = useAuth();
  const { socket, currentChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const scrollRef = useRef();

  // 🧠 Fetch messages + chat partner details
  useEffect(() => {
    const fetchData = async () => {
      if (!currentChat?._id) return;

      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res || []);

      // Identify and fetch the chat partner
      const receiverId = currentChat.members.find((id) => id !== currentUser._id);
      if (receiverId) {
        const user = await getUser(receiverId);
        setChatPartner(user);
      }
    };

    fetchData();
  }, [currentChat?._id]);

  // 🪄 Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🛰️ Handle real-time incoming messages
  useEffect(() => {
    const handleGetMessage = (data) => {
      if (data.chatRoomId === currentChat._id) {
        setIncomingMessage({
          sender: data.senderId,
          message: data.message,
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
        });
      }
    };

    socket?.on('getMessage', handleGetMessage);
    return () => socket?.off('getMessage', handleGetMessage);
  }, [socket, currentChat._id]);

  useEffect(() => {
    if (incomingMessage) setMessages((prev) => [...prev, incomingMessage]);
  }, [incomingMessage]);

  // ✉️ Send message
  const handleFormSubmit = async (message, imageUrl) => {
    const receiverId = currentChat.members.find((id) => id !== currentUser._id);

    socket?.emit('sendMessage', {
      senderId: currentUser._id,
      receiverId,
      message,
      chatRoomId: currentChat._id,
      imageUrl,
    });

    const messageBody = {
      chatRoomId: currentChat._id,
      sender: currentUser._id,
      message,
      imageUrl,
    };

    const res = await sendMessage(messageBody);
    if (res) setMessages((prev) => [...prev, res]);
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        {/* 🩷 Header with profile */}
        <div className="p-3 bg-pink-50 border-b border-pink-200 dark:bg-pink-900 dark:border-pink-700">
          {chatPartner && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  className="w-12 h-12 rounded-full"
                  src={chatPartner.avatar || '/default-avatar.png'}
                  alt={chatPartner.username}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chatPartner.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Private chat</p>
              </div>
            </div>
          )}
        </div>

        {/* 💬 Messages */}
        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-pink-50 border-b border-pink-200 dark:bg-pink-900 dark:border-pink-700">
          <ul className="space-y-2">
            {messages
              .filter((msg) => msg && msg.sender)
              .map((message, index) => (
                <div key={index} ref={scrollRef}>
                  <Message
                    message={message}
                    self={currentUser._id}
                    isGroupChat={false}
                    avatars={{
                      [chatPartner?._id]: chatPartner?.avatar,
                      [currentUser?._id]: currentUser?.avatar,
                    }}
                  />
                </div>
              ))}
          </ul>
        </div>

        {/* 📝 Chat Input */}
        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
