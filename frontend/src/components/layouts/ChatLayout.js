import { ChatIcon, UserGroupIcon } from '@heroicons/react/outline';
import { createGroupChatRoom } from '../../services/ChatService';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

import ChatRoom from '../chat/ChatRoom';
import GroupChatRoom from '../chat/GroupChatRoom';
import Welcome from '../chat/Welcome';
import AllUsers from '../chat/AllUsers';
import GroupChatList from '../chat/GroupChatList';
import SearchUsers from '../chat/SearchUsers';
import CreateGroupModal from '../chat/CreateGroupModal';

export default function ChatLayout() {
  const { currentUser } = useAuth();
  const {
    currentChat,
    chatType,
    setSearchQuery,
    activeTab,
    setActiveTab,
    isCreateGroupModalOpen,
    setIsCreateGroupModalOpen,
    setCurrentChat,
    refreshGroups,
  } = useChat();

  const handleChatChange = (chat) => {
    setCurrentChat(chat, 'direct');
  };

  const handleGroupChatChange = (chat) => {
    setCurrentChat(chat, 'group');
  };

  const handleCreateGroup = async (groupData) => {
    await createGroupChatRoom(groupData);
    await refreshGroups();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentChat(null, 'direct'); // Clear current chat when switching tabs
    setSearchQuery(''); // Clear search
  };

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full bg-pink-50 border-x border-b border-pink-200 dark:bg-pink-900 dark:border-pink-700 rounded lg:grid lg:grid-cols-3">
        <div className="bg-pink-50 border-r border-pink-200 dark:bg-pink-900 dark:border-pink-700 lg:col-span-1">
          {/* Tabs */}
          <div className="flex border-b border-pink-200 dark:border-pink-700">
            <button
              onClick={() => handleTabChange('direct')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'direct'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <ChatIcon className="w-5 h-5" />
              Direct Messages
            </button>
            <button
              onClick={() => handleTabChange('groups')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'groups'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              Groups
            </button>
          </div>

          {activeTab === 'direct' ? (
            <>
              <SearchUsers handleSearch={handleSearch} />
              <AllUsers changeChat={handleChatChange} />
            </>
          ) : (
            <GroupChatList
              changeChat={handleGroupChatChange}
              onCreateGroupClick={() => setIsCreateGroupModalOpen(true)}
            />
          )}
        </div>

        {currentChat ? chatType === 'group' ? <GroupChatRoom /> : <ChatRoom /> : <Welcome />}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        currentUser={currentUser}
      />
    </div>
  );
}
