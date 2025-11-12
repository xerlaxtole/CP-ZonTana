import { useState, useEffect } from 'react';

import { createChatRoom } from '../../services/ChatService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Contact from './Contact';
import UserLayout from '../layouts/UserLayout';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AllUsers({ changeChat }) {
  const { currentUser } = useAuth();
  const {
    users,
    filteredUsers,
    chatRooms,
    filteredRooms,
    onlineUsersId,
    searchQuery,
    refreshChatRooms,
  } = useChat();

  const [displayUsers, setDisplayUsers] = useState([]);
  const [displayChatRooms, setDisplayChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState();
  const [nonContacts, setNonContacts] = useState([]);
  const [contactIds, setContactIds] = useState([]);

  // Determine which lists to use based on search query
  useEffect(() => {
    if (searchQuery !== '') {
      setDisplayUsers(filteredUsers);
      setDisplayChatRooms(filteredRooms);
    } else {
      setDisplayUsers(users);
      setDisplayChatRooms(chatRooms);
    }
  }, [searchQuery, filteredUsers, filteredRooms, users, onlineUsersId, chatRooms]);

  useEffect(() => {
    if (!displayChatRooms) return;

    const ids = displayChatRooms.map((chatRoom) => {
      return chatRoom.members.find((memberId) => {
        return memberId !== currentUser._id;
      });
    });

    //console.log("Contact IDs:", ids);
    setContactIds(ids);
  }, [displayChatRooms, currentUser._id]);

  useEffect(() => {
    if (!displayUsers) return;

    const nonContacts = displayUsers.filter(
      (f) => f._id !== currentUser._id && !contactIds.includes(f._id),
    );

    //console.log("Non-contacts:", nonContacts);
    setNonContacts(nonContacts);
  }, [contactIds, displayUsers, currentUser._id]);

  const changeCurrentChat = (index, chat) => {
    setSelectedChat(index);
    changeChat(chat);
  };

  const handleNewChatRoom = async (user) => {
    const members = {
      senderId: currentUser._id,
      receiverId: user._id,
    };
    const res = await createChatRoom(members);
    console.log('New chat room created:', res);

    // Refresh chat rooms to include the new one
    await refreshChatRooms();

    changeChat(res);
  };

  return (
    <>
      <ul className="overflow-auto h-[30rem]">
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">Chats</h2>
        <li>
          {displayChatRooms &&
            displayChatRooms.map((chatRoom, index) => (
              <div
                key={index}
                className={classNames(
                  index === selectedChat
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'transition duration-150 ease-in-out cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700',
                  'flex items-center px-3 py-2 text-sm ',
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <Contact
                  chatRoom={chatRoom}
                  onlineUsersId={onlineUsersId}
                  currentUser={currentUser}
                />
              </div>
            ))}
        </li>
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">Other Users</h2>
        <li>
          {nonContacts.map((nonContact, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleNewChatRoom(nonContact)}
            >
              <UserLayout user={nonContact} onlineUsersId={onlineUsersId} />
            </div>
          ))}
        </li>
      </ul>
    </>
  );
}
