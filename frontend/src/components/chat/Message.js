import { useChat } from '../../contexts/ChatContext';
import { useState, useEffect } from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatTimestamp(dateString) {
  const messageDate = new Date(dateString);
  const now = new Date();

  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  // Show "Just now" for messages less than 60 seconds old
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Convert UTC (+0) to +7 timezone
  const utcTime = messageDate.getTime();
  const offsetMs = 7 * 60 * 60 * 1000; // +7 hours in milliseconds
  const localDate = new Date(utcTime + offsetMs);

  // Format as HH:MM
  const hours = localDate.getUTCHours().toString().padStart(2, '0');
  const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export default function Message({ message, isGroupChat = false, senderAvatar }) {
  const { currentUser, isUserOnline } = useChat();
  const isOwn = currentUser.username === message.sender;

  // Auto-update timestamp every 60 seconds to update "Just now" status
  const [formattedTime, setFormattedTime] = useState(() => formatTimestamp(message.createdAt));

  useEffect(() => {
    // Update immediately to ensure fresh timestamp
    setFormattedTime(formatTimestamp(message.createdAt));

    // Set interval for periodic updates (every 60 seconds)
    const interval = setInterval(() => {
      setFormattedTime(formatTimestamp(message.createdAt));
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
          <span className="block text-xs text-pink-1000 dark:text-pink-500 mt-1">
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
          <div className={classNames(isOwn ? 'flex-row-reverse' : 'flex-row', 'flex gap-2 items-end')}>
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

            <div className="flex-1">
              <div
                className={classNames(
                  isOwn
                    ? ' bg-gradient-radial from-pink-400 via-pink-400 to-pink-600 dark:bg-gradient-radial dark:from-pink-500 dark:via-pink-600 dark:to-pink-800 text-white'
                    : ' text-gray-700 dark:text-gray-400 bg-gradient-radial from-pink-50 via-white to-pink-100 border border-pink-200 shadow-md dark:bg-gradient-radial dark:from-pink-800 dark:via-pink-900 dark:to-gray-900 dark:border-pink-700',
                  'relative inline-block max-w-xl px-4 py-2 rounded-3xl shadow',
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
            </div>

            {/* Timestamp - appears after receiver bubble (right), before sender bubble (left) */}
            <span className="text-[10px] text-pink-500 dark:text-pink-400 self-end pb-1">
              {formattedTime}
            </span>
          </div>
        </div>
      </li>
    </>
  );
}
