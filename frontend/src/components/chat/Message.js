import { format } from 'timeago.js';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Message({ message, self, isGroupChat = false, avatars }) {
  const isOwn = self === message.sender;
  const senderAvatar = avatars?.[message.sender] || '/default-avatar.png';

  return (
    <li className={classNames(isOwn ? 'justify-end' : 'justify-start', 'flex')}>
      <div>
        {/* For group or private messages from others */}
        {!isOwn && (
          <div className="flex items-center mb-1">
            <img src={senderAvatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
            {isGroupChat && (
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">
                {message.senderUsername || ''}
              </p>
            )}
          </div>
        )}

        <div
          className={classNames(
            isOwn
              ? 'bg-pink-600 dark:bg-pink-500 text-white'
              : 'text-gray-700 dark:text-gray-300 bg-white border border-pink-200 shadow-md dark:bg-pink-950 dark:border-pink-700',
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
          {message.message && <span className="block font-normal">{message.message}</span>}
        </div>

        <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
          {format(message.createdAt)}
        </span>
      </div>
    </li>
  );
}
