import { ChatIcon, UserGroupIcon, GlobeIcon } from '@heroicons/react/outline';
import { useCallback, useState } from 'react';
import ChatRoom from '../chat/ChatRoom';
import GroupChatRoom from '../chat/GroupChatRoom';
import Welcome from '../chat/Welcome';
import AllUsers from '../chat/AllUsers';
import GroupChatList from '../chat/GroupChatList';
import GlobalChatList from '../chat/GlobalChatList';
import GlobalChatRoom from '../chat/GlobalChatRoom';

export default function ChatLayout() {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'
  const [currentDirectChatRoom, setCurrentDirectChatRoom] = useState(null);
  const [currentGroupChatRoom, setCurrentGroupChatRoom] = useState(null);

  const isChatOpened = useCallback(() => {
    return activeTab === 'direct'
      ? currentDirectChatRoom !== null
      : activeTab === 'groups'
      ? currentGroupChatRoom !== null
      : true;
  }, [activeTab, currentDirectChatRoom, currentGroupChatRoom]);

  return (
    <div className="container mx-auto h-[847px] ">
      <div className="min-w-full h-full bg-pink-50 border-x border-b border-pink-200 dark:bg-pink-900 dark:border-pink-700 rounded lg:grid lg:grid-cols-3">
        <div className="bg-pink-50 border-r border-pink-200 dark:bg-pink-900 dark:border-pink-700 lg:col-span-1">
          {/* Tabs */}
          <div className="flex border-b border-pink-200 dark:border-pink-700">
            <button
              onClick={() => setActiveTab('direct')}
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
              onClick={() => setActiveTab('groups')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'groups'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              Groups
            </button>

            <button
              onClick={() => {
                setActiveTab('global');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'global'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <GlobeIcon className="w-5 h-5" />
              Global
            </button>
          </div>

          {activeTab === 'direct' ? (
            <AllUsers onChangeChat={(chatroom) => setCurrentDirectChatRoom(chatroom)} />
          ) : activeTab === 'groups' ? (
            <GroupChatList onChangeChat={(chatroom) => setCurrentGroupChatRoom(chatroom)} />
          ) : (
            <GlobalChatList />
          )}
        </div>

        {isChatOpened() ? (
          activeTab === 'direct' ? (
            <ChatRoom chatRoom={currentDirectChatRoom} />
          ) : activeTab === 'groups' ? (
            <GroupChatRoom chatRoom={currentGroupChatRoom} />
          ) : (
            <GlobalChatRoom />
          )
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}
