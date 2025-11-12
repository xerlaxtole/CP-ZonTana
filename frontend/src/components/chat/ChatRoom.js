import { useState, useEffect, useRef } from 'react';

import { getMessagesOfChatRoom, sendMessage } from '../../services/ChatService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

import Message from './Message';
import Contact from './Contact';
import ChatForm from './ChatForm';

export default function ChatRoom() {
  const { currentUser } = useAuth();
  const { socket, currentChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res);
    };

    fetchData();
  }, [currentChat._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    socket?.on('getMessage', (data) => {
      if (data.chatRoomId === currentChat._id) {
        setIncomingMessage({
          sender: data.senderId,
          message: data.message,
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
        });
      }
    });

    return () => {
      socket?.off('getMessage');
    };
  }, [socket, currentChat._id]);

  useEffect(() => {
    if (incomingMessage) {
      setMessages((prev) => [...prev, incomingMessage]);
    }
  }, [incomingMessage]);

  const handleFormSubmit = async (message, imageUrl) => {
    const receiverId = currentChat.members.find((memberId) => memberId !== currentUser._id);

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
    setMessages((prev) => [...prev, res]);
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <Contact chatRoom={currentChat} currentUser={currentUser} />
        </div>

        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message message={message} self={currentUser._id} />
              </div>
            ))}
          </ul>
        </div>

        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
