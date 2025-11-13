import { format } from 'timeago.js';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Message({ message, self, isGroupChat = false }) {
  const isOwn = self === message.sender;

  return (
    <>
      <li className={classNames(isOwn ? 'justify-end' : 'justify-start', 'flex')}>
        <div>
          {/* Show sender name in group chats for messages from others */}
          {isGroupChat && !isOwn && (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 ml-1">
              {message.sender}
            </p>
          )}
          <div
            className={classNames(
              isOwn
                ? 'bg-gradient-to-r from-dark-blue to-primary-blue text-white shadow-md'
                : 'bg-gradient-to-r from-primary-cyan to-primary-green text-white shadow-md',
              'relative max-w-xl px-4 py-2 rounded-2xl',
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
            <span className="block text-[10px] text-white/70 mt-1">
              {format(message.createdAt)}
            </span>
          </div>
        </div>
      </li>
    </>
  );
}
