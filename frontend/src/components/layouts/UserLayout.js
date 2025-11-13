import { useChat } from '../../contexts/ChatContext';

export default function UserLayout({ user }) {
  const { isUserOnline } = useChat();

  return (
    <div className="relative flex items-center">
      <img
        className="w-10 h-10 rounded-full"
        src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
        alt={user?.username || 'User'}
        onError={(e) => {
          e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
        }}
      />
      <span className="block ml-2 text-gray-500 dark:text-gray-400">{user?.username}</span>
      {isUserOnline(user?.username) ? (
        <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-green-500 dark:bg-green-400 border-2 border-white rounded-full"></span>
      ) : (
        <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-gray-400 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
}
