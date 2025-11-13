import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { socket } from '../socket';
import { getAllUsers } from '../services/ChatService';
import { useCallback } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsernames, setOnlineUsernames] = useState([]);

  // Socket connection state
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  const refetchUsers = useCallback(async () => {
    if (!currentUser) return;
    const users = await getAllUsers();
    setAllUsers(users);
  }, [currentUser]);

  useEffect(() => {
    refetchUsers();
  }, [refetchUsers]);

  // Initialize socket connection
  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!currentUser) {
      setIsSocketConnected(false);
      setSocketError('User not authenticated');
      return;
    }

    socket.connect();

    // Connection successful
    socket.on('connect', () => {
      console.log('ChatContext: Socket connected');
      setIsSocketConnected(true);
      setSocketError(null);

      // Add user to online users (mirrors server's addUser event)
      socket.emit('addUser', currentUser.username);
    });

    // Handle reconnection after server restart
    socket.on('reconnect', () => {
      console.log('ChatContext: Socket reconnected');
      setIsSocketConnected(true);
      setSocketError(null);

      // Re-register user as online after reconnection
      socket.emit('addUser', currentUser.username);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('ChatContext: Socket connection error:', error.message);
      setIsSocketConnected(false);
      setSocketError(error.message);

      // Log additional details for debugging
      if (error.message.includes('token')) {
        console.error('ChatContext: Authentication failed - Check if JWT token is valid');
      }
      if (error.message.includes('CORS')) {
        console.error('ChatContext: CORS error - Check server CORS configuration');
      }
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('ChatContext: Socket disconnected:', reason);
      setIsSocketConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected the socket, try to reconnect manually
        console.log('ChatContext: Server disconnected - attempting to reconnect');
        socket.connect();
      }
    });

    socket.on('new:user', async () => {
      // Refetch users when a new user is added to the database
      if (!currentUser) return;
      const users = await getAllUsers();
      setAllUsers(users);
    });

    socket.on('update:online-usernames', async (usernames) => {
      setOnlineUsernames(usernames);
    });

    return () => {
      socket.off('connect');
      socket.off('reconnect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new:user');
      socket.off('update:online-usernames');
      socket.disconnect();
      console.log('ChatContext: Socket disconnected on cleanup');
    };
  }, [currentUser]);

  const isUserOnline = useCallback(
    (username) => {
      return onlineUsernames.includes(username);
    },
    [onlineUsernames],
  );

  const value = {
    socket,
    isSocketConnected,
    socketError,
    currentUser,
    allUsers,
    onlineUsernames,
    isUserOnline,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
