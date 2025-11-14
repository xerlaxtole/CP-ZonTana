import { useState, useEffect } from 'react';
import { UserGroupIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { Disclosure, Transition } from '@headlessui/react';
import { getAllGroupChatRooms } from '../../services/ChatService';
import { useChat } from '../../contexts/ChatContext';
import CreateGroupModal from './CreateGroupModal';
import { socket } from '../../socket';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function sortGroupMembers(members, isUserOnline) {
  return [...members].sort((a, b) => {
    const aOnline = isUserOnline(a);
    const bOnline = isUserOnline(b);
    if (aOnline !== bOnline) return bOnline ? 1 : -1;
    return a.localeCompare(b);
  });
}

export default function GroupChatList({ onChangeChat }) {
  const { currentUser, isUserOnline } = useChat();
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [, setSelectedChatIdx] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      const allGroups = await getAllGroupChatRooms();

      const joinedGroups = allGroups.filter((group) =>
        group.members.some((memberName) => memberName === currentUser.username),
      );
      setMyGroups(joinedGroups);

      const notJoinedGroups = allGroups.filter(
        (group) => !group.members.some((memberName) => memberName === currentUser.username),
      );
      setAvailableGroups(notJoinedGroups);
    };
    fetchGroups();
  }, [currentUser]);

  // Listen for new groups created by other users
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewGroup = (newGroup) => {
      // Avoid duplicates and add to appropriate list based on membership
      setMyGroups((prev) => {
        const alreadyExists = prev.some((g) => g.name === newGroup.name);
        if (alreadyExists || !newGroup.members.includes(currentUser.username)) return prev;
        return [...prev, newGroup];
      });

      setAvailableGroups((prev) => {
        const alreadyExists = prev.some((g) => g.name === newGroup.name);
        if (alreadyExists || newGroup.members.includes(currentUser.username)) return prev;
        return [...prev, newGroup];
      });
    };

    socket.on('newGroupCreated', handleNewGroup);
    return () => socket.off('newGroupCreated', handleNewGroup);
  }, [currentUser]);

  // Listen for member count updates when users join groups
  useEffect(() => {
    if (!socket) return;

    const handleMemberUpdate = ({ groupName, members }) => {
      setMyGroups((prev) => prev.map((g) => (g.name === groupName ? { ...g, members } : g)));
      setAvailableGroups((prev) => prev.map((g) => (g.name === groupName ? { ...g, members } : g)));
    };

    socket.on('groupMemberCountUpdated', handleMemberUpdate);
    return () => socket.off('groupMemberCountUpdated', handleMemberUpdate);
  }, []);

  const changeCurrentGroupChat = (index, chat) => {
    setSelectedChatIdx(index);
    onChangeChat(chat);
  };

  const handleCreateGroup = async (data) => {
    const { name, description, createdBy } = data;

    if (!socket) return;

    socket.emit(
      'createGroup',
      {
        name,
        description,
        createdBy,
      },
      (response) => {
        if (response.success) {
          const groupChatRoom = response.group;

          // Update myGroups and availableGroups state
          setMyGroups((prevGroups) => [...prevGroups, groupChatRoom]);
          setAvailableGroups((prevGroups) =>
            prevGroups.filter((group) => group.name !== groupChatRoom.name),
          );

          // Automatically switch to the newly created group
          const newGroupIndex = myGroups.length; // It's at the end of the array
          changeCurrentGroupChat(newGroupIndex, groupChatRoom);
        } else {
          console.error('Failed to create group:', response.error);
          alert('Failed to create group. Please try again.');
        }
      },
    );
  };

  const handleJoinGroup = async (group) => {
    if (!currentUser || !socket) return;
    setShowCreateGroupModal(false);

    socket.emit(
      'joinGroup',
      {
        groupName: group.name,
        username: currentUser.username,
      },
      (response) => {
        if (response.success) {
          const joinedGroup = response.group;

          // Update myGroups and availableGroups state
          setMyGroups((prevGroups) => [...prevGroups, joinedGroup]);
          setAvailableGroups((prevGroups) => prevGroups.filter((g) => g.name !== joinedGroup.name));

          // Automatically switch to the newly joined group
          const newGroupIndex = myGroups.length; // It's at the end of the array
          changeCurrentGroupChat(newGroupIndex, joinedGroup);
        } else {
          console.error('Failed to join group:', response.error);
          alert('Failed to join group. Please try again.');
        }
      },
    );
  };

  return (
    <>
      <div className="overflow-auto h-[45rem]">
        {/* My Groups Section */}
        <div className="flex items-center justify-between my-2 ml-2 mr-2">
          <h2 className="text-x1 font-semibold text-pink-700 dark:text-white mb-2">My Groups</h2>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            title="Create new group"
          >
            <PlusIcon className="w-4 h-4" />
            Create
          </button>
        </div>
        <ul>
          {myGroups.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              You haven't joined any groups yet
            </li>
          ) : (
            myGroups.map((group, index) => (
              <li key={group.name} className="border-b border-pink-200 dark:border-pink-700">
                {/* Member dropdown */}
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer">
                        {/* Left side: Group info (clickable) */}
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0"
                          onClick={() => changeCurrentGroupChat(index, group)}
                        >
                          <div className="relative">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={group.avatar}
                              alt={group.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {group.name}
                              </p>
                              <UserGroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {group.members.length} member
                              {group.members.length !== 1 ? 's' : ''} •{' '}
                              {group.members.filter((member) => isUserOnline(member)).length} online
                            </p>
                          </div>
                        </div>

                        {/* Right side: Dropdown toggle */}
                        <Disclosure.Button
                          className="ml-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-pink-600 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDownIcon
                            className={classNames(
                              open ? 'rotate-180' : '',
                              'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform',
                            )}
                          />
                        </Disclosure.Button>
                      </div>

                      {/* Member list (below) */}
                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="px-3 pb-2 bg-pink-50 dark:bg-pink-800 max-h-[240px] overflow-y-auto scroll-smooth">
                          {sortGroupMembers(group.members, isUserOnline).map((username) => (
                            <div
                              key={username}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <div
                                className={classNames(
                                  isUserOnline(username)
                                    ? 'bg-green-500 dark:bg-green-400'
                                    : 'bg-gray-400',
                                  'w-2 h-2 rounded-full',
                                )}
                              />
                              <span>{username}</span>
                            </div>
                          ))}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </li>
            ))
          )}
        </ul>

        {/* Available Groups Section */}
        <h2 className="my-2 mb-2 ml-2 text-x1 font-semibold text-pink-700 dark:text-white">
          Available Groups
        </h2>
        <ul>
          {availableGroups.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No available groups to join
            </li>
          ) : (
            availableGroups.map((group) => (
              <li key={group.name} className="border-b border-pink-200 dark:border-pink-700">
                {/* Member dropdown */}
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-pink-100 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-pink-700 cursor-pointer">
                        {/* Left side: Group info and join button */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={group.avatar}
                              alt={group.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {group.name}
                              </p>
                              <UserGroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {group.members.length} member
                              {group.members.length !== 1 ? 's' : ''} •{' '}
                              {group.members.filter((member) => isUserOnline(member)).length} online
                            </p>
                          </div>
                          <button
                            onClick={() => handleJoinGroup(group)}
                            className="ml-2 px-3 py-1 text-xs bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition flex-shrink-0"
                          >
                            Join
                          </button>
                        </div>

                        {/* Right side: Dropdown toggle */}
                        <Disclosure.Button
                          className="ml-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-pink-600 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDownIcon
                            className={classNames(
                              open ? 'rotate-180' : '',
                              'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform',
                            )}
                          />
                        </Disclosure.Button>
                      </div>

                      {/* Member list (below) */}
                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="px-3 pb-2 bg-pink-50 dark:bg-pink-800 max-h-[240px] overflow-y-auto scroll-smooth">
                          {sortGroupMembers(group.members, isUserOnline).map((username) => (
                            <div
                              key={username}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <div
                                className={classNames(
                                  isUserOnline(username)
                                    ? 'bg-green-500 dark:bg-green-400'
                                    : 'bg-gray-400',
                                  'w-2 h-2 rounded-full',
                                )}
                              />
                              <span>{username}</span>
                            </div>
                          ))}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </li>
            ))
          )}
        </ul>
      </div>
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
    </>
  );
}
