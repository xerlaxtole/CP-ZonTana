import axios from 'axios';

// Use environment variables for API URLs
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Configure axios to include credentials (cookies) with requests
axios.defaults.withCredentials = true;

const createHeader = () => {
  const payloadHeader = {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
  };
  return payloadHeader;
};

export const getAllUsers = async () => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/user`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getUser = async (username) => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/user/${username}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getChatRooms = async (username) => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/room/${username}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getChatRoomOfUsers = async (firstUsername, secondUsername) => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/room/${firstUsername}/${secondUsername}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Note: The following functions are now handled via socket.io
// - createChatRoom -> socket.emit('createChatRoom')
// - getMessagesOfChatRoom -> socket.emit('loadMessages')
// - sendMessage -> socket.emit('sendDirectMessage')
// - createGroupChatRoom -> socket.emit('createGroup')
// - sendGroupMessage -> socket.emit('sendGroupMessage')
// - joinGroupChatRoom -> socket.emit('joinGroup')
// - getGroupMessages -> socket.emit('loadGroupMessages')

// Group Chat API functions

export const getAllGroupChatRooms = async () => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/group/all`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getGroupChatRoomsOfUser = async (username) => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/group/user/${username}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getGroupChatRoomById = async (groupName) => {
  const header = createHeader();

  try {
    const res = await axios.get(`${baseURL}/group/${groupName}`, header);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
