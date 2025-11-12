import { format } from 'timeago.js';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Message({ message, self, isGroupChat = false, avatars }) {
  const isOwn = self === message.sender;
  const senderAvatar = avatars[message.sender] || ''; // Get the avatar from the state

  return (
    <li className={classNames(isOwn ? 'justify-end' : 'justify-start', 'flex')}>
      <div>
        {/* Show sender name and avatar in group chats for messages from others */}
        {isGroupChat && !isOwn && (
          <div className="flex items-center">
            <img src={senderAvatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 ml-1">
              {message.senderUsername}
            </p>
          </div>
        )}
        <div
          className={classNames(
            isOwn
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-400 bg-white border border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700',
            'relative max-w-xl px-4 py-2 rounded-lg shadow',
          )}
        >
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="max-w-xs max-h-64 rounded-lg mb-2 object-contain"
            />
          )}
          {message.message && <span className="block font-normal ">{message.message}</span>}
        </div>
        <span className="block text-sm text-gray-700 dark:text-gray-400">
          {format(message.createdAt)}
        </span>
      </div>
    </li>
  );
}
