import { format } from 'timeago.js';
import { useChat } from '../../contexts/ChatContext';
import { useState, useEffect } from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Message({ message, isGroupChat = false, senderAvatar }) {
  const { currentUser, isUserOnline } = useChat();
  const isOwn = currentUser.username === message.sender;

  // Auto-update timestamp every 60 seconds
  const [formattedTime, setFormattedTime] = useState(() => format(message.createdAt));

  useEffect(() => {
    // Update immediately to ensure fresh timestamp
    setFormattedTime(format(message.createdAt));

    // Set interval for periodic updates (every 60 seconds)
    const interval = setInterval(() => {
      setFormattedTime(format(message.createdAt));
    }, 60000);

    // Cleanup: clear interval on unmount
    return () => clearInterval(interval);
  }, [message.createdAt]);

  // System messages (user joined, etc.)
  if (message.isSystemMessage) {
    return (
      <li className="flex justify-center my-2">
        <div className="text-center">
          <span className="text-sm italic text-pink-500 dark:text-pink-400">{message.message}</span>
          <span className="block text-xs text-pink-400 dark:text-pink-500 mt-1">
            {formattedTime}
          </span>
        </div>
      </li>
    );
  }

  return (
    <>
      <li className={classNames(isOwn ? 'justify-end' : 'justify-start', 'flex')}>
        <div>
          {/* Show sender name in group chats for messages from others */}
          {isGroupChat && !isOwn && (
            <p className="text-xs font-medium text-pink-600 dark:text-pink-400 mb-1 ml-10">
              {message.sender}
            </p>
          )}
          <div className="flex gap-2 items-start">
            {/* Show avatar for group chat messages from others */}
            {isGroupChat && !isOwn && senderAvatar && (
              <div className="relative flex-shrink-0">
                <img className="w-8 h-8 rounded-full" src={senderAvatar} alt={message.sender} />
                {/* Online indicator dot */}
                {isUserOnline(message.sender) ? (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 dark:bg-green-400 border-2 border-white rounded-full"></span>
                ) : (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></span>
                )}
              </div>
            )}
            <div>
              <div
                className={classNames(
                  isOwn
                    ? 'bg-pink-600 dark:bg-pink-500 text-white'
                    : 'text-gray-700 dark:text-gray-400 bg-white border border-pink-200 shadow-md dark:bg-pink-900 dark:border-pink-700',
                  'relative inline-block max-w-xl px-4 py-2 rounded-lg shadow',
                )}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-w-xs max-h-64 rounded-lg mb-2 object-contain"
                  />
                )}
                {message.message && <span className="font-normal">{message.message}</span>}
              </div>
              <span className="block text-sm text-pink-500 dark:text-pink-400">
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </li>
    </>
  );
}
