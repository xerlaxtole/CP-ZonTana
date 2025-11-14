import React, { useState } from 'react';
import { XIcon } from '@heroicons/react/solid';
import { useChat } from '../../contexts/ChatContext';

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const { currentUser } = useChat();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateGroup({
        name: groupName.trim(),
        description: description.trim(),
        createdBy: currentUser.username,
      });
      // Reset form and close modal
      setGroupName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setDescription('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-pink-200 dark:bg-pink-700 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-pink-600">
          <h2 className="text-x1 font-semibold text-pink-700 dark:text-white mb-2">
            Create Group Chat
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 dark:hover:text-gray-100"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-pink-700 dark:text-pink-200 mb-2"
            >
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-pink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-pink-800 dark:text-white"
              placeholder="Enter group name"
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-pink-700 dark:text-pink-200 mb-2"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-pink-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-pink-800 dark:text-white resize-none"
              placeholder="Enter group description"
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-pink-600 rounded-lg text-white hover:bg-pink-600 dark:hover:bg-pink-800 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-pink-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
