import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';

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

export default function GroupMembersSidebar({ isOpen, onClose, members, allUsers, isUserOnline }) {
  // Get full user object by username
  const getUserByUsername = (username) => {
    return allUsers?.find((u) => u.username === username);
  };

  const sortedMembers = sortGroupMembers(members || [], isUserOnline);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-pink-500 bg-opacity-75 dark:bg-pink-900 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-pink-900 shadow-xl">
                    {/* Header */}
                    <div className="bg-pink-600 dark:bg-pink-700 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          Group Members ({members?.length || 0})
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-pink-600 dark:bg-pink-700 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Member List */}
                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                      <div className="space-y-3">
                        {sortedMembers.map((username) => {
                          const user = getUserByUsername(username);
                          const online = isUserOnline(username);

                          return (
                            <div
                              key={username}
                              className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-800 hover:bg-pink-100 dark:hover:bg-pink-700 transition"
                            >
                              <div className="relative flex-shrink-0">
                                <img
                                  className="w-12 h-12 rounded-full"
                                  src={user?.avatar || ''}
                                  alt={username}
                                />
                                {/* Online status indicator */}
                                <span
                                  className={classNames(
                                    online
                                      ? 'bg-green-500 dark:bg-green-400'
                                      : 'bg-gray-400 dark:bg-gray-500',
                                    'absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-gray-800',
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {online ? 'Online' : 'Offline'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
