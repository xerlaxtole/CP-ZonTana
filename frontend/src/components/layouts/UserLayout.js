export default function UserLayout({ user, onlineUsersId }) {
  const isOnline = onlineUsersId?.includes(user?._id);

  return (
    <div className="relative flex items-center p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-800 transition">
      <img
        className="w-10 h-10 rounded-full border-2 border-pink-300 dark:border-pink-400"
        src={user?.avatar}
        alt={`${user?.username}'s avatar`}
      />
      <span className="block ml-2 text-pink-700 dark:text-pink-300 font-medium">
        {user?.username}
      </span>
      {isOnline ? (
        <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-pink-500 dark:bg-pink-400 border-2 border-white rounded-full"></span>
      ) : (
        <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-gray-400 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
}
