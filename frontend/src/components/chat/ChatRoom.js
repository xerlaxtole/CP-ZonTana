import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import Message from './Message';
import Contact from './Contact';
import ChatForm from './ChatForm';

export default function ChatRoom({ chatRoom }) {
  const { currentUser, socket, isSocketConnected } = useChat();
  const [messages, setMessages] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [, setIsRoomJoined] = useState(false);

  const scrollRef = useRef();

  // Join/leave socket room and load messages when chatRoom changes
  useEffect(() => {
    if (!socket || !chatRoom || !isSocketConnected) return;

    // Clear previous messages when switching rooms
    setMessages([]);
    setIncomingMessages([]);

    // Join the chat room
    socket.emit('join-room', { roomId: chatRoom._id }, (response) => {
      if (response && response.success) {
        console.log('Successfully joined room:', response.roomId);
        setIsRoomJoined(true);
      } else {
        console.error('Failed to join room');
        setIsRoomJoined(false);
      }
    });

    // Load messages via socket
    socket.emit('loadMessages', { chatRoomId: chatRoom._id }, (response) => {
      if (response.success) {
        setMessages(response.messages);
      } else {
        console.error('Failed to load messages:', response.error);
      }
    });

    // Leave room on cleanup
    return () => {
      socket.emit('leave-room', { roomId: chatRoom._id });
      setIsRoomJoined(false);
    };
  }, [socket, chatRoom, isSocketConnected]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // Handle incoming messages via socket
  useEffect(() => {
    if (!socket || !chatRoom) return;

    const handleReceiveMessage = (data) => {
      console.log('Received message via socket:', data);
      const { chatRoomId, sender, message, imageUrl, _id, createdAt } = data;

      // Only add if it's for this chat room
      if (chatRoomId !== chatRoom._id) {
        console.log('Message not for this room. Expected:', chatRoom._id, 'Got:', chatRoomId);
        return;
      }

      const incomingMessage = {
        _id,
        sender,
        message,
        imageUrl,
        createdAt,
      };
      console.log('Adding message to state:', incomingMessage);
      setIncomingMessages((prev) => [...prev, incomingMessage]);
    };

    socket.on('receiveDirectMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveDirectMessage', handleReceiveMessage);
    };
  }, [socket, chatRoom]);

  // Append incoming messages to the message list
  useEffect(() => {
    if (incomingMessages.length > 0) {
      setMessages((prev) => [...prev, ...incomingMessages]);
      setIncomingMessages([]);
    }
  }, [incomingMessages]);

  // Handle form submission to send a new message
  const handleFormSubmit = useCallback(
    async (message, imageUrl) => {
      if (!socket || !currentUser || !chatRoom) return;

      socket.emit(
        'sendDirectMessage',
        {
          chatRoomId: chatRoom._id,
          sender: currentUser.username,
          message,
          imageUrl,
        },
        (response) => {
          if (response.success) {
            // Message saved and will be received via 'receiveDirectMessage' listener
            // No need to update state here as the socket listener will handle it
          } else {
            console.error('Failed to send message:', response.error);
            alert('Failed to send message. Please try again.');
          }
        },
      );
    },
    [socket, currentUser, chatRoom],
  );

  return (
    <div className="lg:col-span-2 lg:block bg-white border-b-0 dark:bg-gray-700 dark:border-gray-ng-pink-500 rounded-lg ">
      <div className="w-full  ">
        <div className="p-3 bg-pink-50 h-[73px] border-b-0 border-pink-700 dark:bg-pink-800 dark:border-pink-900">
          <Contact chatRoom={chatRoom} />
        </div>

        <div className="relative w-full p-6 overflow-y-auto h-[43rem] bg-white  dark:bg-gray-700 dark:border-gray-ng-pink-500 ">
          <ul className="space-y-2 ">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message message={message} />
              </div>
            ))}
          </ul>
        </div>

        <ChatForm  handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
