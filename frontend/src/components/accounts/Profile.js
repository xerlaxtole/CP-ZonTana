import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

// Import avatars from backend
const avatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Boots',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Snickers',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Smokey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Shadow',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState();
  const [loading, setLoading] = useState(false);

  const { currentUser, updateAvatar, error, setError } = useAuth();

  useEffect(() => {
    // Find the index of the current user's avatar
    if (currentUser?.avatar) {
      const currentIndex = avatars.findIndex((av) => av === currentUser.avatar);
      if (currentIndex !== -1) {
        setSelectedAvatar(currentIndex);
      }
    }
  }, [currentUser]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedAvatar === undefined) {
      return setError('Please select an avatar');
    }

    try {
      setError('');
      setLoading(true);
      await updateAvatar(avatars[selectedAvatar]);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-4 text-3xl text-center tracking-tight font-light dark:text-white">
            Pick an avatar
          </h2>
          {currentUser && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Logged in as: {currentUser.username}
            </p>
          )}
        </div>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          <div className="flex flex-wrap justify-center -m-1 md:-m-2 bg-pink-100 dark:bg-pink-800 p-4 rounded-lg">
            {avatars.map((avatar, index) => (
              <div key={index} className="flex flex-wrap w-1/3">
                <div className="w-full p-1 md:p-2">
                  <img
                    alt={`Avatar ${index + 1}`}
                    className={classNames(
                      index === selectedAvatar
                        ? 'border-4 border-pink-600 dark:border-pink-400'
                        : 'cursor-pointer hover:border-4 hover:border-pink-600',
                      'block object-cover object-center w-24 h-24 rounded-full mx-auto',
                    )}
                    src={avatar}
                    onClick={() => setSelectedAvatar(index)}
                  />
                </div>
              </div>
            ))}
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Avatar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
