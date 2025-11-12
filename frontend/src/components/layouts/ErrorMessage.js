import { XCircleIcon } from '@heroicons/react/solid';
import { useAuth } from '../../contexts/AuthContext';

export default function ErrorMessage() {
  const { error, setError } = useAuth();

  return (
    error && (
      <div className="flex justify-center">
        <div className="rounded-md max-w-md w-full bg-pink-50 border border-pink-200 dark:bg-pink-900 dark:border-pink-700 p-4 mt-4 shadow-sm">
          <div className="flex items-start">
            <button
              onClick={() => setError('')}
              className="flex-shrink-0 text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 focus:outline-none"
            >
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-pink-800 dark:text-pink-200">
                Error: {error}
              </h3>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
